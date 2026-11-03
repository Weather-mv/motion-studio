// npm run new -- <job-name> [16x9|9x16|1x1] [seconds]
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [name, ratio = '16x9', secs = '30'] = process.argv.slice(2);
if (!name || !/^[a-z0-9][a-z0-9-]*$/.test(name)) {
  console.error('Usage: npm run new -- <job-name> [16x9|9x16|1x1] [seconds]\nName: lowercase letters, digits, dashes.');
  process.exit(1);
}
const sizes = {'16x9': [1920, 1080], '9x16': [1080, 1920], '1x1': [1080, 1080]};
if (!sizes[ratio]) { console.error(`Unknown ratio "${ratio}". Use 16x9, 9x16 or 1x1.`); process.exit(1); }
const dest = path.join(root, 'jobs', name);
if (fs.existsSync(dest)) { console.error(`jobs/${name} already exists.`); process.exit(1); }
fs.cpSync(path.join(root, 'templates', 'job'), dest, {recursive: true});
fs.mkdirSync(path.join(dest, 'edit'), {recursive: true});
fs.mkdirSync(path.join(dest, 'qa'), {recursive: true});
fs.mkdirSync(path.join(root, 'public', 'jobs', name), {recursive: true});
const planPath = path.join(dest, 'plan.json');
const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
[plan.meta.width, plan.meta.height] = sizes[ratio];
plan.meta.durationSec = Number(secs);
plan.meta.title = name;
const last = plan.beats[plan.beats.length - 1];
last.end = Number(secs);
fs.writeFileSync(planPath, JSON.stringify(plan, null, 2) + '\n');
execFileSync('node', [path.join(root, 'tools', 'sync.mjs')], {stdio: 'inherit'});
console.log(`\nCreated jobs/${name} (${ratio}, ${secs}s).\nPut logo, fonts, audio and ref.mp4 in public/jobs/${name}/.\nThen fill jobs/${name}/brief.md, brand.json and script.md, and run /storyboard ${name} in Claude Code.`);
