import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme} from './theme';
import type {Brand, MotionTokens} from './types';

export const DEFAULT_MOTION: MotionTokens = {
  enterSec: 0.5,
  exitSec: 0.3,
  staggerSec: 0.12,
  transitionSec: 0.4,
  distance: 32,
  enterEase: [0.16, 1, 0.3, 1],
  moveEase: [0.65, 0, 0.35, 1],
};

export const motionTokens = (brand: Brand): MotionTokens => ({...DEFAULT_MOTION, ...brand.motion});
export const toEasing = ([a, b, c, d]: [number, number, number, number]) => Easing.bezier(a, b, c, d);

// Frame-driven motion from the brand's tokens. Times are seconds from the start of the beat.
// Elements are already partly visible on their cue frame, so nothing lands a frame after its word.
export const useMotion = () => {
  const {brand} = useTheme();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tokens = motionTokens(brand);
  const enterEase = toEasing(tokens.enterEase);
  const moveEase = toEasing(tokens.moveEase);
  const progress = (atSec: number, durSec: number = tokens.enterSec, ease: 'enter' | 'move' = 'enter') => {
    const start = Math.round(atSec * fps) - 1;
    return interpolate(frame, [start, start + Math.max(1, durSec * fps)], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: ease === 'enter' ? enterEase : moveEase,
    });
  };
  const enter = (atSec = 0, axis: 'y' | 'x' = 'y'): React.CSSProperties => {
    const p = progress(atSec);
    const d = (1 - p) * tokens.distance;
    return {opacity: p, transform: axis === 'y' ? `translateY(${d}px)` : `translateX(${d}px)`};
  };
  return {tokens, frame, fps, t: frame / fps, progress, enter, moveEase};
};
