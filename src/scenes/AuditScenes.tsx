import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme} from '../core/theme';
import type {SceneProps} from '../core/types';
import {Background, Logo, RobotGlyph, alpha, glassStyle, useReveal} from './FleetDashboard';

// Illustrative scenes for the veron-audit job, drawn in code: no real fleet, data or counts beyond what the
// brief lists as illustrative. All timing comes from plan.json, aligned to the voiceover word timestamps.
const MARGIN = 96;
const entrance = (a: number): React.CSSProperties => ({opacity: a, transform: `translateY(${(1 - a) * 14}px)`});

const Heading: React.FC<{lines: {text: string; at: number}[]; reveal: (at: number, frames?: number) => number; top?: number}> = ({lines, reveal, top = 108}) => {
  const {brand} = useTheme();
  return (
    <div style={{position: 'absolute', left: MARGIN, top, width: 1200, fontFamily: brand.fonts.heading, fontWeight: 700, fontSize: 64, lineHeight: 1.08, letterSpacing: '-0.02em', color: brand.colors.text}}>
      {lines.map((l) => (
        <div key={l.text} style={entrance(reveal(l.at))}>
          {l.text}
        </div>
      ))}
    </div>
  );
};

const CheckGlyph: React.FC<{size: number; color: string; tick: string; opacity: number}> = ({size, color, tick, opacity}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{opacity}}>
    <circle cx="12" cy="12" r="11" fill={color} />
    <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke={tick} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// A glass "desk" strip stacking up in step, growing brighter with orange as the stack rises.
const DeskStack: React.FC<{reveal: (at: number, frames?: number) => number; from: number; to: number; count: number; glowAt: number; left: number; top: number; width: number}> = ({
  reveal,
  from,
  to,
  count,
  glowAt,
  left,
  top,
  width,
}) => {
  const {brand} = useTheme();
  const {colors} = brand;
  const glow = reveal(glowAt, 10);
  const barH = 64;
  const gap = 14;
  return (
    <div style={{position: 'absolute', left, top, width, display: 'flex', flexDirection: 'column-reverse', gap}}>
      {Array.from({length: count}, (_, i) => {
        const a = reveal(from + ((to - from) * i) / count, 8);
        return (
          <div
            key={i}
            style={{
              ...glassStyle(brand),
              height: barH,
              borderRadius: 14,
              opacity: a,
              transform: `translateY(${(1 - a) * 18}px)`,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '0 20px',
              boxSizing: 'border-box',
              ...(i === count - 1 ? {border: `2px solid ${alpha(colors.warn, glow)}`, boxShadow: `0 0 ${36 * glow}px ${alpha(colors.warn, 0.55 * glow)}`} : {}),
            }}
          >
            <span style={{width: 14, height: 14, borderRadius: 7, background: alpha(colors.warn, 0.4 + 0.5 * glow), flex: 'none'}} />
            <span style={{width: '100%', height: 10, borderRadius: 5, background: alpha(colors.muted, 0.22)}} />
          </div>
        );
      })}
    </div>
  );
};

const FleetGrid: React.FC<{reveal: (at: number, frames?: number) => number; from: number; to: number; count: number; left: number; top: number; cols: number; cell: number}> = ({
  reveal,
  from,
  to,
  count,
  left,
  top,
  cols,
  cell,
}) => {
  const {brand} = useTheme();
  return (
    <>
      {Array.from({length: count}, (_, i) => {
        const a = reveal(from + ((to - from) * i) / count, 6);
        const col = i % cols;
        const row = Math.floor(i / cols);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: left + col * cell,
              top: top + row * cell,
              width: cell - 20,
              height: cell - 20,
              opacity: a,
              transform: `scale(${0.7 + 0.3 * a})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...glassStyle(brand),
              borderRadius: 20,
            }}
          >
            <RobotGlyph size={cell * 0.5} color={brand.colors.secondary} />
          </div>
        );
      })}
    </>
  );
};

// Beat "hook": robots multiply in a glass tile; desks stack beside them with a rising orange glow.
export const FleetOverhead: React.FC<SceneProps> = ({props, beatStart = 0}) => {
  const {brand} = useTheme();
  const reveal = useReveal(beatStart);
  const heading: {text: string; at: number}[] = props.heading;
  const robots = props.robots;
  const desks = props.desks;
  return (
    <AbsoluteFill>
      <Background />
      <Heading lines={heading} reveal={reveal} />
      <div style={{...glassStyle(brand), position: 'absolute', left: MARGIN, top: 280, width: 760, height: 600, borderRadius: 32}} />
      <FleetGrid reveal={reveal} from={robots.from} to={robots.to} count={robots.count} left={MARGIN + 50} top={330} cols={3} cell={220} />
      <div style={{...glassStyle(brand), position: 'absolute', left: 1016, top: 280, width: 808, height: 600, borderRadius: 32}} />
      <DeskStack reveal={reveal} from={desks.from} to={desks.to} count={desks.count} glowAt={desks.glowAt} left={1016 + 40} top={300} width={728} />
    </AbsoluteFill>
  );
};

// Beat "oversight": the desk stack collapses into one Cobalt glass layer carrying the logo, fleet keeps growing.
export const OversightConsolidation: React.FC<SceneProps> = ({props, beatStart = 0}) => {
  const {brand, jobId} = useTheme();
  const {colors} = brand;
  const reveal = useReveal(beatStart);
  const heading: {text: string; at: number} = props.heading;
  const fleet = props.fleet;
  const c = props.consolidate;
  const collapse = reveal(c.collapseFrom, Math.max(1, Math.round((c.collapseTo - c.collapseFrom) * 30)));
  const panelIn = reveal(c.panelInAt, 10);
  const logoIn = reveal(c.logoAt, 10);
  return (
    <AbsoluteFill>
      <Background />
      <Heading lines={[heading]} reveal={reveal} />
      <div style={{...glassStyle(brand), position: 'absolute', left: MARGIN, top: 280, width: 760, height: 600, borderRadius: 32}} />
      <FleetGrid reveal={reveal} from={fleet.from} to={fleet.to} count={fleet.count} left={MARGIN + 50} top={330} cols={3} cell={220} />
      <div
        style={{
          position: 'absolute',
          left: 1016,
          top: 280,
          width: 808,
          height: 600,
          opacity: 1 - collapse,
          transform: `scale(${1 - 0.25 * collapse})`,
        }}
      >
        <div style={{...glassStyle(brand), position: 'absolute', inset: 0, borderRadius: 32}} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 1016,
          top: 280,
          width: 808,
          height: 600,
          borderRadius: 32,
          background: alpha(colors.accent, 0.22),
          border: `3px solid ${alpha(colors.accent, 0.8 * panelIn)}`,
          boxShadow: `0 0 70px ${alpha(colors.accent, 0.4 * panelIn)}`,
          backdropFilter: 'blur(24px)',
          opacity: panelIn,
          transform: `scale(${0.9 + 0.1 * panelIn})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {brand.logo ? <Img src={staticFile(`jobs/${jobId}/${brand.logo}`)} style={{width: 360, opacity: logoIn, transform: `scale(${0.9 + 0.1 * logoIn})`}} /> : null}
      </div>
    </AbsoluteFill>
  );
};

// Beat "audit": a Cobalt timeline builds with verified check marks, while a checklist card fills in on its own.
export const AuditTrail: React.FC<SceneProps> = ({props, beatStart = 0}) => {
  const {brand} = useTheme();
  const {colors} = brand;
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const reveal = useReveal(beatStart);
  const heading: {text: string; at: number} = props.heading;
  const tl = props.timeline;
  const checklist: {label: string; at: number}[] = props.checklist.items;
  const t = reveal(tl.buildFrom, Math.max(1, Math.round((tl.buildTo - tl.buildFrom) * fps)));
  const tick = brand.glass?.tint ?? colors.panel;
  const lineX1 = 160;
  const lineX2 = 1760;
  const lineY = 600;
  const robotXs = [0.1, 0.42, 0.74];
  return (
    <AbsoluteFill>
      <Background />
      <Heading lines={[heading]} reveal={reveal} />
      <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
        <line x1={lineX1} y1={lineY} x2={lineX2} y2={lineY} stroke={alpha(colors.muted, 0.25)} strokeWidth={6} strokeLinecap="round" />
        <line x1={lineX1} y1={lineY} x2={lineX1 + (lineX2 - lineX1) * t} y2={lineY} stroke={colors.accent} strokeWidth={6} strokeLinecap="round" />
        {tl.checks.map((c: {at: number}, i: number) => {
          const a = reveal(c.at, 8);
          const x = lineX1 + (lineX2 - lineX1) * (0.3 + i * 0.35);
          return a > 0 ? (
            <g key={i} transform={`translate(${x} ${lineY})`} opacity={a} style={{transform: `translate(${x}px, ${lineY}px) scale(${0.7 + 0.3 * a})`}}>
              <circle r={22} fill={colors.accent} />
              <path d="M-9 0l6 7 12-14" fill="none" stroke={tick} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          ) : null;
        })}
      </svg>
      {robotXs.map((seed, i) => {
        const x = lineX1 + ((lineX2 - lineX1) * ((frame / fps / 6 + seed) % 1));
        return (
          <div key={i} style={{position: 'absolute', left: x - 30, top: lineY - 96, opacity: t}}>
            <RobotGlyph size={60} color={colors.secondary} />
          </div>
        );
      })}
      <div style={{...glassStyle(brand), position: 'absolute', left: 1180, top: 700, width: 640, height: 300, borderRadius: 28, padding: 32, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 18, justifyContent: 'center'}}>
        {checklist.map((item) => {
          const a = reveal(item.at, 8);
          return (
            <div key={item.label} style={{display: 'flex', alignItems: 'center', gap: 16, opacity: Math.max(a, 0.001)}}>
              <CheckGlyph size={34} color={colors.accent} tick={tick} opacity={a} />
              <span style={{fontFamily: brand.fonts.body, fontSize: 30, color: colors.text}}>{item.label}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Beat "cta": the full fleet beside one steady oversight layer, then the logo and the CTA pill.
export const ScaleFinale: React.FC<SceneProps> = ({props, beatStart = 0}) => {
  const {brand, jobId} = useTheme();
  const {colors} = brand;
  const reveal = useReveal(beatStart);
  const heading: {text: string; at: number}[] = props.heading;
  const fleet = props.fleet;
  const swap = reveal(props.swapAt, 10);
  const logoA = reveal(props.logo.at, 10);
  const buttonA = reveal(props.button.at, 8);
  const urlA = reveal(props.url.at, 8);
  return (
    <AbsoluteFill>
      <Background />
      <div style={{opacity: 1 - swap}}>
        <Heading lines={heading} reveal={reveal} />
        <div style={{...glassStyle(brand), position: 'absolute', left: MARGIN, top: 320, width: 760, height: 520, borderRadius: 32}} />
        <FleetGrid reveal={reveal} from={fleet.from} to={fleet.to} count={fleet.count} left={MARGIN + 30} top={360} cols={3} cell={220} />
        <div
          style={{
            position: 'absolute',
            left: 1016,
            top: 320,
            width: 808,
            height: 520,
            borderRadius: 32,
            background: alpha(colors.accent, 0.18),
            border: `3px solid ${alpha(colors.accent, 0.6)}`,
            backdropFilter: 'blur(24px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {brand.logo ? <Img src={staticFile(`jobs/${jobId}/${brand.logo}`)} style={{width: 280, opacity: 0.9}} /> : null}
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: swap}}>
        {brand.logo ? <Img src={staticFile(`jobs/${jobId}/${brand.logo}`)} style={{width: 420, opacity: logoA, transform: `scale(${0.92 + 0.08 * logoA})`, marginBottom: 48}} /> : null}
        <div style={{display: 'flex', alignItems: 'center', gap: 40}}>
          <div
            style={{
              ...glassStyle(brand),
              opacity: buttonA,
              transform: `translateY(${(1 - buttonA) * 14}px)`,
              height: 88,
              padding: '0 48px',
              borderRadius: 44,
              border: `3px solid ${colors.accent}`,
              display: 'flex',
              alignItems: 'center',
              color: colors.accent,
              fontFamily: brand.fonts.heading,
              fontWeight: 700,
              fontSize: 42,
            }}
          >
            {props.button.text}
          </div>
          <div style={{opacity: urlA, transform: `translateY(${(1 - urlA) * 14}px)`, fontFamily: brand.fonts.body, fontSize: 36, color: colors.text}}>{props.url.text}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
