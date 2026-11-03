import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, cancelRender, continueRender, delayRender, staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {ASSET, FONT} from './brand';
import {DeskStack, FadeOut, MainLogo, Scene1, Scene2, Scene3, Scene4} from './scenes';

export const Promo: React.FC = () => {
  // Roboto loads from public/Roboto. Each frame waits for it, so nothing captures in a fallback font.
  const [handle] = useState(() => delayRender('Loading Roboto'));
  useEffect(() => {
    Promise.all([
      loadFont({family: FONT, url: staticFile(ASSET.regular), weight: '400'}),
      loadFont({family: FONT, url: staticFile(ASSET.bold), weight: '700'}),
    ])
      .then(() => continueRender(handle))
      .catch((err) => cancelRender(err));
  }, [handle]);

  return (
    <AbsoluteFill>
      <Img src={staticFile(ASSET.background)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
      <DeskStack />
      <Scene1 />
      <Scene2 />
      <Scene3 />
      <Scene4 />
      <MainLogo />
      <FadeOut />
      {/* Voice starts on frame 0. All scene timing in timing.ts follows it. */}
      <Audio src={staticFile(ASSET.voiceover)} />
    </AbsoluteFill>
  );
};
