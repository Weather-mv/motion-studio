import React from 'react';
import {Composition} from 'remotion';
import {JobVideo} from './JobVideo';
import {jobs} from './jobs.generated';

export const Root: React.FC = () => (
  <>
    {jobs.map((j) => (
      <Composition
        key={j.id}
        id={j.id}
        component={JobVideo}
        durationInFrames={Math.round(j.plan.meta.durationSec * j.plan.meta.fps)}
        fps={j.plan.meta.fps}
        width={j.plan.meta.width}
        height={j.plan.meta.height}
        defaultProps={{jobId: j.id, plan: j.plan, brand: j.brand}}
      />
    ))}
  </>
);
