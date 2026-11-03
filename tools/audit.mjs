// npm run audit -- <job> [--ratio=16x9|9x16|1x1]
// Renders test frames in the real browser and checks what is actually on them: WCAG contrast against the rendered
// background, text overflow (@remotion/layout-utils), safe zones, and fonts and text colours against brand.json.
// Writes only to out/audit/<job>/, never into the job folder.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import sharp from 'sharp';
import {parse, wcagContrast} from 'culori';
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import {SIZES, root} from './lib/scaffold.mjs';

const zones = JSON.parse(fs.readFileSync(path.join(root, 'src', 'core', 'safe-zones.json'), 'utf8'));
const PREFIX = '__AUDIT__';
const hexOf = ({r, g, b}) => '#' + [r, g, b].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('');

const ratioOf = (w, h) => (w > h ? '16x9' : w < h ? '9x16' : '1x1');

// The frames to test in a beat: halfway through, and just before it leaves. Both avoid transitions and blur.
const framesFor = (beats, fps) => beats.flatMap((b) => {
  const start = Math.round(b.start * fps);
  const end = Math.round(b.end * fps);
  const tin = b.transition && b.transition.type !== 'cut' ? Math.round((b.transition.sec ?? 0.4) * fps) : 0;
  const first = start + Math.max(tin, b.props.blurIn ?? 0);
  const last = end - 1 - (b.props.blurOut ?? 0);
  const mid = Math.max(first, Math.round((start + end) / 2));
  const settled = Math.max(first, last);
  return [...new Set([mid, settled])].map((frame) => ({beat: b, frame, settled: frame === settled}));
});

const pool = async (items, size, fn) => {
  let next = 0;
  await Promise.all(Array.from({length: size}, async () => {
    while (next < items.length) { const i = next++; await fn(items[i], i); }
  }));
};

// Lowest contrast (5th percentile, so a few stray pixels do not decide it) of a text colour over the real pixels behind it.
const contrastAgainst = (img, rect, fg, opacity) => {
  const x0 = Math.max(0, Math.floor(rect.x));
  const y0 = Math.max(0, Math.floor(rect.y));
  const x1 = Math.min(img.w, Math.ceil(rect.x + rect.w));
  const y1 = Math.min(img.h, Math.ceil(rect.y + rect.h));
  if (x1 <= x0 || y1 <= y0) return null;
  const step = Math.max(1, Math.ceil(Math.sqrt(((x1 - x0) * (y1 - y0)) / 400)));
  const seen = new Map();
  const values = [];
  for (let y = y0; y < y1; y += step) {
    for (let x = x0; x < x1; x += step) {
      const i = (y * img.w + x) * img.c;
      const key = (img.d[i] << 16) | (img.d[i + 1] << 8) | img.d[i + 2];
      let v = seen.get(key);
      if (v === undefined) {
        const bg = {mode: 'rgb', r: img.d[i] / 255, g: img.d[i + 1] / 255, b: img.d[i + 2] / 255};
        const a = (fg.alpha ?? 1) * opacity;
        const blended = {mode: 'rgb', r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a)};
        v = wcagContrast(blended, bg);
        seen.set(key, v);
      }
      values.push(v);
    }
  }
  values.sort((a, b) => a - b);
  return values[Math.floor(values.length * 0.05)];
};

const brandPalette = (brand) => {
  const out = new Set();
  const add = (o) => Object.values(o ?? {}).forEach((v) => { if (typeof v === 'string' && v.startsWith('#')) out.add(v.toUpperCase()); });
  add(brand.colors); add(brand.night); add(brand.glass);
  return out;
};
const brandFamilies = (brand) => new Set([brand.fonts.heading, brand.fonts.body, ...(brand.fontFiles ?? []).map((f) => f.family)].flatMap((s) => s.split(',')).map((s) => s.trim().replace(/['"]/g, '').toLowerCase()));

export const runAudit = async (id, {ratio} = {}) => {
  const jobDir = path.join(root, 'jobs', id);
  const plan = JSON.parse(fs.readFileSync(path.join(jobDir, 'plan.json'), 'utf8'));
  const brand = JSON.parse(fs.readFileSync(path.join(jobDir, 'brand.json'), 'utf8'));
  if (ratio) { plan.meta.width = SIZES[ratio][0]; plan.meta.height = SIZES[ratio][1]; }
  const {width, height, fps} = plan.meta;
  const activeRatio = ratioOf(width, height);
  const zone = zones[activeRatio];
  // The audit enforces the rule itself: 5% margins, plus any avoid zone. Scenes lay out inside a slightly stricter box.
  const safe = {l: width * zone.margin, t: height * zone.margin, r: width * (1 - zone.margin), b: height * (1 - zone.margin)};
  const rails = zone.avoid.map((a) => ({name: a.name, l: a.x * width, t: a.y * height, r: (a.x + a.w) * width, b: (a.y + a.h) * height}));
  const dir = path.join(root, 'out', 'audit', `${id}-${activeRatio}`);
  fs.rmSync(dir, {recursive: true, force: true});
  fs.mkdirSync(dir, {recursive: true});

  const serveUrl = await bundle({entryPoint: path.join(root, 'src', 'index.ts'), rootDir: root, onProgress: () => undefined});
  const puppeteerInstance = await openBrowser('chrome');
  const palette = brandPalette(brand);
  const families = brandFamilies(brand);
  const blockers = new Map();
  const warnings = new Map();
  const add = (map, beat, frame, kind, msg) => { const k = `${beat}|${kind}|${msg}`; if (!map.has(k)) map.set(k, `beat "${beat}" f${frame}: ${kind}: ${msg}`); };
  let lowest = {value: Infinity};
  let textsChecked = 0;

  try {
    const inputProps = (audit) => ({jobId: id, plan, brand, audit});
    // Props are fixed when a composition is selected, so each mode needs its own.
    const select = (mode) => selectComposition({serveUrl, id, inputProps: inputProps(mode), puppeteerInstance});
    const probeComp = await select('probe');
    const hideComp = await select('hide-text');
    const frames = framesFor(plan.beats, fps);
    await pool(frames, 4, async ({beat, frame, settled}) => {
      let report = null;
      const shot = path.join(dir, `f${frame}-bg.png`);
      await renderStill({composition: probeComp, serveUrl, frame, inputProps: inputProps('probe'), puppeteerInstance, imageFormat: 'png', output: path.join(dir, `f${frame}.png`), overwrite: true,
        onBrowserLog: ({text}) => { if (text.startsWith(PREFIX)) report = JSON.parse(text.slice(PREFIX.length)); }});
      await renderStill({composition: hideComp, serveUrl, frame, inputProps: inputProps('hide-text'), puppeteerInstance, imageFormat: 'png', output: shot, overwrite: true});
      if (!report) { add(blockers, beat.id, frame, 'audit', 'the frame reported nothing, so it could not be checked'); return; }
      const {data, info} = await sharp(shot).raw().toBuffer({resolveWithObject: true});
      const img = {d: data, w: info.width, h: info.height, c: info.channels};

      report.texts.forEach((t) => {
        textsChecked++;
        const label = t.text.length > 40 ? `${t.text.slice(0, 40)}...` : t.text;
        t.issues.forEach((issue) => add(blockers, beat.id, frame, 'overflow', `"${label}" ${issue}`));
        const family = t.family.split(',')[0].trim().replace(/['"]/g, '').toLowerCase();
        if (!families.has(family)) add(blockers, beat.id, frame, 'font', `"${label}" uses ${family}, which is not in brand.json`);
        const fg = parse(t.color);
        if (fg) {
          const hex = hexOf(fg).toUpperCase();
          if (!palette.has(hex)) add(warnings, beat.id, frame, 'colour', `"${label}" renders as ${hex}, which is not in brand.json`);
        }
        const large = t.size >= 24 || (t.size >= 18.66 && t.weight >= 700);
        const need = large ? 3 : 4.5;
        for (const r of t.rects) {
          const pad = 1;
          const outFrame = r.x < -pad || r.y < -pad || r.x + r.w > width + pad || r.y + r.h > height + pad;
          if (outFrame) add(blockers, beat.id, frame, 'overflow', `"${label}" runs off the frame`);
          const slackY = t.size * 0.15;
          if (r.x < safe.l - 2 || r.x + r.w > safe.r + 2 || r.y < safe.t - slackY || r.y + r.h > safe.b + slackY) {
            add(blockers, beat.id, frame, 'safe zone', `"${label}" is outside the ${activeRatio} safe zone (x ${Math.round(r.x)} to ${Math.round(r.x + r.w)}, y ${Math.round(r.y)} to ${Math.round(r.y + r.h)})`);
          }
          for (const a of rails) if (r.x + r.w > a.l && r.x < a.r && r.y + r.h > a.t && r.y < a.b) add(blockers, beat.id, frame, 'safe zone', `"${label}" enters the ${a.name}`);
          if (fg) {
            const ratioValue = contrastAgainst(img, r, fg, t.opacity);
            if (ratioValue !== null) {
              if (ratioValue < lowest.value) lowest = {value: ratioValue, text: label, beat: beat.id, frame};
              // Part-faded text halfway through a beat may just be arriving, so only a settled frame can block.
              const fading = !settled && t.opacity < 0.98;
              if (ratioValue < need) add(fading ? warnings : blockers, beat.id, frame, 'contrast', `"${label}" is ${ratioValue.toFixed(2)}:1, needs ${need}:1 (${t.size.toFixed(0)} px, weight ${t.weight})${fading ? ', mid-fade' : ''}`);
            }
          }
        }
      });
      // Text on top of other text
      for (let i = 0; i < report.texts.length; i++) {
        for (let j = i + 1; j < report.texts.length; j++) {
          for (const a of report.texts[i].rects) for (const b of report.texts[j].rects) {
            const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
            const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
            if (w > 0 && h > 0 && w * h > 0.2 * Math.min(a.w * a.h, b.w * b.h)) add(warnings, beat.id, frame, 'collision', `"${report.texts[i].text.slice(0, 30)}" overlaps "${report.texts[j].text.slice(0, 30)}"`);
          }
        }
      }
      report.images.forEach((im) => {
        const full = im.rect.w * im.rect.h > width * height * 0.9;
        if (full || im.opacity < 0.02) return;
        const {x, y, w, h} = im.rect;
        if (x < safe.l - 2 || x + w > safe.r + 2 || y < safe.t - 2 || y + h > safe.b + 2) add(blockers, beat.id, frame, 'safe zone', `image ${path.basename(im.src ?? '')} is outside the ${activeRatio} safe zone`);
      });
    });
    const result = {job: id, ratio: activeRatio, framesChecked: frames.length, textsChecked, lowestContrast: lowest.value === Infinity ? null : lowest, blockers: [...blockers.values()].sort(), warnings: [...warnings.values()].sort()};
    fs.writeFileSync(path.join(dir, 'audit.json'), JSON.stringify(result, null, 2));
    return result;
  } finally {
    await puppeteerInstance.close({silent: true});
  }
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const id = process.argv[2];
  if (!id) { console.error('Usage: npm run audit -- <job> [--ratio=16x9|9x16|1x1]'); process.exit(1); }
  const ratio = process.argv.slice(3).find((a) => a.startsWith('--ratio='))?.split('=')[1];
  const r = await runAudit(id, {ratio});
  console.log(`Audit: ${id} ${r.ratio}: ${r.framesChecked} frames, ${r.textsChecked} text checks`);
  if (r.lowestContrast) console.log(`  lowest contrast: ${r.lowestContrast.value.toFixed(2)}:1 ("${r.lowestContrast.text}", beat ${r.lowestContrast.beat}, f${r.lowestContrast.frame})`);
  r.warnings.forEach((w) => console.log('  warn:    ' + w));
  r.blockers.forEach((b) => console.log('  BLOCKER: ' + b));
  console.log(r.blockers.length ? `\n${r.blockers.length} blocker(s).` : '\nNo blockers.');
  console.log(`Frames: out/audit/${id}-${r.ratio}/`);
  process.exit(r.blockers.length ? 1 : 0);
}
