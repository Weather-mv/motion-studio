import {useVideoConfig} from 'remotion';
import zones from './safe-zones.json';

export type Ratio = keyof typeof zones;
export const ratioOf = (w: number, h: number): Ratio => (w > h ? '16x9' : w < h ? '9x16' : '1x1');

// Sizes for the current video: safe rectangle, a resolution unit, and a type scale that holds on every ratio.
export const useStage = () => {
  const {width, height} = useVideoConfig();
  const ratio = ratioOf(width, height);
  const z = zones[ratio];
  const unit = Math.min(width, height) / 1080;
  const safe = {
    left: width * z.margin,
    top: height * z.margin,
    right: width * (1 - z.rightInset),
    bottom: height * (1 - z.margin),
    width: width * (1 - z.margin - z.rightInset),
    height: height * (1 - 2 * z.margin),
  };
  const type = {display: 96 * unit, h1: 72 * unit, h2: 48 * unit, h3: 36 * unit, body: 30 * unit, small: 24 * unit};
  return {width, height, ratio, unit, safe, type, landscape: ratio === '16x9'};
};

// Splits the safe area into a text block and a media block.
export const splitLayout = (stage: ReturnType<typeof useStage>, hasText: boolean) => {
  const {safe, landscape} = stage;
  const gap = 48 * stage.unit;
  if (!hasText) return {text: {w: 0, h: 0}, media: {w: safe.width, h: safe.height}, gap: 0, direction: 'column' as const};
  if (landscape) return {text: {w: safe.width * 0.32, h: safe.height}, media: {w: safe.width * 0.68 - gap, h: safe.height}, gap, direction: 'row' as const};
  const textH = safe.height * (stage.ratio === '1x1' ? 0.24 : 0.2);
  return {text: {w: safe.width, h: textH}, media: {w: safe.width, h: safe.height - textH - gap}, gap, direction: 'column' as const};
};
