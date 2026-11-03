export type Brand = {
  name: string;
  logo?: string; // file name inside public/jobs/<id>/
  colors: {
    bg: string; panel: string; text: string; muted: string;
    accent: string; secondary: string; ok: string; warn: string; error: string;
  };
  fonts: {heading: string; body: string};
  fontFiles?: {family: string; file: string; weight?: number}[]; // TTFs in public/jobs/<id>/
  motion?: {enterSec: number; staggerSec: number};
  background?: string; // file name inside public/jobs/<id>/
  glass?: {tint: string; opacity: number}; // frosted panel tint
  night?: {sky: string; skyLow: string; ground: string; building: string; window: string; fence: string; light: string; text: string; highlight: string};
};

export type Beat = {
  id: string;
  start: number; // seconds
  end: number;
  scene: string; // key in scenes/registry.ts
  props: Record<string, any>;
  vo?: string;
  sfx?: string[];
};

export type Plan = {
  meta: {
    title: string;
    width: number;
    height: number;
    fps: number;
    durationSec: number;
    audio?: string; // file name inside public/jobs/<id>/
  };
  beats: Beat[];
};

export type JobData = {id: string; plan: Plan; brand: Brand};
export type SceneProps = {props: Record<string, any>; jobId: string; beatStart?: number};
