import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Sequence, cancelRender, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {registry} from './scenes/registry';
import {ThemeProvider} from './core/theme';
import type {Brand, Plan} from './core/types';

export type JobVideoProps = {jobId: string; plan: Plan; brand: Brand};

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

export const JobVideo: React.FC<JobVideoProps> = ({jobId, plan, brand}) => {
  const {fps, audio} = plan.meta;
  const fontCss = (brand.fontFiles ?? [])
    .map((f) => `@font-face{font-family:'${f.family}';src:url('${staticFile(`jobs/${jobId}/${f.file}`)}');font-weight:${f.weight ?? 400};}`)
    .join('\n');
  // Hold each frame until the job's fonts are ready, so nothing captures in a fallback font.
  const [fontHandle] = useState(() => delayRender('Loading job fonts'));
  useEffect(() => {
    Promise.all((brand.fontFiles ?? []).map((f) => document.fonts.load(`${f.weight ?? 400} 16px '${f.family}'`)))
      .then(() => continueRender(fontHandle))
      .catch((err) => cancelRender(err));
  }, [brand.fontFiles, fontHandle]);
  return (
    <ThemeProvider brand={brand} jobId={jobId}>
      <AbsoluteFill>
        {fontCss ? <style>{fontCss}</style> : null}
        {plan.beats.map((b) => {
          const Scene = registry[b.scene];
          if (!Scene) throw new Error(`Unknown scene "${b.scene}" in beat "${b.id}"`);
          const from = Math.round(b.start * fps);
          const dur = Math.max(1, Math.round((b.end - b.start) * fps));
          return (
            <Sequence key={b.id} from={from} durationInFrames={dur}>
              <BeatBlur blurIn={b.props.blurIn ?? 0} blurOut={b.props.blurOut ?? 0} dur={dur}>
                <Scene props={b.props} jobId={jobId} beatStart={b.start} />
              </BeatBlur>
            </Sequence>
          );
        })}
        {audio ? <Audio src={staticFile(`jobs/${jobId}/${audio}`)} /> : null}
      </AbsoluteFill>
    </ThemeProvider>
  );
};
