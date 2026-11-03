import React from 'react';
import {Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ASSET, COLOR, LAYOUT, TYPE, glass, withAlpha} from './brand';
import {HEADLINE_EXIT} from './timing';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const inOutCubic = Easing.inOut(Easing.cubic);

// A soft arrival with no overshoot. `at` is a frame on the film's timeline.
export const useArrive = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (at: number, durationInFrames = 18) => spring({frame: frame - at, fps, durationInFrames, config: {damping: 200}});
};

export const RobotGlyph: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 96 96" fill="none" stroke={COLOR.ink} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <rect x="30" y="8" width="36" height="20" rx="8" />
    <circle cx="48" cy="18" r="5" stroke={COLOR.cobalt} />
    <path d="M48 28v10" />
    <rect x="20" y="38" width="56" height="30" rx="10" />
    <path d="M32 53h32" stroke={COLOR.cobalt} />
    <circle cx="32" cy="78" r="8" />
    <circle cx="64" cy="78" r="8" />
    <path d="M40 78h16" />
  </svg>
);

export const RobotTile: React.FC<{size: number}> = ({size}) => (
  <div style={{...glass(0.5), width: size, height: size, borderRadius: size * 0.22, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <RobotGlyph size={size * 0.72} />
  </div>
);

// Ten robots in the text column, under the headline. The same grid opens and closes the film.
export const Fleet: React.FC<{at: number; stagger: number; count: number; opacity?: number}> = ({at, stagger, count, opacity = 1}) => {
  const arrive = useArrive();
  const {x, y, tile, gap, columns} = LAYOUT.fleet;
  return (
    <div style={{opacity}}>
      {Array.from({length: count}).map((_, i) => {
        const p = arrive(at + i * stagger, 14);
        return (
          <div key={i} style={{position: 'absolute', left: x + (i % columns) * (tile + gap), top: y + Math.floor(i / columns) * (tile + gap), opacity: p, transform: `scale(${0.7 + 0.3 * p})`}}>
            <RobotTile size={tile} />
          </div>
        );
      })}
    </div>
  );
};

// Two-tone headline: ink, then cobalt. Line breaks are written by hand, as the guideline asks.
// It arrives at `from` and fades out before `to`. With `hold`, it stays on to the end of the film.
// `cobaltAt` lets the second line land later, on its own spoken word.
export const Headline: React.FC<{from: number; to: number; ink: string; cobalt: string; hold?: boolean; cobaltAt?: number}> = ({from, to, ink, cobalt, hold, cobaltAt}) => {
  const frame = useCurrentFrame();
  const arrive = useArrive();
  if (frame < from || frame >= to) return null;
  const p = arrive(from);
  const q = arrive(cobaltAt ?? from);
  const out = hold ? 1 : interpolate(frame, [to - HEADLINE_EXIT, to], [1, 0], clamp);
  const {x, y, width} = LAYOUT.headline;
  return (
    <div style={{...TYPE.headline, position: 'absolute', left: x, top: y, width, whiteSpace: 'nowrap', opacity: out}}>
      <div style={{color: COLOR.ink, opacity: p, transform: `translateY(${(1 - p) * 24}px)`}}>{ink}</div>
      <div style={{color: COLOR.cobalt, opacity: q, transform: `translateY(${(1 - q) * 24}px)`}}>{cobalt}</div>
    </div>
  );
};

// The cobalt oversight layer: the supplied frosted glass file under a cobalt tint, bleeding off the right edge.
// The tint stays light because the logo's dark wordmark cannot be read on solid cobalt, and the logo may not be recoloured.
export const OversightLayer: React.FC<{opacity: number; children?: React.ReactNode}> = ({opacity, children}) => {
  const {graphicLeft, layer} = LAYOUT;
  return (
    <div style={{position: 'absolute', left: graphicLeft, top: layer.top, width: 1920 - graphicLeft + 80, height: layer.height, borderRadius: 48, overflow: 'hidden', opacity, border: `3px solid ${withAlpha(COLOR.cobalt, 0.75)}`, boxShadow: `0 24px 80px ${withAlpha(COLOR.cobalt, 0.28)}`}}>
      <Img src={staticFile(ASSET.frosted)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
      <div style={{position: 'absolute', inset: 0, background: withAlpha(COLOR.cobalt, 0.2)}} />
      {children}
    </div>
  );
};

export const CheckMark: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 48 48" style={{display: 'block'}}>
    <circle cx="24" cy="24" r="24" fill={COLOR.cobalt} />
    <path d="M14 25l7 7 13-15" fill="none" stroke={COLOR.white} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
