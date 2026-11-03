import React, {useMemo} from 'react';
import {Img, interpolate, staticFile} from 'remotion';
import {useMotion} from '../core/motion';
import {SceneFrame, alpha, panelStyle} from '../core/primitives';
import {Icon} from '../core/icons';
import {splitLayout, useStage} from '../core/stage';
import {useTheme} from '../core/theme';
import type {SceneProps} from '../core/types';
import {DeviceFrame, Screen, SideText} from './device';
import {sceneSchemas} from './schemas';

export const DeviceMockup: React.FC<SceneProps> = ({props}) => {
  const p = useMemo(() => sceneSchemas.deviceMockup.parse(props), [props]);
  const stage = useStage();
  const m = useMotion();
  const layout = splitLayout(stage, Boolean(p.headline || p.sub));
  const zoom = interpolate(m.t, [0, 8], [1, p.zoomTo], {extrapolateRight: 'clamp'});
  const arrive = m.progress(0.1, m.tokens.enterSec * 1.4);
  return (
    <SceneFrame style={{flexDirection: layout.direction, gap: layout.gap, alignItems: 'center'}}>
      {layout.text.w ? <SideText headline={p.headline} sub={p.sub} w={layout.text.w} h={layout.text.h} style1={m.enter(0)} style2={m.enter(m.tokens.staggerSec * 2)} /> : null}
      <div style={{width: layout.media.w, height: layout.media.h, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: arrive, transform: `translateY(${(1 - arrive) * m.tokens.distance * 2}px) scale(${zoom})`}}>
        <DeviceFrame device={p.device} boxW={layout.media.w / p.zoomTo} boxH={layout.media.h / p.zoomTo}>
          {(w, h) => <Screen src={p.src} w={w} h={h} />}
        </DeviceFrame>
      </div>
    </SceneFrame>
  );
};

const Cursor: React.FC<{size: number; fill: string; stroke: string; press: number}> = ({size, fill, stroke, press}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{transform: `scale(${1 - 0.18 * press})`, transformOrigin: '4px 3px', display: 'block'}}>
    <path d="M4 3l6 18 3-7.500L20.500 11z" fill={fill} stroke={stroke} strokeWidth={1.5} strokeLinejoin="round" />
  </svg>
);

export const CursorDemo: React.FC<SceneProps> = ({props}) => {
  const p = useMemo(() => sceneSchemas.cursorDemo.parse(props), [props]);
  const stage = useStage();
  const {brand} = useTheme();
  const {unit, type} = stage;
  const c = brand.colors;
  const m = useMotion();
  const layout = splitLayout(stage, Boolean(p.headline || p.sub));
  const path = p.path;
  const travel = 0.6;

  const locate = () => {
    let x = path[0].x;
    let y = path[0].y;
    for (let i = 1; i < path.length; i++) {
      const prog = m.progress(Math.max(path[i - 1].at, path[i].at - travel), Math.min(travel, path[i].at - path[i - 1].at || travel), 'move');
      x += (path[i].x - path[i - 1].x) * prog;
      y += (path[i].y - path[i - 1].y) * prog;
    }
    return {x, y};
  };
  const pos = locate();
  const callout = p.callout;
  const zoomIn = callout ? m.progress(callout.at, 0.6, 'move') : 0;
  const zoomOut = callout?.until !== undefined ? m.progress(callout.until, 0.5, 'move') : 0;
  const zoomP = zoomIn * (1 - zoomOut);
  const clicks = path.filter((s) => s.click).map((s) => m.t - s.at).filter((d) => d >= 0 && d < 0.6);
  const press = clicks.length ? interpolate(clicks[0], [0, 0.08, 0.2], [1, 1, 0], {extrapolateRight: 'clamp'}) : 0;

  return (
    <SceneFrame style={{flexDirection: layout.direction, gap: layout.gap, alignItems: 'center'}}>
      {layout.text.w ? <SideText headline={p.headline} sub={p.sub} w={layout.text.w} h={layout.text.h} style1={m.enter(0)} style2={m.enter(m.tokens.staggerSec * 2)} /> : null}
      <div style={{width: layout.media.w, height: layout.media.h, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28 * unit, opacity: m.progress(0.05)}}>
        <DeviceFrame device={p.device} boxW={layout.media.w} boxH={layout.media.h - (callout?.label ? 110 * unit : 0)}>
          {(w, h) => {
            const zoom = callout?.zoom ?? 1;
            const fx = callout ? ((callout.x + callout.w / 2) / 100) * w : 0;
            const fy = callout ? ((callout.y + callout.h / 2) / 100) * h : 0;
            const tx = Math.min(0, Math.max(w - w * zoom, w / 2 - fx * zoom)) * zoomP;
            const ty = Math.min(0, Math.max(h - h * zoom, h / 2 - fy * zoom)) * zoomP;
            const s = 1 + (zoom - 1) * zoomP;
            return (
              <div style={{width: w, height: h, position: 'relative', transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${s})`}}>
                <Screen src={p.src} w={w} h={h} />
                {callout ? (
                  <div style={{position: 'absolute', left: `${callout.x}%`, top: `${callout.y}%`, width: `${callout.w}%`, height: `${callout.h}%`, border: `${3 * unit}px solid ${c.accent}`, borderRadius: 10 * unit, opacity: zoomP, boxShadow: `0 0 0 ${2000 * unit}px ${alpha(c.text, 0.18 * zoomP)}`}} />
                ) : null}
                {clicks.map((d, i) => {
                  const size = interpolate(d, [0, 0.6], [10, 90], {extrapolateRight: 'clamp'}) * unit;
                  return <div key={i} style={{position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`, width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, borderRadius: '50%', border: `${3 * unit}px solid ${c.accent}`, opacity: interpolate(d, [0, 0.6], [1, 0], {extrapolateRight: 'clamp'})}} />;
                })}
                <div style={{position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`, marginLeft: -6 * unit, marginTop: -5 * unit}}>
                  <Cursor size={44 * unit} fill={c.text} stroke={c.bg} press={press} />
                </div>
              </div>
            );
          }}
        </DeviceFrame>
        {callout?.label ? (
          <div style={{...panelStyle(brand), fontSize: type.body, fontWeight: 700, borderRadius: 40 * unit, padding: `${16 * unit}px ${32 * unit}px`, opacity: zoomP, transform: `translateY(${(1 - zoomP) * 16 * unit}px)`, whiteSpace: 'nowrap'}}>{callout.label}</div>
        ) : null}
      </div>
    </SceneFrame>
  );
};

type Side = {label: string; items?: string[]; src?: string};

const StatePanel: React.FC<{side: Side; kind: 'before' | 'after'; w: number; h: number}> = ({side, kind, w, h}) => {
  const {brand, jobId} = useTheme();
  const {unit, type} = useStage();
  const c = brand.colors;
  const after = kind === 'after';
  return (
    <div style={{...panelStyle(brand), width: w, height: h, borderRadius: 28 * unit, padding: 44 * unit, boxSizing: 'border-box', borderTop: `${8 * unit}px solid ${after ? c.accent : c.muted}`, display: 'flex', flexDirection: 'column', gap: 28 * unit, overflow: 'hidden'}}>
      <div style={{fontFamily: brand.fonts.heading, fontWeight: 700, fontSize: type.h2, color: after ? c.accent : c.muted}}>{side.label}</div>
      {side.src ? <Img src={staticFile(`jobs/${jobId}/${side.src}`)} style={{flex: 1, minHeight: 0, width: '100%', objectFit: 'cover', borderRadius: 12 * unit}} /> : null}
      {(side.items ?? []).map((t, i) => (
        <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18 * unit, fontSize: type.h3 - 2 * unit, lineHeight: 1.25}}>
          <Icon name={after ? 'check' : 'cross'} size={38 * unit} color={after ? c.accent : c.muted} strokeWidth={2.5} />
          <span>{t}</span>
        </div>
      ))}
    </div>
  );
};

export const BeforeAfter: React.FC<SceneProps> = ({props}) => {
  const p = useMemo(() => sceneSchemas.beforeAfter.parse(props), [props]);
  const stage = useStage();
  const {brand} = useTheme();
  const {safe, unit, landscape} = stage;
  const m = useMotion();
  const reveal = m.progress(p.revealAt, 0.7, 'move');
  const gap = 40 * unit;
  if (p.mode === 'wipe') {
    const w = safe.width;
    const h = safe.height;
    return (
      <SceneFrame>
        <div style={{position: 'relative', width: w, height: h, ...m.enter(0)}}>
          {reveal < 1 ? <div style={{position: 'absolute', inset: 0}}><StatePanel side={p.before} kind="before" w={w} h={h} /></div> : null}
          {reveal > 0 ? <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)`}}><StatePanel side={p.after} kind="after" w={w} h={h} /></div> : null}
          {reveal > 0 && reveal < 1 ? <div style={{position: 'absolute', top: 0, bottom: 0, left: `${reveal * 100}%`, width: 6 * unit, marginLeft: -3 * unit, background: brand.colors.accent}} /> : null}
        </div>
      </SceneFrame>
    );
  }
  const w = landscape ? (safe.width - gap) / 2 : safe.width;
  const h = landscape ? Math.min(safe.height, 640 * unit) : (safe.height - gap) / 2;
  return (
    <SceneFrame style={{flexDirection: landscape ? 'row' : 'column', gap, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{...m.enter(0), filter: `saturate(${1 - 0.5 * reveal})`}}><StatePanel side={p.before} kind="before" w={w} h={h} /></div>
      <div style={{opacity: reveal, transform: `translate${landscape ? 'X' : 'Y'}(${(1 - reveal) * m.tokens.distance}px)`}}><StatePanel side={p.after} kind="after" w={w} h={h} /></div>
    </SceneFrame>
  );
};
