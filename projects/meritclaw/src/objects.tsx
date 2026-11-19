// The physical objects of the film. Each one is a pure function of the frame.
import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {colors, logoFile, mix, t, text, tone} from './config';
import {fontFamily} from './fonts';
import {CAM, toWorld, useLayout} from './layout';
import {EASE, lerp, ramp, useSpringAt} from './motion';
import {Billboard, CheckMark, Cursor, Extrude, FloorShadow, GlowPool, LinkIcon, Ring} from './solids';

const lin = (n: number) => n;
const WIN_DEPTH = 44; // thickness of the LMS window slab
const SLOT = {x: 505, y: 140}; // link slot centre, in window face px from its top-left
const Z = (n: number) => `translateZ(${n}px)`;

type Layout = ReturnType<typeof useLayout>;
// World position for a screen anchor, nudged by a screen offset.
const anchor = (L: Layout, k: keyof Layout['screen'], dx = 0, dy = 0) => toWorld(L.screen[k][0] - L.cx + dx, L.screen[k][1] - L.cy + dy);

// ---------- LMS window pose (shared with the capsule, which seats into it) ----------
export const useWindowPose = () => {
  const f = useCurrentFrame();
  const L = useLayout();
  const rise = useSpringAt(t.s2.windowIn, 'soft'); // 118: rises from below
  const back = ramp(f, t.s3.windowBack, t.s3.windowBack + 18, EASE.inOut); // 330-348: sinks back for the report
  const out = ramp(f, t.s4.start, t.s4.fadeEnd, EASE.in); // 390-410: leaves
  const startDy = L.height - L.screen.lms[1] + 460; // begins fully below the frame in either ratio
  const a = anchor(L, 'lms', 0, (1 - rise) * startDy);
  const b = anchor(L, 'lmsBack', 0, (1 - rise) * startDy);
  const o = anchor(L, 'lmsBack', 0, 380 * out);
  const base = {x: lerp(a.x, b.x, back), y: lerp(a.y, b.y, back)};
  return {
    x: lerp(base.x, o.x, out),
    y: lerp(base.y, o.y, out),
    z: -out * 120 - back * 80, // sinks below the report's footprint so nothing pokes through the paper
    scale: lerp(1, 0.8, back) * (1 - 0.25 * out),
    back,
    out,
    visible: f >= t.s2.windowIn && out < 1,
  };
};

const fadeOpacity = (p: number) => (p > 0 ? Math.max(0, 1 - ramp(p, 0.35, 1, lin)) : undefined);

// ---------- Hero: input field -> link capsule ----------
export const LinkObject: React.FC = () => {
  const f = useCurrentFrame();
  const L = useLayout();
  const win = useWindowPose();
  const {field, capsule, lms} = L.size;
  const appear = useSpringAt(t.s1.fieldIn, 'pop'); // 0: field springs up
  const popS = useSpringAt(t.s1.pop, 'pop'); // 98: capsule pops out
  const landed = useSpringAt(t.s2.dropEnd, 'heavy'); // 160: squash on seating
  const morph = ramp(f, t.s1.morphStart, t.s1.morphEnd, EASE.inOut); // 84-100
  const drop = ramp(f, t.s2.dropStart, t.s2.dropEnd, EASE.inOut); // 138-160
  const press = f >= t.s1.click ? ramp(f, t.s1.click, t.s1.click + 3) * (1 - ramp(f, t.s1.click + 3, t.s1.click + 10)) : 0;

  const w = lerp(field.w, capsule.w, morph);
  const h = lerp(field.h, capsule.h, morph);
  const radius = lerp(30, h / 2, morph);
  const depth = lerp(34, 40, morph);
  const start = anchor(L, 'input');
  const seat = {x: win.x + (SLOT.x - lms.w / 2) * win.scale, y: win.y + (SLOT.y - lms.h / 2) * win.scale};
  const pos = {x: lerp(start.x, seat.x, drop), y: lerp(start.y, seat.y, drop)};
  const seatZ = WIN_DEPTH + 2 + win.z;
  const bob = Math.sin(f / 9) * 5 * (1 - drop) * morph;
  const z = lerp(110 * popS, seatZ, drop) + Math.sin(Math.PI * drop) * 70 + bob - press * 6;
  const squash = f >= t.s2.dropEnd ? 1 - landed : 0; // widens on impact, settles
  const scale = Math.max(0, appear) * (1 + 0.08 * popS * (1 - drop)) * lerp(1, 0.62, drop) * (1 + 0.1 * squash) * win.scale ** (drop > 0.99 ? 1 : 0);
  const out = win.out;

  // Typing
  const url = text.ui.sampleUrl;
  const typed = Math.floor(ramp(f, t.s1.typeStart, t.s1.typeEnd, lin) * url.length);
  const shown = typed > 50 ? '…' + url.slice(typed - 50, typed) : url.slice(0, typed);
  const caret = f >= t.s1.click && Math.floor(f / 8) % 2 === 0;
  const focus = f >= t.s1.click ? 1 : 0;

  // Cursor path: travels in, clicks, leaves
  const cIn = ramp(f, t.s1.cursorIn, t.s1.click, EASE.out);
  const cOut = ramp(f, t.s1.morphStart, t.s1.morphEnd - 2, EASE.in);
  const click = {x: start.x - 210, y: start.y};
  const cur = {
    x: lerp(click.x + 420, click.x, cIn) + cOut * 300,
    y: lerp(click.y + 520, click.y, cIn) + cOut * 380,
  };

  if (f > t.s2.end + 160 && out >= 1) return null;
  return (
    <>
      <FloorShadow w={w} h={h} radius={radius} x={pos.x} y={pos.y} height={Math.max(0, z)} scale={scale} strength={0.9 * (1 - out)} />
      <GlowPool x={pos.x} y={pos.y} size={900 * scale} color={colors.blue} strength={morph * (0.9 - 0.4 * drop) * (1 - out)} />
      <Ring x={start.x - 210} y={start.y} z={depth + 1} size={170} p={ramp(f, t.s1.click, t.s1.click + 16, EASE.out)} color={colors.blue} />
      <Ring x={start.x} y={start.y} z={0.8} size={900} p={ramp(f, t.s1.pop, t.s1.pop + 18, EASE.out)} color={colors.blue} thick={10} />
      <Extrude
        w={w} h={h} depth={depth} radius={radius} x={pos.x} y={pos.y} z={z + win.z * 0} scale={scale}
        color={mix(colors.blue, tone.clay, morph * 100)}
        glow={mix(colors.blue, 'transparent', 75 * morph)} glowSize={90}
        glint={ramp(f, t.s1.pop + 4, t.s1.pop + 24, lin)}
        opacity={fadeOpacity(out)}
      >
        {/* input mode: sunken field with the typed URL */}
        <div style={{position: 'absolute', left: 26, top: 26, right: 26, bottom: 26, borderRadius: Math.max(8, radius - 12), background: tone.recess, opacity: 1 - Math.min(1, morph * 2.2), boxShadow: `inset 0 6px 14px ${mix('black', 'transparent', 55)}, 0 0 0 ${focus * 3}px ${colors.blue}`}}>
          <div style={{position: 'absolute', inset: '0 28px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', whiteSpace: 'nowrap', fontFamily, fontSize: 30, fontWeight: 400, color: typed ? colors.white : tone.muted, letterSpacing: 0.2}}>
            {typed ? shown : text.ui.placeholder}
            {caret ? <span style={{display: 'inline-block', width: 3, height: 36, marginLeft: 4, background: colors.blue}} /> : null}
          </div>
        </div>
        {/* capsule mode: link icon + name */}
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, opacity: ramp(morph, 0.55, 1, lin), fontFamily, fontWeight: 700, fontSize: 44, color: colors.white, whiteSpace: 'nowrap', textShadow: `0 2px 8px ${mix(colors.ink, 'transparent', 60)}`}}>
          <LinkIcon size={52} />
          {text.ui.capsule}
        </div>
      </Extrude>
      {f < t.s1.morphEnd + 2 ? (
        <Billboard x={cur.x} y={cur.y} z={depth + lerp(46, 6, cIn) - press * 4} tiltDeg={CAM.tiltDeg} spinDeg={CAM.spinDeg} scale={1.7}>
          <Cursor pressed={press} />
        </Billboard>
      ) : null}
    </>
  );
};

// ---------- LMS quiz window ----------
export const LmsWindow: React.FC = () => {
  const f = useCurrentFrame();
  const L = useLayout();
  const win = useWindowPose();
  const {lms} = L.size;
  const snap = useSpringAt(t.s2.check, 'snap'); // 168
  const seated = f >= t.s2.dropEnd ? 1 : 0;
  const ff = ramp(f, t.s3.ffStart, t.s3.ffEnd, lin); // 252-328 fast-forward
  const rows = L.isV ? 4 : 3;
  const selected = f >= t.s3.ffStart ? Math.floor((f - t.s3.ffStart) / (t.s3.tickEvery * 2)) % rows : f >= t.s2.answerPick ? 1 : -1;
  const barFill = f < t.s3.ffStart ? 0.2 : lerp(0.2, 1, ff);
  if (!win.visible) return null;
  const headX = 139;
  const headY = 218;
  return (
    <>
      <FloorShadow w={lms.w} h={lms.h} radius={36} x={win.x} y={win.y} height={14} scale={win.scale} strength={0.95 * (1 - win.out)} />
      <Extrude
        w={lms.w} h={lms.h} depth={WIN_DEPTH} radius={36} x={win.x} y={win.y} z={win.z} scale={win.scale}
        color={tone.clay} gloss={0.8} glint={ramp(f, t.s2.windowIn + 16, t.s2.windowIn + 44, lin)}
        opacity={fadeOpacity(win.out)}
      >
        {/* title bar */}
        <div style={{position: 'absolute', left: 0, top: 0, right: 0, height: 64, borderRadius: '36px 36px 0 0', background: mix(colors.ink, colors.blue, 84), display: 'flex', alignItems: 'center', paddingLeft: 30, gap: 10}}>
          {[0, 1, 2].map((i) => <div key={i} style={{width: 14, height: 14, borderRadius: 7, background: mix(colors.white, colors.ink, 34)}} />)}
          <div style={{marginLeft: 18, fontFamily, fontWeight: 700, fontSize: 26, color: colors.white}}>{text.ui.lmsTitle}</div>
        </div>
        {/* avatar card */}
        <div style={{position: 'absolute', left: 28, top: 92, width: 222, bottom: 28, borderRadius: 28, background: mix(colors.blue, colors.white, 12), boxShadow: `inset 0 4px 10px ${mix(colors.ink, 'transparent', 18)}`}} />
        <Extrude w={170} h={100} depth={14} radius="85px 85px 22px 22px" x={headX} y={headY + 112} color={mix(colors.ink, colors.blue, 55)} gloss={0.6} />
        <Extrude w={112} h={112} depth={26} radius={56} x={headX} y={headY} color={mix(colors.blue, colors.white, 34)} gloss={1}
          face={`radial-gradient(circle at 34% 28%, ${mix(colors.white, 'transparent', 85)}, ${mix(colors.blue, colors.white, 40)} 48%, ${mix(colors.blue, colors.ink, 70)} 100%)`} />
        {/* green check snaps onto the head */}
        <Ring x={headX + 54} y={headY - 48} z={WIN_DEPTH * 0 + 2} size={170} p={f >= t.s2.check ? ramp(f, t.s2.check, t.s2.check + 16, EASE.out) : 0} color={colors.green} thick={8} />
        <Extrude
          w={84} h={84} depth={24} radius={42} x={headX + 54} y={headY - 48} z={Math.max(0, (1 - snap) * 240) + 10} scale={Math.max(0, snap) * (1 + (1 - Math.min(1, snap)) * 0.6)}
          color={colors.green} glow={mix(colors.green, 'transparent', 80)} glowSize={46}
        >
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <CheckMark size={52} p={ramp(f, t.s2.check + 3, t.s2.check + 13, EASE.out)} />
          </div>
        </Extrude>
        {/* link slot */}
        <div style={{position: 'absolute', left: SLOT.x - 225, top: SLOT.y - 48, width: 450, height: 96, borderRadius: 48, background: tone.recess, boxShadow: `inset 0 6px 14px ${mix('black', 'transparent', 55)}${seated ? `, 0 0 0 3px ${colors.blue}, 0 0 28px ${colors.blue}` : ''}`, border: seated ? undefined : `2px dashed ${mix(colors.blue, 'transparent', 70)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily, fontSize: 24, color: tone.muted}}>
          {seated ? null : text.ui.slotLabel}
        </div>
        {/* question and answers */}
        <div style={{position: 'absolute', left: 280, top: 226, width: 380, height: 22, borderRadius: 11, background: tone.skeleton}} />
        <div style={{position: 'absolute', left: 280, top: 258, width: 290, height: 22, borderRadius: 11, background: tone.skeleton}} />
        {Array.from({length: rows}).map((_, i) => {
          const on = i === selected;
          return (
            <div key={i} style={{position: 'absolute', left: 280, top: 308 + i * 72, width: 450, height: 58, borderRadius: 18, background: on ? mix(colors.blue, colors.white, 22) : mix(colors.blue, colors.white, 6), boxShadow: on ? `inset 0 0 0 2px ${colors.blue}` : `inset 0 0 0 2px ${tone.skeleton}`, display: 'flex', alignItems: 'center', paddingLeft: 18, gap: 16}}>
              <div style={{width: 26, height: 26, borderRadius: 13, boxShadow: `inset 0 0 0 3px ${on ? colors.blue : tone.skeleton}`, background: on ? colors.blue : 'transparent'}} />
              <div style={{width: 200 + ((i * 53) % 110), height: 16, borderRadius: 8, background: tone.skeleton}} />
            </div>
          );
        })}
        {/* progress */}
        <div style={{position: 'absolute', left: 280, top: lms.h - 56, width: 450, height: 14, borderRadius: 7, background: tone.skeleton}}>
          <div style={{width: `${barFill * 100}%`, height: '100%', borderRadius: 7, background: colors.blue, boxShadow: `0 0 12px ${colors.blue}`}} />
        </div>
        {/* dims while the report takes over */}
        <div style={{position: 'absolute', inset: 0, borderRadius: 36, background: mix(colors.ink, 'transparent', 38 * win.back), pointerEvents: 'none'}} />
      </Extrude>
    </>
  );
};

// ---------- Status bar ----------
export const StatusBar: React.FC = () => {
  const f = useCurrentFrame();
  const L = useLayout();
  const pop = useSpringAt(t.s3.statusIn, 'pop'); // 244
  const out = ramp(f, t.s4.start, t.s4.start + 14, EASE.in);
  const ff = ramp(f, t.s3.ffStart, t.s3.ffEnd, lin);
  if (f < t.s3.statusIn - 2 || out >= 1) return null;
  const {w, h} = L.size.status;
  const p = anchor(L, 'status');
  const s = Math.max(0, pop) * (1 - out);
  const z = (1 - Math.min(1, pop)) * 160 + 24 + Math.sin(f / 12) * 4;
  const secs = Math.round(ff * 45 * 60); // illustrative 45:00 session racing past
  const clock = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;
  return (
    <>
      <FloorShadow w={w} h={h} radius={h / 2} x={p.x} y={p.y} height={z} scale={s} />
      <GlowPool x={p.x} y={p.y} size={760 * s} color={colors.green} strength={0.55} />
      <Extrude w={w} h={h} depth={30} radius={h / 2} x={p.x} y={p.y} z={z} scale={s} color={mix(colors.ink, colors.blue, 72)} glint={ramp(f, t.s3.statusIn + 6, t.s3.statusIn + 28, lin)}>
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 44px', fontFamily, color: colors.white}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
            <div style={{width: 30, height: 30, borderRadius: 15, background: colors.green, boxShadow: `0 0 ${14 + 10 * Math.sin(f / 4)}px ${colors.green}, inset 0 -3px 5px ${mix('black', 'transparent', 30)}`}} />
            <span style={{fontWeight: 700, fontSize: 36, whiteSpace: 'nowrap'}}>{text.ui.status}</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, fontWeight: 400, fontSize: 34, fontVariantNumeric: 'tabular-nums'}}>
            <span style={{color: colors.blue, fontWeight: 700, letterSpacing: -4, opacity: 0.4 + 0.6 * (Math.floor(f / 3) % 2)}}>››</span>
            {clock}
          </div>
        </div>
      </Extrude>
    </>
  );
};

// ---------- Integrity Report ----------
export const ReportDoc: React.FC = () => {
  const f = useCurrentFrame();
  const L = useLayout();
  const seal = useSpringAt(t.s3.sealStamp, 'pop'); // 366
  const fall = ramp(f, t.s3.docDrop, t.s3.docLand, EASE.in); // 322-346
  const out = ramp(f, t.s4.start, t.s4.fadeEnd, EASE.in); // 390-410
  if (f < t.s3.docDrop - 4 || out >= 1) return null;
  const {w, h} = L.size.doc;
  const p = anchor(L, 'doc');
  const since = Math.max(0, f - t.s3.docLand) / 30;
  const hop = 26 * Math.exp(-5 * since) * Math.abs(Math.sin(2 * Math.PI * 2.2 * since)); // small rebounds after the thud
  const rest = 2; // lands on the floor; the window has sunk beneath it
  const z = rest + (f < t.s3.docLand ? (1 - fall) * 1100 : hop);
  const impact = f >= t.s3.docLand ? Math.exp(-9 * since) : 0;
  const scale = (1 + 0.05 * impact) * (1 - 0.25 * out);
  const rows = text.ui.reportRows;
  const line = (i: number) => ramp(f, t.s3.docLand + 4 + i * 5, t.s3.docLand + 16 + i * 5);
  return (
    <>
      <Ring x={p.x} y={p.y} size={900} p={f >= t.s3.docLand ? ramp(f, t.s3.docLand, t.s3.docLand + 20, EASE.out) : 0} color={colors.blue} thick={14} />
      <FloorShadow w={w} h={h} radius={18} x={p.x} y={p.y} height={z - out * 160} scale={scale} strength={1 - out} />
      <Extrude w={w} h={h} depth={20} radius={18} x={p.x} y={p.y} z={z - out * 160} scale={scale} rotateZ={(1 - fall) * 16} color={mix(colors.white, colors.blue, 94)} gloss={0.7} opacity={fadeOpacity(out)}>
        <div style={{position: 'absolute', left: 0, top: 0, right: 0, height: 84, borderRadius: '18px 18px 0 0', background: colors.blue, display: 'flex', alignItems: 'center', paddingLeft: 28, fontFamily, fontWeight: 700, fontSize: 32, color: colors.white}}>
          {text.ui.reportTitle}
        </div>
        {[0, 1].map((i) => <div key={i} style={{position: 'absolute', left: 28, top: 116 + i * 26, width: (w - 56) * (i ? 0.62 : 1) * line(i), height: 14, borderRadius: 7, background: tone.skeleton}} />)}
        {rows.map((label, i) => (
          <div key={label} style={{position: 'absolute', left: 28, top: 200 + i * 78, display: 'flex', alignItems: 'center', gap: 18, fontFamily, fontSize: 30, fontWeight: 700, color: colors.ink, opacity: line(i + 2)}}>
            <div style={{width: 46, height: 46, borderRadius: 23, background: colors.green, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 0 ${mix(colors.green, 'black', 60)}`}}>
              <CheckMark size={30} p={line(i + 2)} />
            </div>
            {label}
          </div>
        ))}
        {[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', left: 28, top: 370 + i * 24, width: (w - 56) * (0.9 - i * 0.2) * line(i + 4), height: 12, borderRadius: 6, background: tone.skeleton}} />)}
        <Extrude w={118} h={118} depth={18} radius={59} x={w - 90} y={h - 92} z={Math.max(0, (1 - seal) * 120)} scale={Math.max(0, seal)} color={colors.green} glow={mix(colors.green, 'transparent', 80)} glowSize={40}>
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <CheckMark size={74} p={ramp(f, t.s3.sealStamp + 2, t.s3.sealStamp + 12)} />
          </div>
        </Extrude>
      </Extrude>
    </>
  );
};

// ---------- Close: logo, CTA ----------
export const Logo: React.FC = () => {
  const L = useLayout();
  const f = useCurrentFrame();
  const pop = useSpringAt(t.s4.logo, 'pop'); // 404
  if (f < t.s4.logo - 1) return null;
  const size = L.isV ? 260 : 190;
  const [x, y] = L.screen.logo;
  const bob = Math.sin(f / 14) * 6;
  return (
    <div style={{position: 'absolute', left: x - size / 2, top: y - size / 2 + bob, width: size, height: size, transform: `scale(${pop})`}}>
      <div style={{position: 'absolute', inset: -size * 0.5, background: `radial-gradient(closest-side, ${mix(colors.blue, 'transparent', 45)}, transparent)`}} />
      {logoFile ? (
        <Img src={staticFile(logoFile)} alt={text.logoAlt} style={{position: 'relative', width: size, height: size, objectFit: 'contain'}} />
      ) : (
        // Placeholder mark, drawn in code. Replace by setting logoFile in config.ts.
        <div style={{position: 'relative', width: size, height: size, borderRadius: size * 0.3, background: `linear-gradient(150deg, ${mix(colors.blue, 'white', 70)}, ${colors.blue} 45%, ${mix(colors.blue, 'black', 70)})`, boxShadow: `inset 0 4px 3px ${mix('white', 'transparent', 55)}, inset 0 -10px 18px ${mix('black', 'transparent', 30)}, 0 ${size * 0.12}px ${size * 0.2}px ${mix('black', 'transparent', 50)}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <LinkIcon size={size * 0.56} />
        </div>
      )}
    </div>
  );
};

export const CtaPill: React.FC = () => {
  const f = useCurrentFrame();
  const L = useLayout();
  const pop = useSpringAt(t.s4.cta, 'pop'); // 450
  const kick = useSpringAt(t.s4.endHit, 'snap'); // 528: final beat
  if (f < t.s4.cta - 1) return null;
  const {w, h} = L.size.cta;
  const p = anchor(L, 'cta');
  const z = (1 - Math.min(1, pop)) * 140 + 6;
  const s = Math.max(0, pop) * (1 + 0.012 * Math.sin(f / 10)) * (1 + 0.06 * (f >= t.s4.endHit ? 1 - kick : 0));
  return (
    <>
      <FloorShadow w={w} h={h} radius={h / 2} x={p.x} y={p.y} height={z} scale={s} />
      <GlowPool x={p.x} y={p.y} size={900 * s} color={colors.blue} strength={0.9} />
      <Ring x={p.x} y={p.y} size={700} p={ramp(f, t.s4.cta + 4, t.s4.cta + 24, EASE.out)} color={colors.blue} thick={10} />
      <Extrude w={w} h={h} depth={40} radius={h / 2} x={p.x} y={p.y} z={z} scale={s} color={colors.blue} glow={mix(colors.blue, 'transparent', 85)} glowSize={90} glint={ramp(f, t.s4.cta + 14, t.s4.cta + 36, lin)}>
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily, fontWeight: 700, fontSize: 54, color: colors.white, textShadow: `0 3px 10px ${mix(colors.ink, 'transparent', 55)}`}}>
          {text.close.cta}
        </div>
      </Extrude>
    </>
  );
};
