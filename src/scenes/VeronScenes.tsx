import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme} from '../core/theme';
import type {SceneProps} from '../core/types';
import {Background, Logo, RobotGlyph, alpha, glassStyle, useReveal} from './FleetDashboard';

// Illustrative scenes, drawn in code. No real site, data, numbers or robot IDs. All timing comes from plan.json.
const MARGIN = 96;

const entrance = (a: number): React.CSSProperties => ({opacity: a, transform: `translateY(${(1 - a) * 14}px)`});

// Ten patrol spots on the grounds: home position, sweep distance and speed.
const PATROLS = [
  {x: 150, y: 800, sweep: 70, speed: 26},
  {x: 400, y: 900, sweep: 90, speed: 34},
  {x: 640, y: 790, sweep: 60, speed: 30},
  {x: 860, y: 920, sweep: 80, speed: 38},
  {x: 1080, y: 800, sweep: 70, speed: 28},
  {x: 1290, y: 900, sweep: 90, speed: 32},
  {x: 1500, y: 790, sweep: 60, speed: 36},
  {x: 1720, y: 900, sweep: 70, speed: 30},
  {x: 250, y: 960, sweep: 50, speed: 40},
  {x: 1090, y: 975, sweep: 60, speed: 42},
];
const WINDOWS = [0, 1, 2, 3, 4, 5, 6, 7].flatMap((col) => [0, 1, 2].map((row) => ({col, row, lit: (col * 3 + row * 5) % 4 !== 0})));
const POLES = [1130, 1500, 1880];

export const NightSite: React.FC<SceneProps> = ({props, beatStart = 0}) => {
  const {brand} = useTheme();
  const night = brand.night;
  if (!night) throw new Error('nightSite needs brand.night');
  const frame = useCurrentFrame();
  const reveal = useReveal(beatStart);
  const tag: {text: string; at: number}[] = props.tag;
  const {lines, at, highlightAt} = props.question;
  const highlight = reveal(highlightAt, 8);
  return (
    <AbsoluteFill style={{background: night.sky}}>
      <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={night.sky} />
            <stop offset="1" stopColor={night.skyLow} />
          </linearGradient>
          <radialGradient id="pool">
            <stop offset="0" stopColor={night.light} stopOpacity="0.5" />
            <stop offset="1" stopColor={night.light} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={night.light} stopOpacity="0.32" />
            <stop offset="1" stopColor={night.light} stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="1920" height="720" fill="url(#nightSky)" />
        <rect y="720" width="1920" height="360" fill={night.ground} />
        <rect x="1230" y="340" width="640" height="380" fill={night.building} />
        <rect x="1300" y="290" width="240" height="50" fill={night.building} />
        {WINDOWS.map((w) => (
          <rect key={`${w.col}-${w.row}`} x={1266 + w.col * 74} y={390 + w.row * 100} width="48" height="60" fill={night.window} opacity={w.lit ? 0.9 : 0.12} />
        ))}
        <path d="M0 700H1920" stroke={night.fence} strokeWidth="3" />
        <path d="M0 722H1920" stroke={night.fence} strokeWidth="3" />
        {Array.from({length: 33}, (_, i) => (
          <path key={i} d={`M${i * 60} 684V722`} stroke={night.fence} strokeWidth="3" />
        ))}
        {POLES.map((x) => (
          <g key={x}>
            <path d={`M${x - 26} 300L${x - 170} 720H${x + 118}L${x + 26} 300Z`} fill="url(#cone)" />
            <path d={`M${x} 300V722`} stroke={night.fence} strokeWidth="6" />
            <rect x={x - 26} y="290" width="52" height="12" rx="6" fill={night.light} />
          </g>
        ))}
        {PATROLS.map((p, i) => {
          const x = p.x + p.sweep * Math.sin((frame / p.speed) + i);
          return <ellipse key={i} cx={x} cy={p.y + 40} rx="110" ry="30" fill="url(#pool)" />;
        })}
      </svg>
      {PATROLS.map((p, i) => {
        const x = p.x + p.sweep * Math.sin((frame / p.speed) + i);
        return (
          <div key={i} style={{position: 'absolute', left: x - 42, top: p.y - 44}}>
            <RobotGlyph size={84} color={night.text} />
          </div>
        );
      })}
      <div style={{position: 'absolute', left: MARGIN, top: 150, width: 1120, fontFamily: brand.fonts.heading, fontWeight: 700}}>
        <div style={{display: 'flex', gap: 22, fontSize: 44, lineHeight: 1, color: night.text, marginBottom: 56}}>
          {tag.map((t) => (
            <span key={t.text} style={entrance(reveal(t.at))}>
              {t.text}
            </span>
          ))}
        </div>
        <div style={{...entrance(reveal(at)), fontSize: 100, lineHeight: 1.05, letterSpacing: '-0.02em', color: night.text}}>
          <div>{lines[0]}</div>
          <div style={{color: highlight > 0 ? night.highlight : night.text}}>{lines[1]}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Site map geometry in the panel's own 1056 x 844 space.
const BLOCKS = [
  [330, 250, 360, 260],
  [90, 90, 150, 130],
  [800, 90, 160, 120],
  [800, 600, 170, 130],
  [90, 620, 170, 130],
];
const ROUTES: number[][][] = [
  [[40, 40], [1016, 40], [1016, 804], [40, 804]],
  [[290, 210], [730, 210], [730, 550], [290, 550]],
  [[60, 60], [270, 60], [270, 250], [60, 250]],
  [[770, 60], [990, 60], [990, 240], [770, 240]],
  [[770, 570], [1000, 570], [1000, 760], [770, 760]],
  [[60, 590], [290, 590], [290, 780], [60, 780]],
  [[270, 130], [770, 130], [770, 180], [270, 180]],
  [[290, 650], [770, 650], [770, 700], [290, 700]],
  [[130, 250], [130, 590], [190, 590], [190, 250]],
  [[870, 240], [870, 570], [930, 570], [930, 240]],
];

// Position at a distance along a closed route.
const pointOnRoute = (route: number[][], distance: number) => {
  const segments = route.map((p, i) => {
    const q = route[(i + 1) % route.length];
    return {p, q, length: Math.hypot(q[0] - p[0], q[1] - p[1])};
  });
  const total = segments.reduce((sum, s) => sum + s.length, 0);
  let left = distance % total;
  for (const s of segments) {
    if (left <= s.length) {
      const t = left / s.length;
      return [s.p[0] + (s.q[0] - s.p[0]) * t, s.p[1] + (s.q[1] - s.p[1]) * t];
    }
    left -= s.length;
  }
  return route[0];
};

export const RouteMap: React.FC<SceneProps> = ({props, beatStart = 0}) => {
  const {brand} = useTheme();
  const {colors} = brand;
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const reveal = useReveal(beatStart);
  const captions: {text: string; at: number}[] = props.captions;
  const robots = reveal(captions[0].at);
  const routes = reveal(captions[1].at, 8);
  const verified = reveal(captions[2].at, 8);
  const tick = brand.glass?.tint ?? colors.panel;
  return (
    <AbsoluteFill>
      <Background />
      <Logo px={props.logoPx} />
      <div style={{position: 'absolute', left: MARGIN, top: 330, width: 640, fontFamily: brand.fonts.heading, fontWeight: 700, fontSize: 72, lineHeight: 1, letterSpacing: '-0.02em', color: colors.text}}>
        {captions.map((c) => (
          <div key={c.text} style={{marginBottom: 44, ...entrance(reveal(c.at))}}>
            {c.text}
          </div>
        ))}
      </div>
      <div style={{...glassStyle(brand), position: 'absolute', left: 768, top: 118, width: 1056, height: 844, borderRadius: 28, overflow: 'hidden'}}>
        <svg width="1056" height="844" viewBox="0 0 1056 844">
          {BLOCKS.map(([x, y, w, h]) => (
            <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx="12" fill={alpha(colors.muted, 0.14)} stroke={alpha(colors.muted, 0.4)} strokeWidth="3" />
          ))}
          {ROUTES.slice(0, props.robots).map((route, i) => (
            <g key={i}>
              <polygon points={route.map((p) => p.join(',')).join(' ')} fill="none" stroke={alpha(colors.muted, 0.45)} strokeWidth="3" strokeLinejoin="round" />
              <polygon points={route.map((p) => p.join(',')).join(' ')} fill="none" stroke={alpha(colors.accent, routes * 0.85)} strokeWidth="3" strokeLinejoin="round" />
            </g>
          ))}
          {ROUTES.slice(0, props.robots).map((route, i) => {
            const [x, y] = pointOnRoute(route, 90 + i * 137 + (frame / fps) * 60);
            const radius = (14 + 6 * verified) * robots;
            return (
              <g key={i} transform={`translate(${x} ${y})`}>
                <circle r={radius + 6} fill={alpha(colors.accent, 0.2)} />
                <circle r={radius} fill={colors.accent} />
                <path d="M-9 0l6 7 12-14" fill="none" stroke={tick} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity={verified} />
              </g>
            );
          })}
        </svg>
      </div>
    </AbsoluteFill>
  );
};

export const LogoEndCard: React.FC<SceneProps> = ({props, beatStart = 0}) => {
  const {brand, jobId} = useTheme();
  const {colors} = brand;
  const reveal = useReveal(beatStart);
  const lines: {text: string; at: number}[] = props.lines;
  return (
    <AbsoluteFill>
      <Background />
      {brand.logo ? (
        <Img src={staticFile(`jobs/${jobId}/${brand.logo}`)} style={{position: 'absolute', left: MARGIN, top: 54, width: 440, height: 440, opacity: reveal(props.logoAt)}} />
      ) : null}
      <div style={{position: 'absolute', left: MARGIN, top: 520, width: 1400, fontFamily: brand.fonts.heading, color: colors.text}}>
        <div style={{fontWeight: 700, fontSize: 84, lineHeight: 1.05, letterSpacing: '-0.02em'}}>
          {lines.map((l) => (
            <div key={l.text} style={entrance(reveal(l.at))}>
              {l.text}
            </div>
          ))}
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 40, marginTop: 56}}>
          <div
            style={{
              ...glassStyle(brand),
              ...entrance(reveal(props.button.at)),
              height: 80,
              padding: '0 44px',
              borderRadius: 40,
              border: `3px solid ${colors.accent}`,
              display: 'flex',
              alignItems: 'center',
              color: colors.accent,
              fontWeight: 700,
              fontSize: 40,
            }}
          >
            {props.button.text}
          </div>
          <div style={{...entrance(reveal(props.url.at)), fontFamily: brand.fonts.body, fontWeight: 400, fontSize: 44}}>{props.url.text}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
