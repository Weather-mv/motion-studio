'use strict';
// Local dashboard for Claude Code and Remotion renders. Three ways to run this file:
//   node server.js              start the server
//   node server.js --ping       exit 0 if this server is already running (used by start.bat)
//   node server.js --hook NAME  tell the server about a Claude Code hook event (used by Claude Code)

const http = require('http');
const path = require('path');
const fs = require('fs');

const PORT = Number(process.env.LAUNCHER_PORT) || 3000;
const HEALTH_REPLY = 'motion-studio-launcher';

const [, , mode, modeArg] = process.argv;
if (mode === '--hook') sendHook(modeArg);
else if (mode === '--ping') ping();
else startServer();

// A hook must never disturb Claude Code, so this always exits 0 and prints nothing.
function sendHook(event) {
  const done = () => process.exit(0);
  const req = http.request(
    {
      host: '127.0.0.1',
      port: Number(process.env.LAUNCHER_PORT) || PORT,
      path: `/hooks/${encodeURIComponent(event || '')}`,
      method: 'POST',
      headers: {'x-launcher-token': process.env.LAUNCHER_TOKEN || ''},
      timeout: 2000,
    },
    (res) => {
      res.resume();
      res.on('end', done);
    },
  );
  req.on('error', done);
  req.on('timeout', done);
  req.end();
}

function ping() {
  const req = http.get({host: '127.0.0.1', port: PORT, path: '/health', timeout: 1500}, (res) => {
    let body = '';
    res.on('data', (chunk) => (body += chunk));
    res.on('end', () => process.exit(body === HEALTH_REPLY ? 0 : 1));
  });
  req.on('error', () => process.exit(1));
  req.on('timeout', () => process.exit(1));
}

function startServer() {
  const crypto = require('crypto');
  const {execFile} = require('child_process');
  const express = require('express');
  const {WebSocketServer} = require('ws');
  const pty = require('node-pty');

  const ROOT = path.resolve(__dirname, '..'); // the motion-studio repo
  const RUNTIME = path.join(__dirname, '.runtime');
  const CONFIG_FILE = path.join(RUNTIME, 'config.json');
  const HOOKS_FILE = path.join(RUNTIME, 'hooks.json');
  const REPLAY_LIMIT = 512 * 1024; // terminal output kept so a reloaded page can catch up
  const PASTE_TO_ENTER_MS = 400; // the Claude Code input box needs a moment to take in a paste
  const TOKEN = crypto.randomBytes(24).toString('hex'); // only Claude Code processes we start can report hook events
  const ALLOWED_ORIGINS = new Set([`http://localhost:${PORT}`, `http://127.0.0.1:${PORT}`]);

  fs.mkdirSync(RUNTIME, {recursive: true});

  // --- state -------------------------------------------------------------------------------------
  const config = {folder: 'projects/promo16x9', composition: 'Promo16x9', auto: true};
  try {
    Object.assign(config, JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')));
  } catch {
    // First run: keep the defaults.
  }

  const state = {
    claude: 'stopped', // stopped | starting | ready | busy
    needsAnswer: false, // Claude is waiting on a permission prompt
    rendering: false,
    notice: 'Starting up.',
    noticeKind: 'info', // info | good | bad
  };
  const terms = {
    claude: {proc: null, replay: '', cols: 120, rows: 30},
    render: {proc: null, replay: '', cols: 120, rows: 30},
  };
  const sockets = new Set();
  let armed = false; // a Generate click is waiting for Claude to finish changing files
  let baseline = null; // repo fingerprint from just before that click

  function broadcast(message) {
    const text = JSON.stringify(message);
    for (const socket of sockets) if (socket.readyState === 1) socket.send(text);
  }
  function publishState() {
    broadcast({type: 'state', state, config});
  }
  function notice(text, kind = 'info') {
    state.notice = text;
    state.noticeKind = kind;
    console.log(`[${kind}] ${text}`);
    publishState();
  }
  function emit(term, data) {
    const t = terms[term];
    t.replay = (t.replay + data).slice(-REPLAY_LIMIT);
    broadcast({type: 'output', term, data});
  }

  // --- Claude Code ------------------------------------------------------------------------------
  function writeHookSettings() {
    // Forward slashes work in every shell that Claude Code may run a hook through.
    const self = __filename.replace(/\\/g, '/');
    const hook = (name) => ({hooks: [{type: 'command', command: `node "${self}" --hook ${name}`, timeout: 5}]});
    const hooks = {
      SessionStart: [hook('SessionStart')],
      UserPromptSubmit: [hook('UserPromptSubmit')],
      Stop: [hook('Stop')],
      Notification: [{matcher: 'permission_prompt', ...hook('PermissionPrompt')}],
    };
    fs.writeFileSync(HOOKS_FILE, JSON.stringify({hooks}, null, 2));
  }

  function childEnv() {
    const env = {...process.env, LAUNCHER_TOKEN: TOKEN, LAUNCHER_PORT: String(PORT)};
    // Set when the server was started from inside another Claude Code session; they would confuse the child.
    for (const key of ['CLAUDECODE', 'CLAUDE_CODE_ENTRYPOINT', 'CLAUDE_CODE_SSE_PORT', 'CLAUDE_CODE_CHILD_SESSION']) delete env[key];
    return env;
  }

  function startClaude() {
    if (terms.claude.proc) return;
    writeHookSettings();
    const t = terms.claude;
    t.replay = '';
    broadcast({type: 'clear', term: 'claude'});
    armed = false;
    state.claude = 'starting';
    state.needsAnswer = false;
    // --permission-mode default: permission prompts always appear, whatever the user's own settings say.
    t.proc = pty.spawn('cmd.exe', ['/c', 'claude', '--permission-mode', 'default', '--settings', HOOKS_FILE], {
      name: 'xterm-256color',
      cols: t.cols,
      rows: t.rows,
      cwd: ROOT,
      env: childEnv(),
    });
    t.proc.onData((data) => emit('claude', data));
    t.proc.onExit(({exitCode}) => {
      t.proc = null;
      armed = false;
      state.claude = 'stopped';
      state.needsAnswer = false;
      notice(`Claude Code exited (code ${exitCode}). Use Restart Claude to start it again.`, exitCode ? 'bad' : 'info');
    });
    notice('Starting Claude Code. If it asks you anything, answer in the terminal.');
  }

  // Fingerprint of the repo, used to tell whether a Claude turn actually changed anything.
  function git(args) {
    return new Promise((resolve, reject) => {
      execFile('git', args, {cwd: ROOT, maxBuffer: 128 * 1024 * 1024}, (err, stdout) => (err ? reject(err) : resolve(stdout)));
    });
  }
  async function repoFingerprint() {
    try {
      const [head, diff, untracked] = await Promise.all([
        git(['rev-parse', 'HEAD']),
        git(['diff', 'HEAD', '--binary']),
        git(['ls-files', '--others', '--exclude-standard', '-z']),
      ]);
      // git diff does not see untracked files, so each one counts by its name, size and modified time.
      const untrackedStats = untracked
        .split('\0')
        .filter(Boolean)
        .map((file) => {
          try {
            const {size, mtimeMs} = fs.statSync(path.join(ROOT, file));
            return `${file}:${size}:${mtimeMs}`;
          } catch {
            return file;
          }
        });
      return crypto.createHash('sha1').update([head, diff, ...untrackedStats].join('\0')).digest('hex');
    } catch (err) {
      console.log(`[info] git fingerprint failed: ${err.message}`);
      return null;
    }
  }

  async function generate(rawPrompt) {
    // Only Claude Code's input box may receive this. Sending while it is busy could land on a permission prompt,
    // where the Enter key would answer the prompt.
    if (state.claude !== 'ready' || state.rendering) {
      notice('Not sent: wait until Claude Code is ready and no render is running.', 'bad');
      return;
    }
    // Control characters are removed so that a prompt cannot end the bracketed paste early.
    const prompt = String(rawPrompt || '')
      .replace(/\r\n?/g, '\n')
      .replace(/[\x00-\x08\x0b-\x1f\x7f-\x9f]/g, '')
      .trim();
    if (!prompt) {
      notice('Write a prompt first.', 'bad');
      return;
    }
    state.claude = 'busy';
    notice('Prompt sent. Claude Code is working; answer any prompts in the terminal.');
    baseline = await repoFingerprint();
    armed = true;
    const proc = terms.claude.proc;
    if (!proc) return;
    proc.write(`\x1b[200~${prompt}\x1b[201~`);
    setTimeout(() => {
      if (terms.claude.proc === proc) proc.write('\r');
    }, PASTE_TO_ENTER_MS);
  }

  async function onClaudeStopped() {
    state.claude = 'ready';
    state.needsAnswer = false;
    if (!armed) {
      notice('Claude Code is ready.');
      return;
    }
    if (!config.auto) {
      armed = false;
      notice('Claude finished. Auto-render is off, so use Render now when you want the video.', 'good');
      return;
    }
    const now = await repoFingerprint();
    if (now !== null && now === baseline) {
      // Usually Claude asked a question. The render stays armed for when it finishes the work.
      notice('Claude stopped without changing any files, so nothing was rendered. Answer it in the terminal if it asked something.');
      return;
    }
    armed = false;
    startRender('Claude finished its changes.');
  }

  const hookHandlers = {
    SessionStart() {
      if (state.claude === 'starting') {
        state.claude = 'ready';
        notice('Claude Code is ready.', 'good');
      }
    },
    UserPromptSubmit() {
      state.claude = 'busy';
      state.needsAnswer = false;
      publishState();
    },
    PermissionPrompt() {
      state.needsAnswer = true;
      broadcast({type: 'focus', term: 'claude'});
      publishState();
    },
    Stop: onClaudeStopped,
  };

  // --- Remotion render --------------------------------------------------------------------------
  function resolveFolder(folder) {
    const full = path.resolve(ROOT, folder || '.');
    const rel = path.relative(ROOT, full);
    if (rel.startsWith('..') || path.isAbsolute(rel)) return null;
    return fs.existsSync(path.join(full, 'package.json')) ? full : null;
  }

  function startRender(reason = '') {
    if (state.rendering) {
      notice('A render is already running.', 'bad');
      return;
    }
    const cwd = resolveFolder(config.folder);
    if (!cwd) {
      notice(`Not rendered: "${config.folder}" is not a project folder inside motion-studio.`, 'bad');
      return;
    }
    const composition = String(config.composition || '').trim();
    if (composition && !/^[A-Za-z0-9-]+$/.test(composition)) {
      notice(`Not rendered: "${composition}" is not a valid composition ID.`, 'bad');
      return;
    }
    // A timestamp in the name means an earlier render is never overwritten.
    // With no composition ID, Remotion shows its own picker in the Render terminal.
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15);
    const output = composition ? `out/${composition}-${stamp}.mp4` : null;
    const extra = (process.env.LAUNCHER_RENDER_ARGS || '').split(/\s+/).filter(Boolean);
    const args = ['/c', 'npx', 'remotion', 'render', ...(composition ? [composition, output] : []), ...extra];

    const t = terms.render;
    t.replay = '';
    broadcast({type: 'clear', term: 'render'});
    broadcast({type: 'focus', term: 'render'});
    emit('render', `\x1b[2m> ${args.slice(1).join(' ')}\x1b[0m\r\n\x1b[2m  in ${cwd}\x1b[0m\r\n\r\n`);
    state.rendering = true;
    notice(`${reason ? `${reason} ` : ''}Rendering ${composition || 'the composition you pick in the Render tab'}.`);
    t.proc = pty.spawn('cmd.exe', args, {name: 'xterm-256color', cols: t.cols, rows: t.rows, cwd, env: childEnv()});
    t.proc.onData((data) => emit('render', data));
    t.proc.onExit(({exitCode}) => {
      t.proc = null;
      state.rendering = false;
      if (exitCode !== 0) notice(`Render failed (exit code ${exitCode}). See the Render tab.`, 'bad');
      else if (output && !fs.existsSync(path.join(cwd, output))) notice(`Render exited cleanly but ${output} was not written. See the Render tab.`, 'bad');
      else notice(output ? `Render finished: ${path.join(cwd, output)}` : 'Render finished. See the Render tab for the file path.', 'good');
    });
  }

  // --- HTTP and WebSocket -----------------------------------------------------------------------
  const app = express();
  app.get('/health', (_req, res) => res.type('text/plain').send(HEALTH_REPLY));
  app.post('/hooks/:event', (req, res) => {
    if (req.get('x-launcher-token') !== TOKEN) return res.sendStatus(403);
    const handler = hookHandlers[req.params.event];
    if (handler) Promise.resolve(handler()).catch((err) => notice(`Hook error: ${err.message}`, 'bad'));
    res.sendStatus(204);
  });
  app.use('/vendor/xterm', express.static(path.join(__dirname, 'node_modules/@xterm/xterm')));
  app.use('/vendor/addon-fit', express.static(path.join(__dirname, 'node_modules/@xterm/addon-fit')));
  app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'index.html')));

  const server = http.createServer(app);
  // The socket can type into a terminal, so only our own page may open it; other websites could otherwise reach localhost.
  const wss = new WebSocketServer({
    server,
    verifyClient: ({origin}) => ALLOWED_ORIGINS.has(origin),
  });

  const actions = {
    input({term, data}) {
      const t = terms[term];
      if (!t || !t.proc || typeof data !== 'string') return;
      if (term === 'claude' && state.needsAnswer) {
        state.needsAnswer = false;
        publishState();
      }
      t.proc.write(data);
    },
    resize({term, cols, rows}) {
      const t = terms[term];
      if (!t || !Number.isInteger(cols) || !Number.isInteger(rows) || cols < 2 || rows < 2) return;
      t.cols = cols;
      t.rows = rows;
      if (t.proc) {
        try {
          t.proc.resize(cols, rows);
        } catch {
          // The process exited a moment ago.
        }
      }
    },
    config({folder, composition, auto}) {
      if (typeof folder === 'string') config.folder = folder.trim();
      if (typeof composition === 'string') config.composition = composition.trim();
      if (typeof auto === 'boolean') config.auto = auto;
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
      publishState();
    },
    generate: ({prompt}) => generate(prompt),
    render: () => startRender(),
    restartClaude: () => startClaude(),
    markReady() {
      // Claude Code sends no Stop event after an interrupt (Esc) or an API error, so the user can clear "busy" here.
      if (!terms.claude.proc) return;
      state.claude = 'ready';
      state.needsAnswer = false;
      notice('Marked as ready. Check that Claude Code is really at its input box before sending.');
    },
    shutdown() {
      broadcast({type: 'shutdown'});
      for (const t of Object.values(terms)) {
        if (t.proc) {
          try {
            t.proc.kill();
          } catch {
            // Already gone.
          }
        }
      }
      console.log('[info] Stopped from the dashboard.');
      setTimeout(() => process.exit(0), 200);
    },
  };

  wss.on('connection', (socket) => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
    socket.on('message', (raw) => {
      let message;
      try {
        message = JSON.parse(raw);
      } catch {
        return;
      }
      const action = Object.prototype.hasOwnProperty.call(actions, message.type) ? actions[message.type] : null;
      if (!action) return;
      Promise.resolve()
        .then(() => action(message))
        .catch((err) => notice(`Error: ${err.message}`, 'bad'));
    });
    socket.send(JSON.stringify({type: 'state', state, config}));
    for (const term of Object.keys(terms)) {
      socket.send(JSON.stringify({type: 'clear', term}));
      if (terms[term].replay) socket.send(JSON.stringify({type: 'output', term, data: terms[term].replay}));
    }
    if (!terms.claude.proc && state.claude === 'stopped' && state.notice === 'Starting up.') startClaude();
  });

  server.on('error', (err) => {
    console.error(err.code === 'EADDRINUSE' ? `Port ${PORT} is already in use by another program.` : err.message);
    process.exit(1);
  });
  // 127.0.0.1 only: this server drives a terminal, so it must not be reachable from the network.
  server.listen(PORT, '127.0.0.1', () => console.log(`[info] Listening on http://localhost:${PORT}`));
}
