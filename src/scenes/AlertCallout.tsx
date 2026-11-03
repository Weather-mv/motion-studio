import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Safe} from '../core/Safe';
import {useStage} from '../core/stage';
import {useTheme} from '../core/theme';
import {useGsapTimeline} from '../core/useGsap';
import type {SceneProps} from '../core/types';

// props: badge, headline, sub?, tone ('ok'|'warn'|'error')
export const AlertCallout: React.FC<SceneProps> = ({props}) => {
  const {brand} = useTheme();
  const width = useStage().unit * 1920;
  const tone = brand.colors[(props.tone ?? 'warn') as 'ok' | 'warn' | 'error'];
  const ref = useGsapTimeline((tl, root) => {
    tl.from(root.querySelector('.box'), {opacity: 0, scale: 0.85, duration: 0.45, ease: 'back.out(1.6)'}, 0.2);
    tl.from(root.querySelector('.sub'), {opacity: 0, y: 20, duration: 0.4, ease: 'power3.out'}, 1.0);
  });
  return (
    <AbsoluteFill style={{background: brand.colors.bg}}>
      <Safe style={{justifyContent: 'center', alignItems: 'center'}}>
        <div ref={ref} style={{textAlign: 'center', fontFamily: brand.fonts.heading}}>
          <div className="box" style={{display: 'inline-block', border: `3px solid ${tone}`, background: brand.colors.panel, boxShadow: `0 0 60px ${tone}44`, borderRadius: 24, padding: '36px 56px'}}>
            <div style={{color: tone, fontSize: width * 0.016, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase'}}>{props.badge}</div>
            <div style={{color: brand.colors.text, fontSize: width * 0.04, fontWeight: 800, marginTop: 8}}>{props.headline}</div>
          </div>
          {props.sub ? <div className="sub" style={{color: brand.colors.muted, fontSize: width * 0.022, marginTop: 28}}>{props.sub}</div> : null}
        </div>
      </Safe>
    </AbsoluteFill>
  );
};
