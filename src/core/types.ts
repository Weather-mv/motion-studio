export type MotionTokens = {
  enterSec: number; // how long an element takes to arrive
  exitSec: number;
  staggerSec: number; // gap between items arriving in a group
  transitionSec: number; // default scene transition length
  distance: number; // px an element travels as it arrives
  enterEase: [number, number, number, number]; // cubic-bezier for arrivals
  moveEase: [number, number, number, number]; // cubic-bezier for moves on screen, such as the cursor
};

export type Brand = {
  name: string;
  logo?: string; // file name inside public/jobs/<id>/
  colors: {
    bg: string; panel: string; text: string; muted: string;
    accent: string; secondary: string; ok: string; warn: string; error: string;
  };
  fonts: {heading: string; body: string};
  fontFiles?: {family: string; file: string; weight?: number}[]; // TTFs in public/jobs/<id>/
  motion?: Partial<MotionTokens>;
  background?: string; // file name inside public/jobs/<id>/
  glass?: {tint: string; opacity: number}; // frosted panel tint
  night?: {sky: string; skyLow: string; ground: string; building: string; window: string; fence: string; light: string; text: string; highlight: string};
};

export type Transition = {type: 'cut' | 'fade' | 'slide'; sec?: number; direction?: 'from-left' | 'from-right' | 'from-top' | 'from-bottom'};

export type Beat = {
  id: string;
  start: number; // seconds
  end: number;
  scene: string; // key in scenes/registry.ts
  props: Record<string, any>;
  vo?: string;
  sfx?: string[];
  transition?: Transition; // how this beat arrives from the previous one; default is a cut
};

export type Word = {word: string; start: number; end: number};

export type CaptionsConfig = {maxWords?: number; position?: 'top' | 'center' | 'bottom'};

export type Plan = {
  meta: {
    title: string;
    width: number;
    height: number;
    fps: number;
    durationSec: number;
    audio?: string; // file name inside public/jobs/<id>/
    type?: string; // file name in templates/types/, without .json
    gates?: number; // 2 = claims and assets logs are required
    captions?: CaptionsConfig; // word-timed captions from edit/words.json
  };
  beats: Beat[];
};

export type JobData = {id: string; plan: Plan; brand: Brand; words?: Word[]};
export type SceneProps = {props: Record<string, any>; jobId: string; beatStart?: number};
