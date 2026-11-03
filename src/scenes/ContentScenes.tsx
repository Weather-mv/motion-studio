import React, {useMemo} from 'react';
import {Img, staticFile} from 'remotion';
import {Icon} from '../core/icons';
import {useMotion} from '../core/motion';
import {SceneFrame, alpha, panelStyle} from '../core/primitives';
import {useStage} from '../core/stage';
import {useTheme} from '../core/theme';
import type {SceneProps} from '../core/types';
import {sceneSchemas} from './schemas';

const Heading: React.FC<{text: string; style?: React.CSSProperties}> = ({text, style}) => {
  const {brand} = useTheme();
  const {type, unit} = useStage();
  return <div style={{fontFamily: brand.fonts.heading, fontWeight: 700, fontSize: type.h2 + 8 * unit, lineHeight: 1.12, marginBottom: 48 * unit, ...style}}>{text}</div>;
};

export const StepFlow: React.FC<SceneProps> = ({props}) => {
  const p = useMemo(() => sceneSchemas.stepFlow.parse(props), [props]);
  const {brand} = useTheme();
  const {landscape, unit, type} = useStage();
  const c = brand.colors;
  const m = useMotion();
  const at = (i: number) => p.startSec + i * p.stepSec;
  const current = p.steps.reduce((acc, _, i) => (m.t >= at(i) - 1 / m.fps ? i : acc), -1);
  const badge = 72 * unit;
  return (
    <SceneFrame style={{justifyContent: 'center'}}>
      {p.title ? <Heading text={p.title} style={m.enter(0)} /> : null}
      <div style={{display: 'flex', flexDirection: landscape ? 'row' : 'column', alignItems: 'stretch'}}>
        {p.steps.map((s, i) => {
          const active = i === current;
          const done = i < current;
          return (
            <React.Fragment key={i}>
              <div style={{...panelStyle(brand), ...m.enter(at(i)), flex: 1, minWidth: 0, boxSizing: 'border-box', borderRadius: 24 * unit, padding: 32 * unit, display: 'flex', flexDirection: landscape ? 'column' : 'row', gap: 22 * unit, alignItems: landscape ? 'flex-start' : 'center', outline: active ? `${4 * unit}px solid ${c.accent}` : 'none', outlineOffset: -2 * unit}}>
                <div style={{width: badge, height: badge, flexShrink: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: active || done ? c.accent : alpha(c.muted, 0.18), color: active || done ? c.bg : c.text, fontSize: type.h3, fontWeight: 700}}>
                  {done ? <Icon name="check" size={badge * 0.55} color={c.bg} strokeWidth={3} /> : s.icon ? <Icon name={s.icon} size={badge * 0.55} color={active ? c.bg : c.text} /> : i + 1}
                </div>
                <div style={{minWidth: 0}}>
                  <div style={{fontWeight: 700, fontSize: type.h3, lineHeight: 1.2}}>{s.title}</div>
                  {s.body ? <div style={{fontSize: type.small, lineHeight: 1.35, color: c.muted, marginTop: 10 * unit}}>{s.body}</div> : null}
                </div>
              </div>
              {i < p.steps.length - 1 ? (
                <div style={{flex: landscape ? `0 0 ${40 * unit}px` : `0 0 ${30 * unit}px`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <div style={{width: landscape ? '100%' : 4 * unit, height: landscape ? 4 * unit : '100%', background: c.accent, transformOrigin: landscape ? 'left center' : 'center top', transform: landscape ? `scaleX(${m.progress(at(i + 1) - 0.25, 0.25, 'move')})` : `scaleY(${m.progress(at(i + 1) - 0.25, 0.25, 'move')})`}} />
                </div>
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
    </SceneFrame>
  );
};

export const Timeline: React.FC<SceneProps> = ({props}) => {
  const p = useMemo(() => sceneSchemas.timeline.parse(props), [props]);
  const {brand} = useTheme();
  const {landscape, unit, type} = useStage();
  const c = brand.colors;
  const m = useMotion();
  const at = (i: number) => p.startSec + i * p.itemSec;
  const line = m.progress(p.startSec, p.itemSec * (p.items.length - 1) + m.tokens.enterSec, 'move');
  const dot = 26 * unit;
  const stroke = 4 * unit;
  return (
    <SceneFrame style={{justifyContent: 'center'}}>
      {p.title ? <Heading text={p.title} style={m.enter(0)} /> : null}
      <div style={{position: 'relative', display: 'flex', flexDirection: landscape ? 'row' : 'column', gap: 28 * unit}}>
        <div style={landscape
          ? {position: 'absolute', left: 0, right: 0, top: dot / 2 - stroke / 2, height: stroke, background: alpha(c.muted, 0.3)}
          : {position: 'absolute', top: 0, bottom: 0, left: dot / 2 - stroke / 2, width: stroke, background: alpha(c.muted, 0.3)}} />
        <div style={landscape
          ? {position: 'absolute', left: 0, right: 0, top: dot / 2 - stroke / 2, height: stroke, background: c.accent, transformOrigin: 'left center', transform: `scaleX(${line})`}
          : {position: 'absolute', top: 0, bottom: 0, left: dot / 2 - stroke / 2, width: stroke, background: c.accent, transformOrigin: 'center top', transform: `scaleY(${line})`}} />
        {p.items.map((it, i) => (
          <div key={i} style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: landscape ? 'column' : 'row', gap: 24 * unit, position: 'relative'}}>
            <div style={{width: dot, height: dot, flexShrink: 0, borderRadius: '50%', background: c.accent, border: `${4 * unit}px solid ${c.bg}`, boxSizing: 'border-box', transform: `scale(${m.progress(at(i), 0.3)})`}} />
            <div style={{...m.enter(at(i)), minWidth: 0}}>
              <div style={{fontSize: type.small, fontWeight: 700, color: c.accent}}>{it.label}</div>
              <div style={{fontSize: type.h3, fontWeight: 700, lineHeight: 1.2, marginTop: 8 * unit}}>{it.title}</div>
              {it.body ? <div style={{fontSize: type.small, lineHeight: 1.35, color: c.muted, marginTop: 10 * unit}}>{it.body}</div> : null}
            </div>
          </div>
        ))}
      </div>
    </SceneFrame>
  );
};

export const Quote: React.FC<SceneProps> = ({props}) => {
  const p = useMemo(() => sceneSchemas.quote.parse(props), [props]);
  const {brand} = useTheme();
  const {unit, type} = useStage();
  const c = brand.colors;
  const m = useMotion();
  const size = p.text.length < 80 ? type.h1 : p.text.length < 180 ? type.h2 + 8 * unit : type.h3;
  return (
    <SceneFrame style={{justifyContent: 'center'}}>
      <div style={{width: 96 * unit, height: 10 * unit, borderRadius: 5 * unit, background: c.accent, transformOrigin: 'left center', transform: `scaleX(${m.progress(0, 0.5, 'move')})`, marginBottom: 48 * unit}} />
      <div style={{fontFamily: brand.fonts.heading, fontWeight: 700, fontSize: size, lineHeight: 1.18, ...m.enter(0.1)}}>{`“${p.text}”`}</div>
      <div style={{marginTop: 48 * unit, ...m.enter(0.1 + m.tokens.staggerSec * 3)}}>
        <div style={{fontSize: type.h3, fontWeight: 700}}>{p.author}</div>
        {p.role ? <div style={{fontSize: type.body, color: c.muted, marginTop: 8 * unit}}>{p.role}</div> : null}
      </div>
    </SceneFrame>
  );
};

export const LogoReveal: React.FC<SceneProps> = ({props}) => {
  const p = useMemo(() => sceneSchemas.logoReveal.parse(props), [props]);
  const {brand, jobId} = useTheme();
  const {unit, type, width, height, safe} = useStage();
  const c = brand.colors;
  const m = useMotion();
  const box = Math.min(width, height) * p.size;
  const arrive = m.progress(0, m.tokens.enterSec * 1.4);
  const rule = m.progress(0.35, 0.5, 'move');
  return (
    <SceneFrame style={{alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
      <div style={{opacity: arrive, transform: `scale(${0.86 + 0.14 * arrive})`}}>
        {brand.logo
          ? <Img src={staticFile(`jobs/${jobId}/${brand.logo}`)} style={{height: box, maxWidth: safe.width, objectFit: 'contain', display: 'block'}} />
          : <div style={{fontFamily: brand.fonts.heading, fontWeight: 700, fontSize: type.display}}>{brand.name}</div>}
      </div>
      <div style={{width: 200 * unit, height: 6 * unit, borderRadius: 3 * unit, background: c.accent, margin: `${36 * unit}px 0`, transform: `scaleX(${rule})`}} />
      {p.tagline ? <div style={{fontSize: type.h3, maxWidth: safe.width, lineHeight: 1.25, ...m.enter(p.taglineAt)}}>{p.tagline}</div> : null}
    </SceneFrame>
  );
};

export const IconGrid: React.FC<SceneProps> = ({props}) => {
  const p = useMemo(() => sceneSchemas.iconGrid.parse(props), [props]);
  const {brand} = useTheme();
  const {ratio, unit, type} = useStage();
  const c = brand.colors;
  const m = useMotion();
  const n = p.items.length;
  const cols = ratio === '16x9' ? (n === 4 ? 4 : n <= 3 ? n : 3) : ratio === '1x1' ? (n <= 2 ? n : 2) : n <= 4 ? 1 : 2;
  return (
    <SceneFrame style={{justifyContent: 'center'}}>
      {p.title ? <Heading text={p.title} style={m.enter(0)} /> : null}
      <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: 28 * unit}}>
        {p.items.map((it, i) => (
          <div key={i} style={{...panelStyle(brand), ...m.enter(p.startSec + i * m.tokens.staggerSec), boxSizing: 'border-box', borderRadius: 24 * unit, padding: 32 * unit, display: 'flex', flexDirection: cols === 1 ? 'row' : 'column', alignItems: cols === 1 ? 'center' : 'flex-start', gap: 20 * unit, minWidth: 0}}>
            <div style={{width: 76 * unit, height: 76 * unit, borderRadius: 18 * unit, flexShrink: 0, background: alpha(c.accent, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Icon name={it.icon} size={46 * unit} color={c.accent} />
            </div>
            <div style={{minWidth: 0}}>
              <div style={{fontWeight: 700, fontSize: type.h3 - 2 * unit, lineHeight: 1.2}}>{it.label}</div>
              {it.body ? <div style={{fontSize: type.small, lineHeight: 1.35, color: c.muted, marginTop: 8 * unit}}>{it.body}</div> : null}
            </div>
          </div>
        ))}
      </div>
    </SceneFrame>
  );
};
