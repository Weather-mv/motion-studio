import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useStage} from './stage';

// Keeps content inside the safe zone for the video's ratio (src/core/safe-zones.json).
export const Safe: React.FC<React.PropsWithChildren<{style?: React.CSSProperties}>> = ({children, style}) => {
  const {safe, width, height} = useStage();
  return (
    <AbsoluteFill style={{paddingTop: safe.top, paddingBottom: height - safe.bottom, paddingLeft: safe.left, paddingRight: width - safe.right, ...style}}>{children}</AbsoluteFill>
  );
};
