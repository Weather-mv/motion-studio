import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';

// Keeps content inside 5% margins (the safe zone).
export const Safe: React.FC<React.PropsWithChildren<{style?: React.CSSProperties}>> = ({children, style}) => {
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{padding: `${height * 0.05}px ${width * 0.05}px`, ...style}}>{children}</AbsoluteFill>
  );
};
