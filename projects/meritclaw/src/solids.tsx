// Pure CSS 3D building blocks: extruded shapes, floor shadows, glow pools, a billboard cursor.
// An Extrude is a stack of thin layers at rising translateZ, so rounded shapes get real side walls.
import React from 'react';
import {colors, mix, tone} from './config';

type ExtrudeProps = {
  w: number;
  h: number;
  depth: number;
  color: string;
  radius?: number | string;
  x?: number; // centre in the parent's plane
  y?: number;
  z?: number;
  scale?: number;
  rotateZ?: number;
  opacity?: number; // applied per layer, so the 3D stack is not flattened
  glow?: string; // light bleeding onto the floor
  glowSize?: number;
  face?: string; // override for the top face background
  gloss?: number; // 0..1 strength of the diagonal highlight
  glint?: number; // 0..1 position of a moving shine, undefined = none
  step?: number; // layer spacing in px
  children?: React.ReactNode;
};

export const Extrude: React.FC<ExtrudeProps> = ({
  w, h, depth, color, radius = 24, x = 0, y = 0, z = 0, scale = 1, rotateZ = 0, opacity, glow, glowSize = 70,
  face, gloss = 1, glint, step = 3, children,
}) => {
  const n = Math.max(2, Math.round(depth / step));
  const layers: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const k = i / (n - 1); // 0 bottom .. 1 top wall
    layers.push(
      <div
        key={i}
        style={{
          position: 'absolute', inset: 0, borderRadius: radius, opacity,
          transform: `translateZ(${(i * (depth - 0.5)) / (n - 1)}px)`,
          background: mix(color, 'black', 40 + k * 30), // walls get lighter toward the lit top edge
          boxShadow: i === 0 && glow ? `0 0 ${glowSize}px ${glowSize / 3}px ${glow}` : undefined,
        }}
      />,
    );
  }
  return (
    <div
      style={{
        position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, transformStyle: 'preserve-3d',
        transform: `translateZ(${z}px) rotateZ(${rotateZ}deg) scale(${scale})`,
      }}
    >
      {layers}
      <div
        style={{
          position: 'absolute', inset: 0, borderRadius: radius, opacity, transformStyle: 'preserve-3d',
          transform: `translateZ(${depth}px)`,
          background: face ?? `linear-gradient(150deg, ${mix(color, 'white', 72)} 0%, ${color} 42%, ${mix(color, 'black', 80)} 100%)`,
          boxShadow: [
            `inset 0 0 0 1.5px ${mix('white', 'transparent', 40)}`,
            `inset 0 3px 2px ${mix('white', 'transparent', 55)}`,
            `inset 0 -7px 12px ${mix('black', 'transparent', 30)}`,
          ].join(','),
        }}
      >
        {gloss > 0 ? (
          <div
            style={{
              position: 'absolute', inset: 0, borderRadius: radius, pointerEvents: 'none', opacity: gloss,
              background: `linear-gradient(118deg, ${tone.glassHi} 0%, ${tone.glassLo} 40%, transparent 41%)`,
            }}
          />
        ) : null}
        {glint !== undefined && glint > 0 && glint < 1 ? (
          <div
            style={{
              position: 'absolute', inset: 0, borderRadius: radius, pointerEvents: 'none',
              background: `linear-gradient(105deg, transparent ${glint * 140 - 40}%, ${mix('white', 'transparent', 55)} ${glint * 140 - 25}%, transparent ${glint * 140 - 10}%)`,
            }}
          />
        ) : null}
        {children}
      </div>
    </div>
  );
};

// Soft shadow on the floor. The higher the object, the further, fainter and blurrier it gets.
export const FloorShadow: React.FC<{w: number; h: number; radius?: number; x: number; y: number; height: number; strength?: number; scale?: number}> = ({
  w, h, radius = 24, x, y, height, strength = 0.85, scale = 1,
}) => (
  <div
    style={{
      position: 'absolute', left: x + height * 0.45 - (w * scale) / 2, top: y + height * 0.55 - (h * scale) / 2,
      width: w * scale, height: h * scale, borderRadius: radius * scale,
      transform: 'translateZ(0.6px)', background: tone.shadow,
      opacity: strength / (1 + height / 260), filter: `blur(${10 + height * 0.28}px)`,
    }}
  />
);

// Coloured light pooling on the floor under a glowing object.
export const GlowPool: React.FC<{x: number; y: number; size: number; color: string; strength: number}> = ({x, y, size, color, strength}) => (
  <div
    style={{
      position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: '50%',
      transform: 'translateZ(0.4px)', opacity: strength,
      background: `radial-gradient(closest-side, ${mix(color, 'transparent', 70)}, transparent)`,
    }}
  />
);

// Expanding ring on the floor: click ripples and the landing shock wave.
export const Ring: React.FC<{x: number; y: number; z?: number; size: number; p: number; color: string; thick?: number}> = ({x, y, z = 0.8, size, p, color, thick = 8}) =>
  p <= 0 || p >= 1 ? null : (
    <div
      style={{
        position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: '50%',
        transform: `translateZ(${z}px) scale(${0.3 + p * 1.7})`, opacity: 1 - p,
        border: `${thick * (1 - p) + 1}px solid ${color}`,
      }}
    />
  );

// Faces the camera whatever the floor tilt, so the cursor stays readable. Its tip sits at (x, y, z).
export const Billboard: React.FC<{x: number; y: number; z: number; tiltDeg: number; spinDeg: number; scale?: number; children: React.ReactNode}> = ({
  x, y, z, tiltDeg, spinDeg, scale = 1, children,
}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: 0, height: 0, transformStyle: 'preserve-3d', transform: `translate3d(${x}px, ${y}px, ${z}px) rotateZ(${spinDeg}deg) rotateX(${-tiltDeg}deg) scale(${scale})`}}>
    {children}
  </div>
);

export const Cursor: React.FC<{pressed: number}> = ({pressed}) => (
  <svg width="64" height="88" viewBox="0 0 36 50" style={{overflow: 'visible', transform: `scale(${1 - 0.14 * pressed})`, transformOrigin: '0 0', filter: `drop-shadow(${6 - pressed * 3}px ${10 - pressed * 4}px 8px ${mix('black', 'transparent', 55)})`}}>
    <polygon points="1,1 1,40 10,32 17,48 24,45 17,29 29,29" fill={colors.white} stroke={colors.ink} strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);

export const CheckMark: React.FC<{size: number; p: number; stroke?: string}> = ({size, p, stroke = colors.white}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{overflow: 'visible', filter: `drop-shadow(0 2px 2px ${mix('black', 'transparent', 35)})`}}>
    <path d="M5 12.8 L10 17.5 L19 7" fill="none" stroke={stroke} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="22" strokeDashoffset={22 * (1 - p)} />
  </svg>
);

export const LinkIcon: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.white} strokeWidth="2.4" strokeLinecap="round" style={{filter: `drop-shadow(0 0 6px ${mix('white', 'transparent', 60)})`}}>
    <rect x="1.5" y="8.5" width="12" height="7" rx="3.5" transform="rotate(-45 7.5 12)" />
    <rect x="10.5" y="8.5" width="12" height="7" rx="3.5" transform="rotate(-45 16.5 12)" />
  </svg>
);
