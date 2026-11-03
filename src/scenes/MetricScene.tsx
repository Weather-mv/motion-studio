import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Safe} from '../core/Safe';
import {useStage} from '../core/stage';
import {useTheme} from '../core/theme';
import type {SceneProps} from '../core/types';

// props: value (number), prefix?, suffix?, label, decimals?, countSec?
export const MetricScene: React.FC<SceneProps> = ({props}) => {
  const {brand} = useTheme();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const width = useStage().unit * 1920;
  const dur = (props.countSec ?? 1.6) * fps;
  const p = interpolate(frame, [0.3 * fps, 0.3 * fps + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const v = (props.value ?? 0) * p;
  const opacity = interpolate(frame, [0, 0.3 * fps], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: brand.colors.bg}}>
      <Safe style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center', opacity}}>
        <div style={{fontFamily: brand.fonts.heading, fontSize: width * 0.12, fontWeight: 800, color: brand.colors.accent}}>
          {props.prefix ?? ''}{v.toFixed(props.decimals ?? 0)}{props.suffix ?? ''}
        </div>
        <div style={{fontFamily: brand.fonts.body, fontSize: width * 0.028, color: brand.colors.text, marginTop: 12}}>{props.label}</div>
      </Safe>
    </AbsoluteFill>
  );
};
