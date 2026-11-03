// npm run render -- <job>   Renders picture only, then muxes audio separately (never one filter graph).
// npm run render -- <job> --still=<frame>   Writes one frame to jobs/<job>/qa/, passing only the beat at that frame.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync, execSync, spawnSync} from 'node:child_process';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const id = process.argv[2];
if (!id) { console.error('Usage: npm run render -- <job> [--still=<frame>]'); process.exit(1); }
// npx is npx.cmd on Windows, which cannot be spawned without a shell, so run it as a shell command.
const remotion = (args) => execSync(`npx remotion ${args.map((a) => `"${a}"`).join(' ')}`, {cwd: root, stdio: 'inherit'});
const stillArg = process.argv.slice(3).find((a) => a.startsWith('--still='));
if (stillArg) {
  const frame = Number(stillArg.split('=')[1]);
  execFileSync('node', [path.join(root, 'tools', 'sync.mjs')], {stdio: 'inherit'});
  const plan = JSON.parse(fs.readFileSync(path.join(root, 'jobs', id, 'plan.json'), 'utf8'));
  const brand = JSON.parse(fs.readFileSync(path.join(root, 'jobs', id, 'brand.json'), 'utf8'));
  const beat = plan.beats.find((b) => frame >= Math.round(b.start * plan.meta.fps) && frame < Math.round(b.end * plan.meta.fps));
  if (!Number.isInteger(frame) || !beat) { console.error(`No beat at frame ${stillArg.split('=')[1]}.`); process.exit(1); }
  fs.mkdirSync(path.join(root, 'out'), {recursive: true});
  const propsFile = path.join('out', `${id}-still-props.json`);
  fs.writeFileSync(path.join(root, propsFile), JSON.stringify({jobId: id, plan: {...plan, beats: [beat]}, brand}));
  const png = path.join('jobs', id, 'qa', `still-${beat.id}-f${frame}.png`);
  remotion(['still', 'src/index.ts', id, png, `--frame=${frame}`, `--props=${propsFile}`]);
  console.log(`
Still: ${png} (beat "${beat.id}", check-job skipped: preview only)`);
  process.exit(0);
}
try { execFileSync('node', [path.join(root, 'tools', 'check-job.mjs'), id], {stdio: 'inherit'}); }
catch { console.error('\nRender stopped: fix blockers first.'); process.exit(1); }
execFileSync('node', [path.join(root, 'tools', 'sync.mjs')], {stdio: 'inherit'});
const plan = JSON.parse(fs.readFileSync(path.join(root, 'jobs', id, 'plan.json'), 'utf8'));
fs.mkdirSync(path.join(root, 'out'), {recursive: true});
const silent = path.join(root, 'out', `${id}-picture.mp4`);
// Audio is muted in the picture render by dropping it at mux time.
remotion(['render', 'src/index.ts', id, silent, '--muted']);
const audio = plan.meta.audio && path.join(root, 'public', 'jobs', id, plan.meta.audio);
const final = path.join(root, 'out', `${id}-final.mp4`);
if (audio) {
  // Measure, limit peaks so the needed gain fits under the ceiling, measure again, then apply a linear gain.
  // A gain alone cannot reach the target when the voiceover is quiet but peaky, and single-pass missed it.
  // The peak target sits below -1.5 dBTP because AAC encoding can raise true peaks slightly.
  const target = 'I=-14:TP=-2:LRA=11';
  const measure = (pre) => {
    const af = `${pre}loudnorm=${target}:print_format=json`;
    const {stderr} = spawnSync('ffmpeg', ['-hide_banner', '-i', audio, '-af', af, '-f', 'null', '-'], {encoding: 'utf8'});
    return JSON.parse(stderr.slice(stderr.lastIndexOf('{'), stderr.lastIndexOf('}') + 1));
  };
  const first = measure('');
  const gainDb = -14 - Number(first.input_i);
  const limitDb = Math.min(-2 - gainDb - 1, -1); // 1 dB spare, because limiting also lowers loudness slightly
  const limiter = `alimiter=limit=${Math.max(0.0625, 10 ** (limitDb / 20)).toFixed(4)}:level=disabled,`;
  const m = measure(limiter);
  const filter = `${limiter}loudnorm=${target}:linear=true:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}`;
  console.log(`Loudness: source ${first.input_i} LUFS / ${first.input_tp} dBTP, limiter ${limitDb.toFixed(1)} dB, mode ${m.normalization_type}`);
  execFileSync('ffmpeg', ['-y', '-i', silent, '-i', audio, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-af', filter, '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-shortest', final], {stdio: 'inherit'});
  console.log(`\nFinal: ${final}\nLoudness normalised. Verify with: ffmpeg -i ${final} -af ebur128=peak=true -f null -`);
} else {
  fs.copyFileSync(silent, final);
  console.log(`\nFinal (silent): ${final}`);
}
