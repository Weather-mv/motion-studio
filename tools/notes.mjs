// npm run notes -- <job> add <where> "<note>"    where: f130, 130, 4.33s, or a beat id
// npm run notes -- <job> list [open]
// npm run notes -- <job> done <n> "<what changed>"
// Keeps jobs/<job>/edit/notes.md in one format, and works out the beat, frame and time for each note.
import fs from 'node:fs';
import path from 'node:path';
import {root} from './lib/scaffold.mjs';

const [id, action, ...rest] = process.argv.slice(2);
const usage = 'Usage: npm run notes -- <job> add <f130|130|4.33s|beat-id> "<note>"\n       npm run notes -- <job> list [open]\n       npm run notes -- <job> done <n> "<what changed>"';
if (!id || !action) { console.error(usage); process.exit(1); }
const dir = path.join(root, 'jobs', id);
if (!fs.existsSync(path.join(dir, 'plan.json'))) { console.error(`jobs/${id} not found`); process.exit(1); }
const {meta, beats} = JSON.parse(fs.readFileSync(path.join(dir, 'plan.json'), 'utf8'));
const file = path.join(dir, 'edit', 'notes.md');
const HEADER = `# Review notes: ${id}\n\nWritten by /notes and updated by /revise. Status is open or done.\n`;
const read = () => (fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : HEADER);
const parseNotes = (text) => [...text.matchAll(/^## Note (\d+)\n- Beat: (.*)\n- Scene: (.*)\n- Frame: (.*)\n- Time: (.*)\n- Note: ([\s\S]*?)\n- Status: (\w+)(?:\n- Change: (.*))?/gm)].map((m) => ({n: Number(m[1]), beat: m[2], scene: m[3], frame: m[4], time: m[5], note: m[6], status: m[7], change: m[8]}));

const locate = (where) => {
  const byId = beats.find((b) => b.id === where);
  if (byId) return {beat: byId, frame: `whole beat (${Math.round(byId.start * meta.fps)} to ${Math.round(byId.end * meta.fps) - 1})`, time: `${byId.start.toFixed(2)} to ${byId.end.toFixed(2)} s`};
  let frame = null;
  const sec = /^(\d+(?:\.\d+)?)s$/.exec(where);
  const fr = /^f?(\d+)$/.exec(where);
  if (sec) frame = Math.round(Number(sec[1]) * meta.fps);
  else if (fr) frame = Number(fr[1]);
  if (frame === null) return null;
  const beat = beats.find((b) => frame >= Math.round(b.start * meta.fps) && frame < Math.round(b.end * meta.fps));
  return beat ? {beat, frame: String(frame), time: `${(frame / meta.fps).toFixed(2)} s`} : null;
};

if (action === 'add') {
  const [where, ...words] = rest;
  const note = words.join(' ').trim();
  if (!where || !note) { console.error(usage); process.exit(1); }
  const at = locate(where);
  if (!at) { console.error(`"${where}" is not a frame, time or beat in this job. It has ${Math.round(meta.durationSec * meta.fps)} frames.`); process.exit(1); }
  const text = read();
  const n = parseNotes(text).reduce((a, x) => Math.max(a, x.n), 0) + 1;
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, `${text.trimEnd()}\n\n## Note ${n}\n- Beat: ${at.beat.id}\n- Scene: ${at.beat.scene}\n- Frame: ${at.frame}\n- Time: ${at.time}\n- Note: ${note}\n- Status: open\n`);
  console.log(`Note ${n} saved: beat "${at.beat.id}" (${at.beat.scene}), frame ${at.frame}, ${at.time}`);
} else if (action === 'list') {
  const notes = parseNotes(read()).filter((x) => rest[0] !== 'open' || x.status === 'open');
  if (!notes.length) console.log(rest[0] === 'open' ? 'No open notes.' : 'No notes.');
  const scenes = [...new Set(notes.map((x) => x.scene))];
  scenes.forEach((s) => {
    console.log(`\n${s}`);
    notes.filter((x) => x.scene === s).forEach((x) => console.log(`  ${x.n}. [${x.status}] ${x.beat}, frame ${x.frame}: ${x.note}${x.change ? `\n     Change: ${x.change}` : ''}`));
  });
} else if (action === 'done') {
  const [nArg, ...words] = rest;
  const change = words.join(' ').trim();
  const text = read();
  const target = parseNotes(text).find((x) => x.n === Number(nArg));
  if (!target || !change) { console.error(target ? usage : `No note ${nArg}.`); process.exit(1); }
  if (target.status === 'done') { console.error(`Note ${nArg} is already done.`); process.exit(1); }
  const re = new RegExp(`(^## Note ${nArg}\\n[\\s\\S]*?- Status: )open`, 'm');
  fs.writeFileSync(file, text.replace(re, `$1done\n- Change: ${change.replace(/\$/g, '$$$$')}`));
  console.log(`Note ${nArg} marked done.`);
} else {
  console.error(usage);
  process.exit(1);
}
