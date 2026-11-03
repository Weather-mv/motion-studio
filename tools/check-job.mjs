// npm run check -- <job>   Validates brief, brand, assets and plan before storyboard/render.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCENES = ['title', 'featureGrid', 'metric', 'stepFlow', 'alert', 'threeStage', 'cta', 'robotDashboard', 'anomalyAlert', 'nightSite', 'routeMap', 'logoEndCard']; // keep in sync with src/scenes/registry.ts
const id = process.argv[2];
if (!id) { console.error('Usage: npm run check -- <job>'); process.exit(1); }
const dir = path.join(root, 'jobs', id);
if (!fs.existsSync(dir)) { console.error(`jobs/${id} not found`); process.exit(1); }
const pub = path.join(root, 'public', 'jobs', id);
const blockers = [], warnings = [];

const brief = fs.readFileSync(path.join(dir, 'brief.md'), 'utf8');
brief.split('\n').forEach((l, i) => { if (/\bOPEN\b/.test(l)) blockers.push(`brief.md line ${i + 1}: still OPEN (${l.trim().slice(0, 50)})`); });

const brand = JSON.parse(fs.readFileSync(path.join(dir, 'brand.json'), 'utf8'));
if (brand.name === 'Brand Name') blockers.push('brand.json: name is still the template value');
for (const [k, v] of Object.entries(brand.colors || {})) if (!/^#[0-9a-fA-F]{6}$/.test(v)) blockers.push(`brand.json: colors.${k} is not a 6-digit hex`);
if (brand.logo && !fs.existsSync(path.join(pub, brand.logo))) warnings.push(`logo "${brand.logo}" not found in public/jobs/${id}/ (CTA falls back to text name)`);
for (const f of brand.fontFiles || []) if (!fs.existsSync(path.join(pub, f.file))) blockers.push(`font file missing: public/jobs/${id}/${f.file}`);
if (!(brand.fontFiles || []).length) warnings.push('no font files: using system fonts');

const plan = JSON.parse(fs.readFileSync(path.join(dir, 'plan.json'), 'utf8'));
const {meta, beats} = plan;
if (meta.audio && !fs.existsSync(path.join(pub, meta.audio))) blockers.push(`audio missing: public/jobs/${id}/${meta.audio}`);
if (!meta.audio) warnings.push('no audio set in plan.json meta.audio (video will be silent)');
const grid = (t) => Math.abs(t * meta.fps - Math.round(t * meta.fps)) < 1e-6;
let prev = 0;
beats.forEach((b, i) => {
  if (!SCENES.includes(b.scene)) blockers.push(`beat "${b.id}": unknown scene "${b.scene}" (valid: ${SCENES.join(', ')})`);
  if (Math.abs(b.start - prev) > 1e-6) blockers.push(`beat "${b.id}": starts at ${b.start}s but previous ended at ${prev}s (gap or overlap)`);
  if (b.end <= b.start) blockers.push(`beat "${b.id}": end must be after start`);
  if (!grid(b.start) || !grid(b.end)) warnings.push(`beat "${b.id}": times not on the ${meta.fps} fps frame grid`);
  if (b.vo) {
    const syl = (b.vo.toLowerCase().match(/[aeiouy]+/g) || []).length;
    const rate = syl / Math.max(0.5, b.end - b.start - 0.5);
    if (rate > 5) warnings.push(`beat "${b.id}": voiceover ~${rate.toFixed(1)} syl/s is too fast; trim the line or lengthen the beat`);
  }
  prev = b.end;
});
if (Math.abs(prev - meta.durationSec) > 1e-6) blockers.push(`last beat ends at ${prev}s but meta.durationSec is ${meta.durationSec}s`);

console.log(`Job: ${id}  (${meta.width}x${meta.height} @ ${meta.fps} fps, ${meta.durationSec}s, ${beats.length} beats)`);
warnings.forEach((w) => console.log('  warn:    ' + w));
blockers.forEach((b) => console.log('  BLOCKER: ' + b));
console.log(blockers.length ? `\n${blockers.length} blocker(s). Fix before storyboard/render.` : '\nNo blockers.');
process.exit(blockers.length ? 1 : 0);
