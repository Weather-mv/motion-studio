// npm run new -- <job-name> [--type=<type>] [--ratio=16x9|9x16|1x1] [--seconds=<n>]
// The older positional form still works: npm run new -- <job-name> [ratio] [seconds]
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {SIZES, buildPlan, listTypes, readType, root} from './lib/scaffold.mjs';

const fail = (msg) => { console.error(msg); process.exit(1); };
const args = process.argv.slice(2);
const flag = (k) => args.find((a) => a.startsWith(`--${k}=`))?.split('=')[1];
const positional = args.filter((a) => !a.startsWith('--'));
const name = positional[0];
const usage = `Usage: npm run new -- <job-name> [--type=<type>] [--ratio=16x9|9x16|1x1] [--seconds=<n>]\nTypes: ${listTypes().join(', ')}`;
if (!name || !/^[a-z0-9][a-z0-9-]*$/.test(name)) fail(`${usage}\nName: lowercase letters, digits, dashes.`);

const typeId = flag('type');
if (typeId && !listTypes().includes(typeId)) fail(`Unknown type "${typeId}".\n${usage}`);
const type = typeId ? readType(typeId) : null;

const ratio = flag('ratio') ?? positional[1] ?? type?.ratios[0] ?? '16x9';
if (!SIZES[ratio]) fail(`Unknown ratio "${ratio}". Use 16x9, 9x16 or 1x1.`);
if (type && !type.ratios.includes(ratio)) console.warn(`Note: ${type.label} normally uses ${type.ratios.join(', ')}, not ${ratio}.`);

const rawSecs = flag('seconds') ?? positional[2] ?? String(type?.lengthSec.default ?? 30);
const secsMatch = /^(\d+(?:\.\d+)?)\s*(?:s|sec|secs|seconds)?$/i.exec(rawSecs);
if (!secsMatch || Number(secsMatch[1]) <= 0) fail(`Cannot read seconds from "${rawSecs}". Use a number, for example 30.`);
const seconds = Number(secsMatch[1]);
if (type && (seconds < type.lengthSec.min || seconds > type.lengthSec.max)) {
  console.warn(`Note: ${type.label} usually runs ${type.lengthSec.min} to ${type.lengthSec.max} s; you asked for ${seconds} s.`);
}

const dest = path.join(root, 'jobs', name);
if (fs.existsSync(dest)) fail(`jobs/${name} already exists.`);
fs.cpSync(path.join(root, 'templates', 'job'), dest, {recursive: true});
fs.mkdirSync(path.join(dest, 'edit'), {recursive: true});
fs.mkdirSync(path.join(dest, 'qa'), {recursive: true});
fs.mkdirSync(path.join(root, 'public', 'jobs', name), {recursive: true});
fs.writeFileSync(path.join(dest, 'plan.json'), JSON.stringify(buildPlan({name, ratio, seconds, type}), null, 2) + '\n');
execFileSync('node', [path.join(root, 'tools', 'sync.mjs')], {stdio: 'inherit'});
console.log(`\nCreated jobs/${name} (${type ? type.label + ', ' : ''}${ratio}, ${seconds}s).
Put logo, fonts, audio and ref.mp4 in public/jobs/${name}/.
Then fill jobs/${name}/brief.md, brand.json, script.md, claims.json and assets.json, and run /storyboard ${name} in Claude Code.`);
if (type) console.log(`\nThis type also needs:\n${type.needs.map((n) => `  - ${n}`).join('\n')}`);
