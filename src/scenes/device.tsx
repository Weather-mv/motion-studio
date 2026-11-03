import React from 'react';
import {Img, staticFile} from 'remotion';
import {alpha} from '../core/primitives';
import {useStage} from '../core/stage';
import {useTheme} from '../core/theme';

export type Device = 'laptop' | 'browser' | 'tablet' | 'phone';
const ASPECT: Record<Device, number> = {laptop: 16 / 10, browser: 16 / 10, tablet: 4 / 3, phone: 9 / 19.5};

// Fits a device into a box and hands the screen size to its children.
export const DeviceFrame: React.FC<{device: Device; boxW: number; boxH: number; children: (w: number, h: number) => React.ReactNode}> = ({device, boxW, boxH, children}) => {
  const {brand} = useTheme();
  const {unit} = useStage();
  const c = brand.colors;
  const bezel = (device === 'browser' ? 2 : device === 'phone' ? 12 : 14) * unit;
  const top = device === 'browser' ? 44 * unit : 0;
  const base = device === 'laptop' ? 26 * unit : 0;
  const aspect = ASPECT[device];
  const screenW = Math.min(boxW - 2 * bezel, (boxH - 2 * bezel - top - base) * aspect);
  const screenH = screenW / aspect;
  const radius = (device === 'phone' ? 44 : device === 'browser' ? 14 : 18) * unit;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{background: c.text, padding: bezel, borderRadius: radius, boxShadow: `0 ${24 * unit}px ${60 * unit}px ${alpha(c.text, 0.22)}`}}>
        {device === 'browser' ? (
          <div style={{height: top, display: 'flex', alignItems: 'center', gap: 8 * unit, paddingLeft: 14 * unit}}>
            {[0, 1, 2].map((i) => <div key={i} style={{width: 12 * unit, height: 12 * unit, borderRadius: '50%', background: c.muted}} />)}
            <div style={{flex: 1, height: 20 * unit, margin: `0 ${20 * unit}px`, borderRadius: 10 * unit, background: alpha(c.muted, 0.5)}} />
          </div>
        ) : null}
        <div style={{width: screenW, height: screenH, overflow: 'hidden', position: 'relative', borderRadius: Math.max(0, radius - bezel), background: c.bg}}>
          {children(screenW, screenH)}
        </div>
      </div>
      {device === 'laptop' ? <div style={{width: screenW + 2 * bezel + 80 * unit, height: base, background: c.muted, borderRadius: `0 0 ${16 * unit}px ${16 * unit}px`}} /> : null}
    </div>
  );
};

// A supplied screenshot, or a blank illustrative UI with no words or numbers.
export const Screen: React.FC<{src?: string; w: number; h: number}> = ({src, w, h}) => {
  const {brand, jobId} = useTheme();
  const c = brand.colors;
  if (src) return <Img src={staticFile(`jobs/${jobId}/${src}`)} style={{width: w, height: h, objectFit: 'cover', display: 'block'}} />;
  const portrait = h > w;
  const pad = Math.min(w, h) * 0.04;
  const bar = (width: string, color: string, height = pad * 0.55) => <div style={{width, height, borderRadius: height / 2, background: color}} />;
  return (
    <div style={{width: w, height: h, display: 'flex', background: c.bg}}>
      {portrait ? null : (
        <div style={{width: w * 0.2, background: alpha(c.muted, 0.14), padding: pad, display: 'flex', flexDirection: 'column', gap: pad}}>
          {bar('70%', c.accent)}
          {[80, 60, 72, 50].map((p) => <React.Fragment key={p}>{bar(`${p}%`, alpha(c.muted, 0.4))}</React.Fragment>)}
        </div>
      )}
      <div style={{flex: 1, padding: pad, display: 'flex', flexDirection: 'column', gap: pad}}>
        {bar('40%', alpha(c.text, 0.6), pad * 0.8)}
        <div style={{display: 'flex', gap: pad, flex: 1, flexDirection: portrait ? 'column' : 'row'}}>
          {[c.accent, c.secondary, c.muted].map((color, i) => (
            <div key={i} style={{flex: 1, borderRadius: pad * 0.5, background: c.panel, border: `1px solid ${alpha(c.muted, 0.25)}`, padding: pad * 0.7, display: 'flex', flexDirection: 'column', gap: pad * 0.5, justifyContent: 'flex-end'}}>
              <div style={{width: '50%', height: '45%', borderRadius: pad * 0.3, background: alpha(color, 0.75)}} />
              {bar('85%', alpha(c.muted, 0.35))}
            </div>
          ))}
        </div>
        <div style={{height: '26%', borderRadius: pad * 0.5, background: c.panel, border: `1px solid ${alpha(c.muted, 0.25)}`, padding: pad * 0.7, display: 'flex', flexDirection: 'column', gap: pad * 0.5}}>
          {bar('90%', alpha(c.muted, 0.3))}
          {bar('65%', alpha(c.muted, 0.3))}
        </div>
      </div>
    </div>
  );
};

// Headline and sub, shared by the media scenes.
export const SideText: React.FC<{headline?: string; sub?: string; w: number; h: number; style1: React.CSSProperties; style2: React.CSSProperties}> = ({headline, sub, w, h, style1, style2}) => {
  const {brand} = useTheme();
  const {type, unit} = useStage();
  return (
    <div style={{width: w, height: h, display: 'flex', flexDirection: 'column', justifyContent: 'center', flexShrink: 0}}>
      {headline ? <div style={{fontFamily: brand.fonts.heading, fontWeight: 700, fontSize: type.h2 + 8 * unit, lineHeight: 1.12, ...style1}}>{headline}</div> : null}
      {sub ? <div style={{fontSize: type.body, lineHeight: 1.35, color: brand.colors.muted, marginTop: 20 * unit, ...style2}}>{sub}</div> : null}
    </div>
  );
};
