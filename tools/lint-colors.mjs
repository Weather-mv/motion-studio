// Colour lint. Fails on a hex colour that does not come from brand.json.
// Scene and core code may hold no colour literals at all. A plan may only use hex values from its own brand.json.
import fs from 'node:fs';
import path from 'node:path';
import {root} from './lib/scaffold.mjs';

const HEX = /(?<![\w&(])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g;
const FUNC = /\b(?:rgba?|hsla?)\(\s*\d/g;

const walk = (dir) => fs.readdirSync(dir, {withFileTypes: true}).flatMap((e) => {
  const p = path.join(dir, e.name);
  return e.isDirectory() ? walk(p) : [p];
});

export const lintSource = () => {
  const found = [];
  for (const file of walk(path.join(root, 'src'))) {
    if (!/\.tsx?$/.test(file) || file.endsWith('jobs.generated.ts')) continue;
    fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      if (line.trim().startsWith('//')) return;
      for (const m of [...line.matchAll(HEX), ...line.matchAll(FUNC)]) found.push(`${path.relative(root, file).replace(/\\/g, '/')}:${i + 1}: colour literal ${m[0]}`);
    });
  }
  return found;
};

export const brandColors = (brand) => {
  const out = new Set();
  const visit = (v) => {
    if (typeof v === 'string') { for (const m of v.matchAll(HEX)) out.add(m[0].toUpperCase()); return; }
    if (v && typeof v === 'object') Object.values(v).forEach(visit);
  };
  visit(brand);
  return out;
};

export const lintPlan = (planText, brand) => {
  const allowed = brandColors(brand);
  return [...planText.matchAll(HEX)].map((m) => m[0]).filter((h) => !allowed.has(h.toUpperCase())).map((h) => `plan.json: ${h} is not in brand.json`);
};
