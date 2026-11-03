import React from 'react';
import {AbsoluteFill, Img, staticFile, useVideoConfig} from 'remotion';
import {Safe} from '../core/Safe';
import {useTheme} from '../core/theme';
import {useGsapTimeline} from '../core/useGsap';
import type {SceneProps} from '../core/types';

// props: headline, sub?, button, url?
export const CtaScene: React.FC<SceneProps> = ({props}) => {
  const {brand, jobId} = useTheme();
  const {width} = useVideoConfig();
  const ref = useGsapTimeline((tl, root) => {
    tl.from(root.querySelectorAll('.i'), {opacity: 0, y: 30, duration: 0.5, ease: 'power3.out', stagger: 0.25}, 0.2);
    tl.to(root.querySelector('.btn'), {scale: 1.06, duration: 0.6, yoyo: true, repeat: 3, ease: 'sine.inOut'}, 1.6);
  });
  return (
    <AbsoluteFill style={{background: brand.colors.bg}}>
      <Safe style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
        <div ref={ref} style={{fontFamily: brand.fonts.heading}}>
          {brand.logo ? <Img className="i" src={staticFile(`jobs/${jobId}/${brand.logo}`)} style={{height: width * 0.06, marginBottom: 24}} /> : <div className="i" style={{fontSize: width * 0.04, fontWeight: 800, color: brand.colors.text}}>{brand.name}</div>}
          <div className="i" style={{fontSize: width * 0.03, color: brand.colors.text, fontWeight: 700, maxWidth: width * 0.7, margin: '0 auto'}}>{props.headline}</div>
          {props.sub ? <div className="i" style={{fontSize: width * 0.02, color: brand.colors.muted, marginTop: 12}}>{props.sub}</div> : null}
          <div className="i" style={{marginTop: 36}}>
            <span className="btn" style={{display: 'inline-block', background: brand.colors.accent, color: brand.colors.bg, fontWeight: 800, fontSize: width * 0.022, padding: '20px 44px', borderRadius: 16}}>{props.button}</span>
          </div>
          {props.url ? <div className="i" style={{fontSize: width * 0.018, color: brand.colors.text, marginTop: 20}}>{props.url}</div> : null}
        </div>
      </Safe>
    </AbsoluteFill>
  );
};
