import React, {useEffect, useRef, useState} from 'react';
import {AbsoluteFill, Audio, cancelRender, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {registry} from './scenes/registry';
import type {SceneName} from './scenes/schemas';
import {AuditProbe, type AuditMode} from './core/AuditProbe';
import {CaptionsOverlay} from './core/CaptionsOverlay';
import {motionTokens, toEasing} from './core/motion';
import {ThemeProvider} from './core/theme';
import type {Beat, Brand, Plan, Word} from './core/types';

export type JobVideoProps = {jobId: string; plan: Plan; brand: Brand; words?: Word[]; audit?: AuditMode};

const BLUR_PX = 24;
const BLUR_EDGE_SCALE = 0.12;
const opts = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Blurs a beat in or out over its first or last frames. No filter is applied otherwise, so glass panels keep their backdrop.
const BeatBlur: React.FC<React.PropsWithChildren<{blurIn: number; blurOut: number; dur: number}>> = ({blurIn, blurOut, dur, children}) => {
  const frame = useCurrentFrame();
  const inPx = blurIn ? interpolate(frame, [0, blurIn], [BLUR_PX, 0], opts) : 0;
  const outPx = blurOut ? interpolate(frame, [dur - blurOut, dur - 1], [0, BLUR_PX], opts) : 0;
  const px = Math.max(inPx, outPx);
  const scale = 1 + (px / BLUR_PX) * BLUR_EDGE_SCALE;
  return <AbsoluteFill style={px > 0 ? {filter: `blur(${px}px)`, transform: `scale(${scale})`} : undefined}>{children}</AbsoluteFill>;
};

export const JobVideo: React.FC<JobVideoProps> = ({jobId, plan, brand, words, audit}) => {
  const {fps, audio, captions} = plan.meta;
  const fontCss = (brand.fontFiles ?? [])
    .map((f) => `@font-face{font-family:'${f.family}';src:url('${staticFile(`jobs/${jobId}/${f.file}`)}');font-weight:${f.weight ?? 400};}`)
    .join('\n');
  // Hold each frame until the job's fonts are ready, so nothing captures in a fallback font.
  // Captions wait too, because they measure text to choose their size.
  const [fontHandle] = useState(() => delayRender('Loading job fonts'));
  const [fontsReady, setFontsReady] = useState(false);
  const released = useRef(false);
  useEffect(() => {
    Promise.all((brand.fontFiles ?? []).map((f) => document.fonts.load(`${f.weight ?? 400} 16px '${f.family}'`)))
      .then(() => setFontsReady(true))
      .catch((err) => cancelRender(err));
  }, [brand.fontFiles]);
  useEffect(() => {
    if (fontsReady && !released.current) {
      released.current = true;
      continueRender(fontHandle);
    }
  }, [fontsReady, fontHandle]);

  const motion = motionTokens(brand);
  const transitionFrames = (b?: Beat) => (b?.transition && b.transition.type !== 'cut' ? Math.round((b.transition.sec ?? motion.transitionSec) * fps) : 0);
  // A beat always starts on its plan.json time, so the incoming beat begins on its word.
  // The outgoing beat holds for the length of the transition instead, which leaves the total length unchanged.
  const series = plan.beats.flatMap((b, i) => {
    const Scene = registry[b.scene as SceneName];
    if (!Scene) throw new Error(`Unknown scene "${b.scene}" in beat "${b.id}"`);
    const next = plan.beats[i + 1];
    const from = Math.round(b.start * fps);
    const dur = Math.max(1, Math.round(b.end * fps) - from);
    const overlap = transitionFrames(next);
    const items = [
      <TransitionSeries.Sequence key={b.id} offset={i === 0 ? from : 0} durationInFrames={dur + overlap}>
        <BeatBlur blurIn={b.props.blurIn ?? 0} blurOut={b.props.blurOut ?? 0} dur={dur}>
          <Scene props={b.props} jobId={jobId} beatStart={b.start} />
        </BeatBlur>
      </TransitionSeries.Sequence>,
    ];
    if (overlap > 0) {
      items.push(
        <TransitionSeries.Transition
          key={`${b.id}-to-${next.id}`}
          timing={linearTiming({durationInFrames: overlap, easing: toEasing(motion.moveEase)})}
          presentation={(next.transition?.type === 'slide' ? slide({direction: next.transition.direction ?? 'from-right'}) : fade()) as any}
        />,
      );
    }
    return items;
  });

  return (
    <ThemeProvider brand={brand} jobId={jobId}>
      <AbsoluteFill data-job-root>
        {fontCss ? <style>{fontCss}</style> : null}
        <TransitionSeries>{series}</TransitionSeries>
        {captions && words?.length && fontsReady ? <CaptionsOverlay words={words} config={captions} /> : null}
        {audit ? <AuditProbe mode={audit} ready={fontsReady} /> : null}
        {audio ? <Audio src={staticFile(`jobs/${jobId}/${audio}`)} /> : null}
      </AbsoluteFill>
    </ThemeProvider>
  );
};
