// npm run check -- <job> [--static] [--ratio=16x9|9x16|1x1]
// Quality gates. Static gates read files. Browser gates (tools/audit.mjs) render test frames; skip them with --static.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {root} from './lib/scaffold.mjs';
import {loadSchemas} from './lib/load-schemas.mjs';
import {lintPlan, lintSource} from './lint-colors.mjs';

const id = process.argv[2];
if (!id || id.startsWith('--')) { console.error('Usage: npm run check -- <job> [--static] [--ratio=16x9|9x16|1x1]'); process.exit(1); }
const flags = process.argv.slice(3);
const isStatic = flags.includes('--static');
const ratio = flags.find((a) => a.startsWith('--ratio='))?.split('=')[1];
const dir = path.join(root, 'jobs', id);
if (!fs.existsSync(dir)) { console.error(`jobs/${id} not found`); process.exit(1); }
const pub = path.join(root, 'public', 'jobs', id);
const blockers = [], warnings = [], gates = [];
const gate = (name, result, detail = '') => gates.push({name, result, detail});
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const count = (fn) => { const before = blockers.length; fn(); return blockers.length - before; };

// Brief
const brief = fs.readFileSync(path.join(dir, 'brief.md'), 'utf8');
const open = brief.split('\n').filter((l) => /\bOPEN\b/.test(l) && !l.startsWith('Fill every line'));
open.forEach((l) => blockers.push(`brief.md still OPEN: ${l.trim()}`));
gate('Brief complete', open.length ? 'FAIL' : 'PASS');

// Brand
const brand = readJson(path.join(dir, 'brand.json'));
if (brand.name === 'Brand Name') blockers.push('brand.json: name is still the template value');
if (brand.logo && !fs.existsSync(path.join(pub, brand.logo))) warnings.push(`logo "${brand.logo}" not found in public/jobs/${id}/ (scenes fall back to the text name)`);
if (brand.background && !fs.existsSync(path.join(pub, brand.background))) blockers.push(`background missing: public/jobs/${id}/${brand.background}`);
for (const f of brand.fontFiles || []) if (!fs.existsSync(path.join(pub, f.file))) blockers.push(`font file missing: public/jobs/${id}/${f.file}`);
if (!(brand.fontFiles || []).length) warnings.push('no font files: using system fonts');

// Schemas
const {planSchema, brandSchema, CLIENT_SCENES} = await loadSchemas();
const planText = fs.readFileSync(path.join(dir, 'plan.json'), 'utf8');
const plan = JSON.parse(planText);
const {meta, beats} = plan;
const describeIssues = (r, file) => r.error.issues.forEach((i) => {
  const at = i.path.join('.').replace(/^beats\.(\d+)/, (_, n) => `beat "${beats[n]?.id ?? n}"`);
  blockers.push(`${file}: ${at}: ${i.message}`);
});
const schemaFailures = count(() => {
  const a = planSchema.safeParse(plan);
  if (!a.success) describeIssues(a, 'plan.json');
  const b = brandSchema.safeParse(brand);
  if (!b.success) describeIssues(b, 'brand.json');
});
gate('Plan and brand match schemas', schemaFailures ? 'FAIL' : 'PASS');

// Placeholders and files named by the plan
const openProps = [];
const srcFiles = [];
const walk = (v, key, visit) => {
  if (Array.isArray(v)) v.forEach((x) => walk(x, key, visit));
  else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => walk(x, k, visit));
  else visit(v, key);
};
beats.forEach((b) => walk(b.props, '', (v, k) => {
  if (typeof v === 'string' && /\bOPEN\b/.test(v)) openProps.push(b.id);
  if (k === 'src' && typeof v === 'string') srcFiles.push([b.id, v]);
}));
[...new Set(openProps)].forEach((b) => blockers.push(`beat "${b}": props still hold OPEN placeholders`));
srcFiles.forEach(([b, f]) => { if (!fs.existsSync(path.join(pub, f))) blockers.push(`beat "${b}": file missing: public/jobs/${id}/${f}`); });
if (meta.audio && !fs.existsSync(path.join(pub, meta.audio))) blockers.push(`audio missing: public/jobs/${id}/${meta.audio}`);
if (!meta.audio) warnings.push('no audio set in plan.json meta.audio (video will be silent)');

// Frame grid, gaps, transitions
const onGrid = (t) => Math.abs(t * meta.fps - Math.round(t * meta.fps)) < 1e-6;
const gridFailures = count(() => {
  let prev = 0;
  beats.forEach((b, i) => {
    if (Math.abs(b.start - prev) > 1e-6) blockers.push(`beat "${b.id}": starts at ${b.start}s but previous ended at ${prev}s (gap or overlap)`);
    if (b.end <= b.start) blockers.push(`beat "${b.id}": end must be after start`);
    if (!onGrid(b.start) || !onGrid(b.end)) blockers.push(`beat "${b.id}": times are not on the ${meta.fps} fps frame grid`);
    const t = b.transition;
    if (t && t.type !== 'cut') {
      if (i === 0) blockers.push(`beat "${b.id}": the first beat cannot have a transition`);
      const sec = t.sec ?? brand.motion?.transitionSec ?? 0.4;
      if (t.sec !== undefined && !onGrid(t.sec)) warnings.push(`beat "${b.id}": transition length ${t.sec}s rounds to the nearest frame`);
      if (sec >= b.end - b.start) blockers.push(`beat "${b.id}": transition (${sec}s) is as long as the beat`);
      if (i > 0 && sec >= beats[i - 1].end - beats[i - 1].start) blockers.push(`beat "${b.id}": transition (${sec}s) is as long as the previous beat`);
    }
    prev = b.end;
  });
  if (Math.abs(prev - meta.durationSec) > 1e-6) blockers.push(`last beat ends at ${prev}s but meta.durationSec is ${meta.durationSec}s`);
});
gate('fps grid, no gaps, transitions fit', gridFailures ? 'FAIL' : 'PASS');

// Video type rules
const typeFile = meta.type && path.join(root, 'templates', 'types', `${meta.type}.json`);
const type = typeFile && fs.existsSync(typeFile) ? readJson(typeFile) : null;
if (meta.type && !type) blockers.push(`meta.type "${meta.type}" has no file in templates/types/`);
if (type) {
  if (meta.durationSec < type.lengthSec.min || meta.durationSec > type.lengthSec.max) warnings.push(`${type.label} usually runs ${type.lengthSec.min} to ${type.lengthSec.max} s; this is ${meta.durationSec} s`);
  beats.forEach((b) => {
    const len = b.end - b.start;
    if (len < type.pacing.beatSec.min || len > type.pacing.beatSec.max) warnings.push(`beat "${b.id}": ${len.toFixed(1)} s is outside ${type.label}'s ${type.pacing.beatSec.min} to ${type.pacing.beatSec.max} s beat range`);
  });
}

// Speaking pace. Uses real word timings when they exist, otherwise the beat length.
const syllables = (w) => {
  const s = w.toLowerCase().replace(/[^a-z]/g, '').replace(/(?:[^laeiouy]e)$/, (m) => m[0]);
  return Math.max(1, (s.match(/[aeiouy]+/g) || []).length);
};
const wordsPath = path.join(dir, 'edit', 'words.json');
const words = fs.existsSync(wordsPath) ? readJson(wordsPath) : null;
const maxPace = type?.pacing.maxSylPerSec ?? 5;
let paceWarnings = 0;
let paceMeasured = 0;
beats.forEach((b) => {
  let syl = 0;
  let span = 0;
  const inBeat = meta.audio && words ? words.filter((w) => w.start >= b.start - 0.05 && w.start < b.end - 0.05) : [];
  if (inBeat.length) {
    syl = inBeat.reduce((a, w) => a + syllables(w.word), 0);
    span = inBeat[inBeat.length - 1].end - inBeat[0].start;
  } else if (b.vo) {
    syl = b.vo.split(/\s+/).filter(Boolean).reduce((a, w) => a + syllables(w), 0);
    span = b.end - b.start - 0.5;
  }
  if (!syl) return;
  paceMeasured++;
  const rate = syl / Math.max(0.5, span);
  if (rate > maxPace) { paceWarnings++; warnings.push(`beat "${b.id}": voiceover ~${rate.toFixed(1)} syl/s is over ${maxPace}; trim the line or lengthen the beat`); }
});
gate('Speaking pace', !paceMeasured ? 'N/A' : paceWarnings ? 'WARN' : 'PASS', paceMeasured ? `limit ${maxPace} syl/s` : 'no voiceover in this job');

// Colour lint
const colourFailures = [...lintSource(), ...lintPlan(planText, brand)];
colourFailures.forEach((m) => blockers.push(`colour lint: ${m}`));
gate('Colour lint (hex not in brand.json)', colourFailures.length ? 'FAIL' : 'PASS');

// Claims log
const requireLogs = meta.gates === 2;
const claimsPath = path.join(dir, 'claims.json');
const SKIP_KEYS = new Set(['src', 'icon', 'device', 'type', 'mode', 'align', 'tone', 'direction', 'position', 'url']);
const CLAIM_WORDS = /\b(best|fastest|leading|guaranteed?|certified|compliant|proven|award|patented|\d+x)\b/gi;
if (fs.existsSync(claimsPath)) {
  const {claims = []} = readJson(claimsPath);
  const failures = count(() => {
    const STATUS = ['confirmed', 'unconfirmed', 'illustrative'];
    claims.forEach((c, i) => {
      if (!c.text || !c.beat || !c.source || !STATUS.includes(c.status)) blockers.push(`claims.json entry ${i + 1}: needs text, beat, source and a status of ${STATUS.join(', ')}`);
    });
    beats.forEach((b) => {
      const logged = claims.filter((c) => c.beat === b.id).map((c) => String(c.text).toLowerCase()).join(' | ');
      const tokens = new Set();
      const scan = (v, k) => {
        if (SKIP_KEYS.has(k)) return;
        if (typeof v === 'number' && ['value', 'values'].includes(k)) tokens.add(String(v));
        if (typeof v === 'string') {
          (v.match(/\S*\d\S*/g) || []).filter((t) => !/^[23]D$/i.test(t)).forEach((t) => tokens.add(t.replace(/[.,;:!?)]+$/, '')));
          (v.match(CLAIM_WORDS) || []).forEach((t) => tokens.add(t));
        }
      };
      walk(b.props, '', scan);
      if (b.vo) scan(b.vo, 'vo');
      [...tokens].filter((t) => !logged.includes(t.toLowerCase())).forEach((t) => blockers.push(`beat "${b.id}": "${t}" looks like a claim but is not logged for this beat in claims.json`));
    });
  });
  const unconfirmed = claims.filter((c) => c.status === 'unconfirmed');
  unconfirmed.forEach((c) => warnings.push(`unconfirmed claim on beat "${c.beat}": ${c.text}`));
  gate('Claims log', failures ? 'FAIL' : unconfirmed.length ? 'WARN' : 'PASS', `${claims.length} logged, ${unconfirmed.length} unconfirmed`);
} else if (requireLogs) {
  blockers.push('claims.json is missing');
  gate('Claims log', 'FAIL', 'missing');
} else {
  warnings.push('no claims.json (job predates the claims log; list claims in brief.md)');
  gate('Claims log', 'NOT RUN', 'job has no claims.json');
}

// Assets log
const assetsPath = path.join(dir, 'assets.json');
if (fs.existsSync(assetsPath)) {
  const {assets = []} = readJson(assetsPath);
  const listFiles = (d) => (fs.existsSync(d) ? fs.readdirSync(d, {withFileTypes: true}).flatMap((e) => (e.isDirectory() ? listFiles(path.join(d, e.name)) : [path.join(d, e.name)])) : []);
  const onDisk = listFiles(pub).map((f) => path.relative(pub, f).replace(/\\/g, '/'));
  const failures = count(() => {
    const byFile = new Map(assets.map((a) => [a.file, a]));
    onDisk.forEach((f) => {
      const a = byFile.get(f);
      if (!a) blockers.push(`assets.json: ${f} is not logged`);
      else if (!a.source || !a.licence || /\bOPEN\b/.test(`${a.source} ${a.licence}`)) blockers.push(`assets.json: ${f} needs a source and a licence`);
    });
    assets.filter((a) => !onDisk.includes(a.file)).forEach((a) => warnings.push(`assets.json lists ${a.file}, which is not in public/jobs/${id}/`));
  });
  gate('Assets log (source and licence)', failures ? 'FAIL' : 'PASS', `${onDisk.length} file(s)`);
} else if (requireLogs) {
  blockers.push('assets.json is missing');
  gate('Assets log (source and licence)', 'FAIL', 'missing');
} else {
  warnings.push('no assets.json (job predates the assets log)');
  gate('Assets log (source and licence)', 'NOT RUN', 'job has no assets.json');
}

// Loudness, measured on the rendered file
const final = path.join(root, 'out', `${id}-final.mp4`);
if (!meta.audio) {
  gate('Loudness', 'N/A', 'no audio');
} else if (!fs.existsSync(final)) {
  gate('Loudness', 'NOT RUN', 'no rendered file yet');
} else {
  const {stderr} = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', final, '-map', '0:a:0', '-af', 'ebur128=peak=true', '-f', 'null', '-'], {encoding: 'utf8'});
  const summary = stderr.slice(stderr.lastIndexOf('Summary:'));
  const I = Number(/I:\s*(-?[\d.]+) LUFS/.exec(summary)?.[1]);
  const TP = Number(/True peak:[\s\S]*?Peak:\s*(-?[\d.]+) dBFS/.exec(summary)?.[1]);
  if (!Number.isFinite(I) || !Number.isFinite(TP)) {
    gate('Loudness', 'NOT RUN', 'could not read ffmpeg output');
  } else {
    const fails = Math.abs(I + 14) > 0.5 || TP > -1.5;
    if (fails) blockers.push(`loudness: ${I} LUFS / ${TP} dBTP on out/${id}-final.mp4, target -14 LUFS (within 0.5) and at or below -1.5 dBTP`);
    gate('Loudness', fails ? 'FAIL' : 'PASS', `${I} LUFS, ${TP} dBTP`);
  }
  if (fs.statSync(final).mtimeMs < fs.statSync(path.join(dir, 'plan.json')).mtimeMs) warnings.push(`out/${id}-final.mp4 is older than plan.json, so the loudness result may be stale`);
}

// Browser gates
const browserGates = ['Text contrast (WCAG, real background)', 'Text overflow (layout-utils)', 'Safe zones', 'Fonts from brand.json'];
const staticBlockers = blockers.length;
if (isStatic) {
  browserGates.forEach((g) => gate(g, 'NOT RUN', '--static'));
} else if (staticBlockers) {
  browserGates.forEach((g) => gate(g, 'NOT RUN', 'fix the blockers above first'));
} else {
  spawnSync('node', [path.join(root, 'tools', 'sync.mjs')], {stdio: 'ignore'});
  const {runAudit} = await import('./audit.mjs');
  const r = await runAudit(id, {ratio});
  r.blockers.forEach((b) => blockers.push(b));
  r.warnings.forEach((w) => warnings.push(w));
  const has = (k) => r.blockers.filter((b) => b.includes(`: ${k}: `)).length;
  const low = r.lowestContrast ? `lowest ${r.lowestContrast.value.toFixed(2)}:1` : '';
  const line = (n) => (n ? `FAIL` : 'PASS');
  gate(browserGates[0], line(has('contrast')), low);
  gate(browserGates[1], line(has('overflow')), `${r.textsChecked} text checks on ${r.framesChecked} frames`);
  gate(browserGates[2], line(has('safe zone')), r.ratio);
  gate(browserGates[3], line(has('font')));
}

console.log(`Job: ${id}  (${meta.width}x${meta.height} @ ${meta.fps} fps, ${meta.durationSec}s, ${beats.length} beats${meta.type ? `, ${meta.type}` : ''})${ratio ? `  audited at ${ratio}` : ''}`);
warnings.forEach((w) => console.log('  warn:    ' + w));
blockers.forEach((b) => console.log('  BLOCKER: ' + b));
console.log('\nGates:');
gates.forEach((g) => console.log(`  ${g.result.padEnd(8)} ${g.name}${g.detail ? `  (${g.detail})` : ''}`));
console.log(blockers.length ? `\n${blockers.length} blocker(s). Fix before storyboard/render.` : '\nNo blockers.');
process.exit(blockers.length ? 1 : 0);
