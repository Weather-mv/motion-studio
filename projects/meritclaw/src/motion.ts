// Spring and interpolate physics. Everything is a pure function of the frame, so stills and renders always agree.
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

// Named spring presets. Higher stiffness = faster, lower damping = more overshoot, more mass = heavier.
export const SPRINGS = {
  snap: {damping: 16, stiffness: 260, mass: 0.6}, // UI snaps into place, almost no overshoot
  pop: {damping: 9, stiffness: 190, mass: 0.7}, // clear overshoot, for things that pop out
  soft: {damping: 20, stiffness: 120, mass: 1}, // floaty arrivals
  heavy: {damping: 13, stiffness: 150, mass: 2.4}, // heavy landing with one small rebound
} as const;
export type SpringName = keyof typeof SPRINGS;

export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1), // fast start, long settle
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.55, 0, 1, 0.45), // accelerating, used for falling
} as const;

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

// 0..1 over [from, to] frames with an easing.
export const ramp = (frame: number, from: number, to: number, ease: (n: number) => number = EASE.out) =>
  interpolate(frame, [from, to], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

// Spring value starting at `at`. Reads 0 before it starts and settles on 1 (overshoots on the way for pop and heavy).
export const useSpringAt = (at: number, preset: SpringName = 'snap') => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: Math.max(0, frame - at), fps, config: SPRINGS[preset]});
};

// Decaying shake: amplitude falls off exponentially after `at`.
export const shake = (frame: number, at: number, amp: number, hz = 7, decayPerSec = 6, fps = 30) => {
  if (frame < at) return 0;
  const s = (frame - at) / fps;
  return amp * Math.exp(-decayPerSec * s) * Math.sin(2 * Math.PI * hz * s);
};
