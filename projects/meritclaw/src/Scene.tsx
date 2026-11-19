// The whole film. One timeline, two layouts: useLayout() reads useVideoConfig() and re-places everything.
import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {audio, colors, mix, t, text} from './config';
import {fontFamily} from './fonts';
import {CAM, useLayout} from './layout';
import {EASE, ramp, shake, useSpringAt} from './motion';
import {CtaPill, LinkObject, LmsWindow, Logo, ReportDoc, StatusBar} from './objects';

// Camera: the floor plane is tilted and spun. Impact shake is added to the root.
const WorldRoot: React.FC<{shakeY?: number; shakeX?: number; children: React.ReactNode}> = ({shakeY = 0, shakeX = 0, children}) => {
  const {width, height} = useLayout();
  const f = useCurrentFrame();
  const drift = Math.sin(f / 80) * 0.8; // slow camera sway, degrees
  return (
    <div style={{position: 'absolute', left: width / 2, top: height / 2, width: 0, height: 0, transformStyle: 'preserve-3d', transform: `translate(${shakeX}px, ${shakeY}px) perspective(${CAM.perspective}px) rotateX(${CAM.tiltDeg}deg) rotateZ(${-(CAM.spinDeg + drift)}deg)`}}>
      {children}
    </div>
  );
};

// Dark floor with a faint blue grid that fades out toward the edges.
const Floor: React.FC = () => {
  const line = mix(colors.blue, 'transparent', 22);
  return (
    <div
      style={{
        position: 'absolute', left: -1800, top: -1800, width: 3600, height: 3600, transform: 'translateZ(-2px)',
        backgroundImage: `repeating-linear-gradient(0deg, ${line} 0 2px, transparent 2px 120px), repeating-linear-gradient(90deg, ${line} 0 2px, transparent 2px 120px)`,
        maskImage: 'radial-gradient(closest-side, black 15%, transparent 95%)', WebkitMaskImage: 'radial-gradient(closest-side, black 15%, transparent 95%)',
      }}
    />
  );
};

const Backdrop: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height} = useLayout();
  const swell = ramp(f, t.s4.start, t.s4.endHit, EASE.inOut); // glow grows through the close
  return (
    <>
      <AbsoluteFill style={{background: `radial-gradient(${width}px ${height * 0.55}px at 50% 64%, ${mix(colors.blue, colors.ink, 14 + 14 * swell)}, ${colors.ink} 72%)`}} />
      {Array.from({length: 14}).map((_, i) => {
        const x = ((i * 197) % 1000) / 1000;
        const y = ((i * 331) % 1000) / 1000;
        const s = 4 + (i % 4) * 3;
        return <div key={i} style={{position: 'absolute', left: x * width, top: y * height + Math.sin(f / (30 + i * 4) + i) * 14, width: s, height: s, borderRadius: s, background: mix(colors.white, 'transparent', 30 + (i % 3) * 10)}} />;
      })}
    </>
  );
};

// Top headlines for scenes 1-3. Each enters on a spring and leaves a few frames before the next arrives.
const HEADLINES = [
  {text: text.headlines.paste, at: t.s1.headlineIn, out: t.s1.end - 6}, // in 4, out 114
  {text: text.headlines.verify, at: t.s2.headlineIn, out: t.s2.end - 6}, // in 124, out 234
  {text: text.headlines.monitor, at: t.s3.headlineIn, out: t.s4.headlineOut}, // in 244, out 384
];

const Headlines: React.FC = () => {
  const f = useCurrentFrame();
  const L = useLayout();
  return (
    <>
      {HEADLINES.map((h) => <Headline key={h.text} {...h} f={f} L={L} />)}
    </>
  );
};

const Headline: React.FC<{text: string; at: number; out: number; f: number; L: ReturnType<typeof useLayout>}> = ({text: s, at, out, f, L}) => {
  const v = useSpringAt(at, 'snap');
  const o = ramp(f, out, out + 8, EASE.in);
  if (f < at - 1 || o >= 1) return null;
  return (
    <div style={{position: 'absolute', left: 80, right: 80, top: L.safeTop + (L.isV ? 0 : 12), textAlign: 'center', fontFamily, fontWeight: 700, fontSize: L.headlineSize, lineHeight: 1.12, color: colors.white, opacity: v * (1 - o), transform: `translateY(${(1 - v) * 36 - o * 20}px)`, textShadow: `0 4px 28px ${colors.ink}`}}>
      {s}
    </div>
  );
};

// End card: logo, title, tagline and CTA, wrapped in one link to the site.
const EndCard: React.FC = () => {
  const L = useLayout();
  const f = useCurrentFrame();
  const title = useSpringAt(t.s4.title, 'snap'); // 418
  const tag = useSpringAt(t.s4.tagline, 'snap'); // 432
  const common: React.CSSProperties = {position: 'absolute', left: 60, right: 60, textAlign: 'center', fontFamily};
  return (
    <a href={text.ctaUrl} target="_blank" rel="noreferrer" aria-label={`${text.close.cta}: ${text.ctaUrl}`} style={{display: 'contents', color: 'inherit', textDecoration: 'none'}}>
      <Logo />
      {f >= t.s4.title - 1 ? (
        <div style={{...common, top: L.screen.title[1] - L.headlineSize * 0.6, fontWeight: 700, fontSize: L.headlineSize, color: colors.white, opacity: title, transform: `translateY(${(1 - title) * 40}px)`, textShadow: `0 4px 28px ${colors.ink}`}}>{text.close.title}</div>
      ) : null}
      {f >= t.s4.tagline - 1 ? (
        <div style={{...common, top: L.screen.tagline[1] - L.subSize * 0.6, fontWeight: 400, fontSize: L.subSize, color: colors.blue, opacity: tag, transform: `translateY(${(1 - tag) * 40}px)`}}>{text.close.tagline}</div>
      ) : null}
      <WorldRoot>
        <CtaPill />
      </WorldRoot>
    </a>
  );
};

export const MeritclawVideo: React.FC = () => {
  const f = useCurrentFrame();
  const sy = shake(f, t.s3.docLand, 18, 6, 7); // 346: the thud shakes the camera
  const musicVolume = (n: number) =>
    interpolate(n, [0, 6, t.s4.start, t.s4.endHit, 539], [0, audio.musicVolume, audio.musicVolume, audio.musicSwellVolume, audio.musicSwellVolume * 0.6], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: colors.ink, fontFamily, overflow: 'hidden'}}>
      <Backdrop />
      <WorldRoot shakeY={sy} shakeX={sy * 0.3}>
        <Floor />
        <LinkObject />
        <LmsWindow />
        <StatusBar />
        <ReportDoc />
      </WorldRoot>
      <Headlines />
      <EndCard />
      <Audio src={staticFile(audio.music)} volume={musicVolume} />
      {audio.sfx.map((s, i) => (
        <Sequence key={i} from={s.at} durationInFrames={90}>
          <Audio src={staticFile(s.file)} volume={s.volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
