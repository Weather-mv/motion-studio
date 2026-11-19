import React from 'react';
import {Composition} from 'remotion';
import {FPS, TOTAL_FRAMES} from './config';
import {MeritclawVideo} from './Scene';

// Two formats from one codebase. The layout switches itself from useVideoConfig().
export const Root: React.FC = () => (
  <>
    <Composition id="MeritclawSquare" component={MeritclawVideo} width={1080} height={1080} fps={FPS} durationInFrames={TOTAL_FRAMES} />
    <Composition id="MeritclawVertical" component={MeritclawVideo} width={1080} height={1920} fps={FPS} durationInFrames={TOTAL_FRAMES} />
  </>
);
