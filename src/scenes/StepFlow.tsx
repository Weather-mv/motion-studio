import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {Safe} from '../core/Safe';
import {useTheme} from '../core/theme';
import {useGsapTimeline} from '../core/useGsap';
import type {SceneProps} from '../core/types';

// props: title?, steps: string[] (2-5), stepSec?
export const StepFlow: React.FC<SceneProps> = ({props}) => {
  const {brand} = useTheme();
  const {width} = useVideoConfig();
  const steps: string[] = props.steps ?? [];
  const gap: number = props.stepSec ?? 1.0;
  const ref = useGsapTimeline((tl, root) => {
    root.querySelectorAll('.step').forEach((el, i) => {
      tl.from(el, {opacity: 0, y: 30, duration: 0.45, ease: 'power3.out'}, 0.3 + i * gap);
    });
    root.querySelectorAll('.line').forEach((el, i) => {
      tl.from(el, {scaleX: 0, transformOrigin: 'left center', duration: 0.4, ease: 'power2.out'}, 0.5 + i * gap);
    });
  });
  return (
    <AbsoluteFill style={{background: brand.colors.bg}}>
      <Safe style={{justifyContent: 'center'}}>
        <div ref={ref} style={{fontFamily: brand.fonts.body}}>
          {props.title ? <div style={{fontSize: width * 0.032, color: brand.colors.text, fontWeight: 800, marginBottom: 48}}>{props.title}</div> : null}
          <div style={{display: 'flex', alignItems: 'center'}}>
            {steps.map((s, i) => (
              <React.Fragment key={i}>
                <div className="step" style={{background: brand.colors.panel, border: `2px solid ${brand.colors.secondary}`, borderRadius: 18, padding: '28px 32px', color: brand.colors.text, fontSize: width * 0.019, fontWeight: 700, whiteSpace: 'nowrap'}}>
                  <span style={{color: brand.colors.accent, marginRight: 12}}>{i + 1}</span>{s}
                </div>
                {i < steps.length - 1 ? <div className="line" style={{flex: 1, height: 4, background: brand.colors.secondary, minWidth: 24}} /> : null}
              </React.Fragment>
            ))}
          </div>
        </div>
      </Safe>
    </AbsoluteFill>
  );
};
