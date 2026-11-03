import React from 'react';
import {Composition} from 'remotion';
import {JobVideo} from './JobVideo';
import {jobPropsSchema} from './core/job-schema';
import {jobs} from './jobs.generated';

// Size and length come from the props, so a plan edited in Studio's sidebar (or passed with --props) takes effect.
export const Root: React.FC = () => (
  <>
    {jobs.map((j) => (
      <Composition
        key={j.id}
        id={j.id}
        component={JobVideo as React.FC<any>}
        schema={jobPropsSchema as any}
        durationInFrames={Math.round(j.plan.meta.durationSec * j.plan.meta.fps)}
        fps={j.plan.meta.fps}
        width={j.plan.meta.width}
        height={j.plan.meta.height}
        defaultProps={{jobId: j.id, plan: j.plan, brand: j.brand, ...(j.words ? {words: j.words} : {})} as any}
        calculateMetadata={({props}: {props: any}) => {
          const {meta} = props.plan;
          return {durationInFrames: Math.round(meta.durationSec * meta.fps), fps: meta.fps, width: meta.width, height: meta.height};
        }}
      />
    ))}
  </>
);
