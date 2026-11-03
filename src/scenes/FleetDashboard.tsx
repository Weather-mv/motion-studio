import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme} from '../core/theme';
import type {Brand, SceneProps} from '../core/types';

// Illustrative fleet UI, drawn in code: no real data, numbers or robot IDs. All timing comes from plan.json.
// Layout follows the guideline's 1920x1080 post: 96 px margins, text column left, logo at x 96, y 80.
const MARGIN = 96;
const GRID = {left: 768, top: 118, cardW: 198, cardH: 410, gap: 16, rowGap: 24};
type Field = 'identity' | 'location' | 'status' | 'performance';

export const alpha = (hex: string, a: number) => hex + Math.round(a * 255).toString(16).padStart(2, '0');

export const glassStyle = (brand: Brand): React.CSSProperties => {
  const tint = brand.glass?.tint ?? brand.colors.panel;
  const opacity = brand.glass?.opacity ?? 0.2;
  return {
    background: alpha(tint, opacity),
    backdropFilter: 'blur(18px)',
    border: `1px solid ${alpha(tint, Math.min(1, opacity + 0.2))}`,
    boxShadow: `0 12px 40px ${alpha(brand.colors.text, 0.08)}`,
  };
};

// Seconds on the job timeline to a 0..1 reveal that starts exactly on the cue.
export const useReveal = (beatStart: number) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (at: number, frames = 6) => {
    const start = Math.round((at - beatStart) * fps);
    return interpolate(frame, [start - 1, start - 1 + frames], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    });
  };
};

export const Background: React.FC = () => {
  const {brand, jobId} = useTheme();
  return brand.background ? (
    <Img src={staticFile(`jobs/${jobId}/${brand.background}`)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
  ) : (
    <AbsoluteFill style={{background: brand.colors.bg}} />
  );
};

export const Logo: React.FC<{px: number}> = ({px}) => {
  const {brand, jobId} = useTheme();
  return brand.logo ? <Img src={staticFile(`jobs/${jobId}/${brand.logo}`)} style={{position: 'absolute', left: MARGIN, top: 80, width: px, height: px}} /> : null;
};

export const RobotGlyph: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 96 96" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <rect x="30" y="8" width="36" height="20" rx="8" />
    <circle cx="48" cy="18" r="5" />
    <path d="M48 28v10" />
    <rect x="20" y="38" width="56" height="30" rx="10" />
    <path d="M32 53h32" />
    <circle cx="32" cy="78" r="8" />
    <circle cx="64" cy="78" r="8" />
    <path d="M40 78h16" />
  </svg>
);

const WarningIcon: React.FC<{size: number; fill: string; mark: string}> = ({size, fill, mark}) => (
  <svg width={size} height={size} viewBox="0 0 96 96" fill={fill} stroke={fill} strokeWidth={8} strokeLinejoin="round">
    <path d="M48 12 88 82H8Z" />
    <path d="M48 38v22" stroke={mark} strokeWidth={8} strokeLinecap="round" />
    <circle cx="48" cy="71" r="2" stroke={mark} strokeWidth={6} />
  </svg>
);

const EngineerAvatar: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 96 96" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="48" cy="36" r="16" />
    <path d="M26 38v-4a22 22 0 0 1 44 0v4" />
    <rect x="21" y="35" width="7" height="13" rx="3" />
    <rect x="68" y="35" width="7" height="13" rx="3" />
    <path d="M71 48c0 7-6 10-13 10" />
    <path d="M18 88c2-15 14-22 30-22s28 7 30 22" />
  </svg>
);

const statusColor = (brand: Brand, status: string) =>
  status === 'Active' ? brand.colors.accent : status === 'Patrolling' ? brand.colors.secondary : brand.colors.muted;

type CardProps = {index: number; status: string; focus: Field | null; focusAmount: number; alertAmount: number; opacity: number; lift: number};

const Card: React.FC<CardProps> = ({index, status, focus, focusAmount, alertAmount, opacity, lift}) => {
  const {brand} = useTheme();
  const frame = useCurrentFrame();
  const {colors} = brand;
  const col = index % 5;
  const row = Math.floor(index / 5);
  const ring = (f: Field): React.CSSProperties => ({
    borderRadius: 12,
    outline: focus === f ? `3px solid ${alpha(colors.accent, focusAmount)}` : '3px solid transparent',
    outlineOffset: 4,
  });
  // Deterministic "live" movement: bars only, never a number.
  const bars = [0.2, 1.3, 2.1].map((seed, i) => 0.42 + 0.38 * Math.sin(frame / (11 + i * 3) + index * 1.7 + seed));
  const pinX = 28 + ((index * 37) % 104);
  const pinY = 18 + ((index * 53) % 48);
  return (
    <div
      style={{
        ...glassStyle(brand),
        position: 'absolute',
        left: GRID.left + col * (GRID.cardW + GRID.gap),
        top: GRID.top + row * (GRID.cardH + GRID.rowGap) + (1 - lift) * 24,
        width: GRID.cardW,
        height: GRID.cardH,
        borderRadius: 20,
        padding: 18,
        boxSizing: 'border-box',
        opacity,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        ...(alertAmount > 0 ? {border: `3px solid ${alpha(colors.warn, alertAmount)}`, boxShadow: `0 0 44px ${alpha(colors.warn, 0.5 * alertAmount)}`} : {}),
      }}
    >
      <div style={{...ring('identity'), display: 'flex', justifyContent: 'center', position: 'relative'}}>
        <RobotGlyph size={100} color={colors.text} />
      </div>
      <svg width="100%" height="84" viewBox="0 0 160 84" preserveAspectRatio="none" style={{...ring('location'), display: 'block', background: alpha(colors.muted, 0.1)}}>
        <path d="M0 58 C40 30 70 70 160 26" stroke={alpha(colors.muted, 0.6)} strokeWidth={3} fill="none" />
        <path d="M52 0 C60 30 96 50 104 84" stroke={alpha(colors.muted, 0.35)} strokeWidth={3} fill="none" />
        <circle cx={pinX} cy={pinY} r={8} fill={colors.accent} />
      </svg>
      <div style={{...ring('status'), display: 'flex', alignItems: 'center', gap: 8, fontFamily: brand.fonts.body, fontSize: 28, color: colors.text, height: 40}}>
        {alertAmount > 0 ? (
          <div style={{display: 'flex', opacity: alertAmount}}>
            <WarningIcon size={40} fill={colors.warn} mark={colors.text} />
          </div>
        ) : (
          <>
            <span style={{width: 14, height: 14, flex: 'none', borderRadius: 7, background: statusColor(brand, status)}} />
            {status}
          </>
        )}
      </div>
      <div style={{...ring('performance'), display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 2}}>
        {bars.map((v, i) => (
          <div key={i} style={{height: 12, borderRadius: 6, background: alpha(colors.muted, 0.18)}}>
            <div style={{height: '100%', width: `${v * 100}%`, borderRadius: 6, background: colors.accent}} />
          </div>
        ))}
      </div>
    </div>
  );
};

export const RobotDashboard: React.FC<SceneProps> = ({props, beatStart = 0}) => {
  const {brand} = useTheme();
  const reveal = useReveal(beatStart);
  const captions: {text: string; at: number; field: Field}[] = props.captions;
  const statuses: string[] = props.statuses;
  const {from, to} = props.cardsIn;
  const activeIndex = captions.reduce((acc, c, i) => (reveal(c.at, 1) > 0 ? i : acc), -1);
  const active = activeIndex >= 0 ? captions[activeIndex] : null;
  const focusAmount = active ? reveal(active.at) : 0;
  return (
    <AbsoluteFill>
      <Background />
      <Logo px={props.logoPx} />
      {statuses.map((s, i) => {
        const a = reveal(from + ((to - from) * i) / statuses.length, 8);
        return <Card key={i} index={i} status={s} focus={active?.field ?? null} focusAmount={focusAmount} alertAmount={0} opacity={a} lift={a} />;
      })}
      <div style={{position: 'absolute', left: MARGIN, top: 330, width: 640, fontFamily: brand.fonts.heading, fontWeight: 700, fontSize: 56, lineHeight: 1, letterSpacing: '-0.02em', color: brand.colors.text}}>
        {captions.map((c, i) => {
          const a = reveal(c.at);
          return (
            <div key={c.text} style={{position: 'relative', paddingLeft: 26, marginBottom: 44, opacity: a, transform: `translateY(${(1 - a) * 14}px)`}}>
              {i === activeIndex ? <span style={{position: 'absolute', left: 0, top: 2, width: 6, height: 52, borderRadius: 3, background: brand.colors.accent}} /> : null}
              {c.text}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const AnomalyAlert: React.FC<SceneProps> = ({props, beatStart = 0}) => {
  const {brand} = useTheme();
  const {colors} = brand;
  const reveal = useReveal(beatStart);
  const statuses: string[] = props.statuses;
  const cardAlert = reveal(props.cardAlertAt);
  const panel = reveal(props.alertPanelAt);
  const avatar = reveal(props.avatarAt);
  const captions: {lines: string[]; at: number; icon?: boolean}[] = props.captions;
  return (
    <AbsoluteFill>
      <Background />
      <Logo px={props.logoPx} />
      {statuses.map((s, i) => {
        const isAlert = i === props.alertCard;
        return <Card key={i} index={i} status={s} focus={null} focusAmount={0} alertAmount={isAlert ? cardAlert : 0} opacity={isAlert ? 1 : 1 - 0.55 * panel} lift={1} />;
      })}
      <div style={{position: 'absolute', left: MARGIN, top: 280, width: 640, fontFamily: brand.fonts.heading, fontWeight: 700, fontSize: 72, lineHeight: 1, letterSpacing: '-0.02em', color: colors.text}}>
        {captions.map((c) => {
          const a = reveal(c.at);
          return (
            <div key={c.at} style={{marginBottom: 64, opacity: a, transform: `translateY(${(1 - a) * 14}px)`}}>
              {c.icon ? (
                <div style={{marginBottom: 16}}>
                  <WarningIcon size={84} fill={colors.warn} mark={colors.text} />
                </div>
              ) : null}
              {c.lines.map((l) => (
                <div key={l}>{l}</div>
              ))}
            </div>
          );
        })}
      </div>
      <div
        style={{
          ...glassStyle(brand),
          position: 'absolute',
          left: 960,
          top: 200,
          width: 672,
          height: 340,
          borderRadius: 28,
          border: `3px solid ${colors.warn}`,
          boxShadow: `0 0 70px ${alpha(colors.warn, 0.45)}`,
          backdropFilter: 'blur(30px)',
          opacity: panel,
          transform: `scale(${0.92 + 0.08 * panel})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 56,
        }}
      >
        <WarningIcon size={170} fill={colors.warn} mark={colors.text} />
        <RobotGlyph size={200} color={colors.text} />
      </div>
      <svg width="1920" height="1080" style={{position: 'absolute', inset: 0, opacity: avatar}}>
        <path d="M1380 540V552" stroke={colors.accent} strokeWidth={3} />
      </svg>
      <div
        style={{
          ...glassStyle(brand),
          position: 'absolute',
          left: 1272,
          top: 552,
          width: 216,
          height: 216,
          borderRadius: 108,
          backdropFilter: 'blur(30px)',
          opacity: avatar,
          transform: `scale(${0.85 + 0.15 * avatar})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <EngineerAvatar size={150} color={colors.text} />
      </div>
    </AbsoluteFill>
  );
};
