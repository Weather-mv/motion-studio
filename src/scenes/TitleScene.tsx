import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {Safe} from '../core/Safe';
import {useTheme} from '../core/theme';
import {useGsapTimeline} from '../core/useGsap';
import type {SceneProps} from '../core/types';

// props: headline, sub?, align? ('left'|'center')
export const TitleScene: React.FC<SceneProps> = ({props}) => {
  const {brand} = useTheme();
  const {width} = useVideoConfig();
  const center = props.align === 'center';
  const ref = useGsapTimeline((tl, root) => {
    tl.from(root.querySelectorAll('.w'), {opacity: 0, y: 40, duration: 0.5, ease: 'power3.out', stagger: brand.motion?.staggerSec ?? 0.12}, 0.2);
    tl.from(root.querySelector('.sub'), {opacity: 0, y: 24, duration: 0.5, ease: 'power3.out'}, 1.0);
  });
  const words = String(props.headline ?? '').split(' ');
  return (
    <AbsoluteFill style={{background: brand.colors.bg}}>
      <Safe style={{justifyContent: 'center', alignItems: center ? 'center' : 'flex-start'}}>
        <div ref={ref} style={{textAlign: center ? 'center' : 'left', fontFamily: brand.fonts.heading}}>
          <div style={{fontSize: width * 0.05, fontWeight: 800, color: brand.colors.text, lineHeight: 1.1}}>
            {words.map((w, i) => (
              <span key={i} className="w" style={{display: 'inline-block', marginRight: '0.28em'}}>{w}</span>
            ))}
          </div>
          {props.sub ? (
            <div className="sub" style={{fontSize: width * 0.024, color: brand.colors.accent, marginTop: 24}}>{props.sub}</div>
          ) : null}
        </div>
      </Safe>
    </AbsoluteFill>
  );
};
