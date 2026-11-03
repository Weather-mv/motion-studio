import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Safe} from '../core/Safe';
import {useTheme} from '../core/theme';
import {useGsapTimeline} from '../core/useGsap';
import type {SceneProps} from '../core/types';

// props: count (objects), highlightIndex?, headline?, sub?
// Generic 3D stage: a row of objects on a ground plane. Swap geometry for brand-specific models later.
export const ThreeStage: React.FC<SceneProps> = ({props}) => {
  const {brand} = useTheme();
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const t = frame / fps;
  const count: number = props.count ?? 8;
  const hi: number | undefined = props.highlightIndex;
  const ref = useGsapTimeline((tl, root) => {
    tl.from(root.querySelectorAll('.t'), {opacity: 0, y: 40, duration: 0.5, ease: 'power3.out', stagger: 0.4}, 0.3);
  });
  return (
    <AbsoluteFill style={{background: brand.colors.bg}}>
      <ThreeCanvas width={width} height={height} camera={{position: [0, 4, 11], fov: 50}}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
          <planeGeometry args={[60, 60]} />
          <meshStandardMaterial color={brand.colors.panel} />
        </mesh>
        {Array.from({length: count}).map((_, i) => {
          const x = (i - (count - 1) / 2) * 2.0;
          const z = Math.sin(t * 0.9 + i) * 1.0 - 3;
          const on = hi === i;
          return (
            <mesh key={i} position={[x, 0, z]}>
              <boxGeometry args={[0.8, 0.8, 1.1]} />
              <meshStandardMaterial color={on ? brand.colors.warn : brand.colors.secondary} emissive={on ? brand.colors.warn : brand.colors.secondary} emissiveIntensity={0.35} />
            </mesh>
          );
        })}
      </ThreeCanvas>
      <Safe>
        <div ref={ref} style={{fontFamily: brand.fonts.heading}}>
          {props.headline ? <div className="t" style={{fontSize: width * 0.05, fontWeight: 800, color: brand.colors.text}}>{props.headline}</div> : null}
          {props.sub ? <div className="t" style={{fontSize: width * 0.026, color: brand.colors.accent, marginTop: 12}}>{props.sub}</div> : null}
        </div>
      </Safe>
    </AbsoluteFill>
  );
};
