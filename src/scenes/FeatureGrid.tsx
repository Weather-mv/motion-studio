import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Safe} from '../core/Safe';
import {useStage} from '../core/stage';
import {useTheme} from '../core/theme';
import {useGsapTimeline} from '../core/useGsap';
import type {SceneProps} from '../core/types';

// props: title?, items: string[] (2-6), cycleSec? (seconds each item stays highlighted)
export const FeatureGrid: React.FC<SceneProps> = ({props}) => {
  const {brand} = useTheme();
  const width = useStage().unit * 1920;
  const items: string[] = props.items ?? [];
  const cycle: number = props.cycleSec ?? 0.9;
  const ref = useGsapTimeline((tl, root) => {
    const cards = root.querySelectorAll('.card');
    tl.from(cards, {opacity: 0, y: 40, scale: 0.94, duration: 0.5, ease: 'power3.out', stagger: 0.12}, 0.2);
    cards.forEach((c, i) => {
      const t = 0.6 + i * cycle;
      tl.to(c, {borderColor: brand.colors.accent, boxShadow: `0 0 40px ${brand.colors.accent}55`, duration: 0.25}, t);
      tl.to(c, {borderColor: brand.colors.panel, boxShadow: '0 0 0 transparent', duration: 0.25}, t + cycle);
    });
  });
  const cols = items.length > 4 ? 3 : 2;
  return (
    <AbsoluteFill style={{background: brand.colors.bg}}>
      <Safe style={{justifyContent: 'center'}}>
        <div ref={ref} style={{fontFamily: brand.fonts.body}}>
          {props.title ? <div style={{fontSize: width * 0.032, color: brand.colors.text, fontWeight: 800, marginBottom: 32}}>{props.title}</div> : null}
          <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 24}}>
            {items.map((t, i) => (
              <div key={i} className="card" style={{background: brand.colors.panel, border: `2px solid ${brand.colors.panel}`, borderRadius: 20, padding: '36px 32px', color: brand.colors.text, fontSize: width * 0.02, fontWeight: 700}}>
                {t}
              </div>
            ))}
          </div>
        </div>
      </Safe>
    </AbsoluteFill>
  );
};
