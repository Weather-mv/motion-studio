// Builds a new job's plan.json from a video type's beat skeleton. Times are snapped to the frame grid.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const SIZES = {'16x9': [1920, 1080], '9x16': [1080, 1920], '1x1': [1080, 1080]};
const FPS = 30;
const readJson = (...p) => JSON.parse(fs.readFileSync(path.join(root, ...p), 'utf8'));

export const listTypes = () => fs.readdirSync(path.join(root, 'templates', 'types')).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort();
export const readType = (id) => readJson('templates', 'types', `${id}.json`);

export const buildPlan = ({name, ratio, seconds, type}) => {
  const [width, height] = SIZES[ratio];
  const totalFrames = Math.round(seconds * FPS);
  const meta = {title: name, width, height, fps: FPS, durationSec: totalFrames / FPS, gates: 2};
  if (!type) {
    const plan = readJson('templates', 'job', 'plan.json');
    const split = Math.round(totalFrames * 0.3);
    plan.beats[0].end = split / FPS;
    plan.beats[1].start = split / FPS;
    plan.beats[1].end = totalFrames / FPS;
    return {...plan, meta: {...plan.meta, ...meta}};
  }
  const defaults = readJson('templates', 'scene-defaults.json');
  meta.type = type.id;
  let cursor = 0;
  let share = 0;
  const beats = type.beats.map((b, i) => {
    share += b.share;
    const endFrame = i === type.beats.length - 1 ? totalFrames : Math.round(share * totalFrames);
    const beat = {id: b.id, start: cursor / FPS, end: endFrame / FPS, scene: b.scene, props: defaults[b.scene] ?? {}, vo: ''};
    if (i > 0 && type.pacing.defaultTransition !== 'cut') beat.transition = {type: type.pacing.defaultTransition, sec: type.pacing.transitionSec};
    cursor = endFrame;
    return beat;
  });
  return {meta, beats};
};
