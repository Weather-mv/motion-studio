import React from 'react';
import {Composition} from 'remotion';
import {Promo} from './Promo';
import {FPS, HEIGHT, TOTAL_FRAMES, WIDTH} from './timing';

// One composition, 16:9 only.
export const Root: React.FC = () => (
  <Composition id="Promo16x9" component={Promo} durationInFrames={TOTAL_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
);
