import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Safe} from './Safe';
import {useTheme} from './theme';
import type {Brand} from './types';

export const alpha = (hex: string, a: number) => hex + Math.round(a * 255).toString(16).padStart(2, '0');

export const glassStyle = (brand: Brand): React.CSSProperties => {
  const tint = brand.glass?.tint ?? brand.colors.panel;
  const opacity = brand.glass?.opacity ?? 0.2;
  return {
    background: alpha(tint, opacity),
    backdropFilter: 'blur(18px)',
    border: `1px solid ${alpha(tint, Math.min(1, opacity + 0.2))}`,
    boxShadow: `0 12px 40px ${alpha(brand.colors.text, 0.08)}`,
  };
};

// Frosted glass when the brand defines it, otherwise its solid panel colour.
export const panelStyle = (brand: Brand): React.CSSProperties =>
  brand.glass ? glassStyle(brand) : {background: brand.colors.panel, border: `1px solid ${alpha(brand.colors.muted, 0.25)}`};

export const Background: React.FC = () => {
  const {brand, jobId} = useTheme();
  return brand.background ? (
    <Img src={staticFile(`jobs/${jobId}/${brand.background}`)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
  ) : (
    <AbsoluteFill style={{background: brand.colors.bg}} />
  );
};

// The standard scene: brand background, brand body font, content inside the safe zone.
export const SceneFrame: React.FC<React.PropsWithChildren<{style?: React.CSSProperties}>> = ({children, style}) => {
  const {brand} = useTheme();
  return (
    <AbsoluteFill style={{fontFamily: brand.fonts.body, color: brand.colors.text}}>
      <Background />
      <Safe style={style}>{children}</Safe>
    </AbsoluteFill>
  );
};
