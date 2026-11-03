import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, cancelRender, continueRender, delayRender, getStaticFiles, staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {ASSET, FONT} from './brand';
import {DeskStack, FadeOut, MainLogo, Scene1, Scene2, Scene3, Scene4} from './scenes';

const MUSIC_VOLUME = 0.2; // placeholder until the music file exists and can be measured

const hasFile = (name: string) => getStaticFiles().some((f) => f.name === name);

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
      {/* The audio files are not supplied yet. Each plays as soon as its file is in public/audio/. */}
      {hasFile(ASSET.voiceover) ? <Audio src={staticFile(ASSET.voiceover)} /> : null}
      {hasFile(ASSET.music) ? <Audio src={staticFile(ASSET.music)} volume={MUSIC_VOLUME} /> : null}
    </AbsoluteFill>
  );
};
