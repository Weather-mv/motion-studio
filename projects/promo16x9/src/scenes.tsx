import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ASSET, COLOR, LAYOUT, TYPE, glass, withAlpha} from './brand';
import {CheckMark, Fleet, Headline, OversightLayer, RobotTile, clamp, inOutCubic, useArrive} from './parts';
import {S1, S2, S3, S4, SCENE} from './timing';

const DESK = {height: 56, width: 860, rise: 62, bottom: 930, stepRight: 22};

const Desk: React.FC = () => (
  <div style={{...glass(0.42), width: '100%', height: '100%', borderRadius: 18, display: 'flex', alignItems: 'center', gap: 16, paddingLeft: 22, boxSizing: 'border-box'}}>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{width: 58, height: 30, borderRadius: 6, border: `3px solid ${COLOR.ink}`, boxSizing: 'border-box', background: withAlpha(COLOR.cobalt, 0.16)}} />
    ))}
  </div>
);

// Scene 1 and 2: desks stack upward to the right, then merge into one layer.
export const DeskStack: React.FC = () => {
  const frame = useCurrentFrame();
  const arrive = useArrive();
  if (frame >= S2.collapseTo) return null;
  const collapse = interpolate(frame, [S2.collapseFrom, S2.collapseTo], [0, 1], {...clamp, easing: inOutCubic});
  const glow = interpolate(frame, [S1.deskStart, S1.deskStart + S1.deskStagger * (S1.deskCount - 1)], [0, 1], clamp);
  const glowOut = interpolate(frame, [S2.collapseFrom, S2.collapseTo], [1, 0], clamp);
  const glowSize = 300 + 900 * glow;
  const fadeNearEnd = interpolate(collapse, [0.7, 1], [1, 0], clamp);
  const layerY = LAYOUT.layer.top + LAYOUT.layer.height / 2 - DESK.height / 2;
  return (
    <>
      {/* The only orange in the film: one soft radial glow, at most 0.18 opacity, growing with the stack. */}
      <div style={{position: 'absolute', left: 1560 - glowSize / 2, top: 600 - glowSize / 2, width: glowSize, height: glowSize, borderRadius: '50%', background: `radial-gradient(circle, ${COLOR.orange} 0%, ${withAlpha(COLOR.orange, 0)} 68%)`, opacity: S1.glowMaxOpacity * glow * glowOut}} />
      {Array.from({length: S1.deskCount}).map((_, i) => {
        const p = arrive(S1.deskStart + i * S1.deskStagger, 14);
        const x = LAYOUT.graphicLeft + i * DESK.stepRight;
        const y = DESK.bottom - DESK.height - i * DESK.rise + (1 - p) * 28;
        return (
          <div key={i} style={{position: 'absolute', left: x + (LAYOUT.graphicLeft - x) * collapse, top: y + (layerY - y) * collapse, width: DESK.width, height: DESK.height, opacity: p * fadeNearEnd}}>
            <Desk />
          </div>
        );
      })}
    </>
  );
};

export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [S2.robotsOutFrom, S2.robotsOutTo], [1, 0], clamp);
  return (
    <>
      {frame < S2.robotsOutTo ? <Fleet at={S1.robotStart} stagger={S1.robotStagger} count={S1.robotCount} opacity={out} /> : null}
      <Headline from={S1.headlineAt} to={SCENE.multiplication.to} ink="More robots." cobalt="More overhead." />
    </>
  );
};

export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const arrive = useArrive();
  const {from, to} = SCENE.collapse;
  if (frame < from || frame >= S3.layerOutTo) return null;
  const inText = frame < to;
  const layerIn = interpolate(frame, [S2.layerFadeFrom, S2.layerFadeTo], [0, 1], clamp);
  const layerOut = interpolate(frame, [S3.layerOutFrom, S3.layerOutTo], [1, 0], clamp);
  const logoIn = interpolate(frame, [S2.logoAt, S2.logoAt + S2.logoFadeFrames], [0, 1], clamp);
  const sub = arrive(S2.subheadingAt);
  const subOut = interpolate(frame, [to - 8, to], [1, 0], clamp);
  const logo = LAYOUT.logoOnLayer.width;
  return (
    <>
      <Headline from={S2.headlineAt} to={to} ink="Qualified engineering" cobalt="oversight" />
      {inText ? (
        <div style={{...TYPE.subheading, position: 'absolute', left: LAYOUT.headline.x, top: LAYOUT.headline.y + 200 + LAYOUT.subheadingGap, opacity: sub * subOut, transform: `translateY(${(1 - sub) * 16}px)`}}>
          Qualified engineering oversight
        </div>
      ) : null}
      <OversightLayer opacity={layerIn * layerOut}>
        {/* Centred on the part of the layer inside the frame. */}
        <Img src={staticFile(ASSET.logo)} style={{position: 'absolute', left: (1920 - LAYOUT.graphicLeft) / 2 - logo / 2, top: LAYOUT.layer.height / 2 - logo / 2, width: logo, height: logo, opacity: logoIn}} />
      </OversightLayer>
    </>
  );
};

const LINE = {x1: 96, x2: 1096, y: 810};

export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const arrive = useArrive();
  const {from, to} = SCENE.timeline;
  if (frame < from || frame >= to) return null;
  const out = interpolate(frame, [S3.sceneOutFrom, S3.sceneOutTo], [1, 0], clamp);
  const draw = interpolate(frame, [S3.lineFrom, S3.lineTo], [0, 1], clamp);
  const length = LINE.x2 - LINE.x1;
  const card = interpolate(frame, [S3.cardFrom, S3.cardTo], [0, 1], clamp);
  const robotEnds = [800, 520, 240];
  const robot = 96;
  return (
    <>
      <Headline from={S3.headlineAt} to={to} ink="Audit-ready" cobalt="by default." />
      <div style={{position: 'absolute', inset: 0, opacity: out}}>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <line x1={LINE.x1} x2={LINE.x2} y1={LINE.y} y2={LINE.y} stroke={COLOR.cobalt} strokeWidth={6} strokeLinecap="round" strokeDasharray={length} strokeDashoffset={length * (1 - draw)} />
        </svg>
        {robotEnds.map((end, i) => {
          const start = S3.lineFrom + i * S3.robotStagger;
          const x = interpolate(frame, [start, S3.lineTo], [LINE.x1, end], {...clamp, easing: inOutCubic});
          return (
            <div key={i} style={{position: 'absolute', left: x, top: LINE.y - robot - 36, opacity: interpolate(frame, [start, start + 10], [0, 1], clamp)}}>
              <RobotTile size={robot} />
            </div>
          );
        })}
        {Array.from({length: S3.markerCount}).map((_, i) => {
          // Six evenly spaced points. Each pops in as the line reaches it.
          const f = (i + 1) / S3.markerCount;
          const size = 48;
          const pop = arrive(S3.lineFrom + (S3.lineTo - S3.lineFrom) * f - 2, 12);
          return (
            <div key={i} style={{position: 'absolute', left: LINE.x1 + length * f - size, top: LINE.y - size / 2, transform: `scale(${pop})`}}>
              <CheckMark size={size} />
            </div>
          );
        })}
        {/* Audit card. Rows are bars with no words, because no row text was supplied. */}
        <div style={{...glass(0.5), position: 'absolute', left: LAYOUT.graphicLeft + 20, top: 170, width: 880, height: 740, borderRadius: 40, padding: '56px 64px', boxSizing: 'border-box', opacity: card, transform: `translateY(${(1 - card) * 20}px)`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
          {Array.from({length: S3.rowCount}).map((_, i) => {
            const at = S3.rowStart + i * S3.rowStagger;
            const fill = interpolate(frame, [at, at + S3.rowFillFrames], [0, 1], {...clamp, easing: inOutCubic});
            const tick = arrive(at + S3.rowFillFrames - 4, 12);
            const check = 64;
            return (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 32}}>
                <div style={{width: check, height: check, flexShrink: 0, position: 'relative', borderRadius: '50%', border: `3px solid ${withAlpha(COLOR.slate, 0.4)}`, boxSizing: 'border-box'}}>
                  <div style={{position: 'absolute', inset: -3, transform: `scale(${tick})`}}><CheckMark size={check} /></div>
                </div>
                <div style={{width: 560, height: 22, borderRadius: 11, background: withAlpha(COLOR.slate, 0.18), overflow: 'hidden'}}>
                  <div style={{width: '100%', height: '100%', borderRadius: 11, background: COLOR.slate, transformOrigin: 'left center', transform: `scaleX(${fill})`}} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {from, to} = SCENE.close;
  if (frame < from) return null;
  const layer = interpolate(frame, [S4.layerFrom, S4.layerTo], [0, 1], clamp);
  const cta = spring({frame: frame - S4.ctaAt, fps, durationInFrames: S4.ctaSettleFrames, config: {damping: 14}});
  return (
    <>
      <Fleet at={S4.fleetAt} stagger={0} count={S1.robotCount} />
      <OversightLayer opacity={layer} />
      <Headline from={S4.headlineAt} to={to} ink="Scale the fleet." cobalt="Not the overhead." hold />
      {/* Footer position from the locked layout: bottom-left, centred on y 960. 80 px tall, as the guideline's CTA pill. */}
      <div style={{...glass(0.6), ...TYPE.footer, position: 'absolute', left: LAYOUT.margin, top: LAYOUT.footerY - 40, height: 80, padding: '0 44px', borderRadius: 40, display: 'flex', alignItems: 'center', opacity: frame >= S4.ctaAt ? 1 : 0, transform: `scale(${cta})`, transformOrigin: 'left center', whiteSpace: 'nowrap'}}>
        Book a Demo
      </div>
    </>
  );
};

// One logo at a time: top-left, except while it sits on the layer at the end of scene 2.
export const MainLogo: React.FC = () => {
  const frame = useCurrentFrame();
  const {logo, logoCentred} = LAYOUT;
  const away = interpolate(frame, [S2.logoAt - 8, S2.logoAt], [1, 0], clamp);
  const back = interpolate(frame, [S3.layerOutFrom, S3.layerOutTo], [0, 1], clamp);
  const leave = interpolate(frame, [S4.logoCentreFrom, S4.logoCornerOutTo], [1, 0], clamp);
  const corner = frame < S3.layerOutFrom ? away : back * leave;
  // The logo fades across instead of travelling, because a straight path would cross the headline.
  const centred = interpolate(frame, [S4.logoCentreInFrom, S4.logoCentreTo], [0, 1], {...clamp, easing: inOutCubic});
  return (
    <>
      <Img src={staticFile(ASSET.logo)} style={{position: 'absolute', left: logo.x, top: logo.y, width: logo.width, height: logo.width, opacity: corner}} />
      <Img src={staticFile(ASSET.logo)} style={{position: 'absolute', left: logoCentred.x, top: logoCentred.y, width: logoCentred.width, height: logoCentred.width, opacity: centred, transform: `scale(${0.92 + 0.08 * centred})`}} />
    </>
  );
};

export const FadeOut: React.FC = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{background: COLOR.periwinkle, opacity: interpolate(frame, [S4.fadeFrom, S4.fadeTo - 1], [0, 1], clamp)}} />;
};
