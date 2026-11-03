// The schema for a whole job: what Studio's sidebar edits and what `npm run check` validates.
// Stays free of React, because the Node tools load it too.
import {z} from 'zod';
import {zColor} from '@remotion/zod-types';
import {sceneSchemas, SCENE_NAMES, CLIENT_SCENES, NEW_SCENE_SUMMARIES, type SceneName} from '../scenes/schemas';

export {sceneSchemas, SCENE_NAMES, CLIENT_SCENES, NEW_SCENE_SUMMARIES};

const bezier = z.tuple([z.number(), z.number(), z.number(), z.number()]);

export const transitionSchema = z.object({
  type: z.enum(['cut', 'fade', 'slide']).describe('How this beat arrives from the previous one'),
  sec: z.number().positive().optional().describe('Length. Defaults to the brand motion token transitionSec'),
  direction: z.enum(['from-left', 'from-right', 'from-top', 'from-bottom']).optional().describe('Slide direction'),
});

const beatOf = <N extends SceneName>(name: N) =>
  z.object({
    id: z.string().describe('Beat name'),
    start: z.number().min(0).describe('Seconds, on the frame grid'),
    end: z.number().positive().describe('Seconds, on the frame grid'),
    scene: z.literal(name),
    props: sceneSchemas[name],
    vo: z.string().optional().describe('Voiceover line'),
    sfx: z.array(z.string()).optional().describe('Sound effect files'),
    transition: transitionSchema.optional(),
  });

const beatSchemas = SCENE_NAMES.map((n) => beatOf(n)) as unknown as [ReturnType<typeof beatOf>, ...ReturnType<typeof beatOf>[]];

export const planSchema = z.object({
  meta: z.looseObject({
    title: z.string(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    fps: z.number().positive(),
    durationSec: z.number().positive(),
    audio: z.string().optional(),
    type: z.string().optional(),
    gates: z.number().optional(),
    captions: z.object({
      maxWords: z.number().int().min(1).max(3).optional().describe('Words on screen at once'),
      position: z.enum(['top', 'center', 'bottom']).optional().describe('Where captions sit'),
    }).optional(),
  }),
  beats: z.array(z.discriminatedUnion('scene', beatSchemas)),
});

export const brandSchema = z.looseObject({
  name: z.string(),
  logo: z.string().optional(),
  colors: z.object({
    bg: zColor(), panel: zColor(), text: zColor(), muted: zColor(), accent: zColor(), secondary: zColor(), ok: zColor(), warn: zColor(), error: zColor(),
  }),
  fonts: z.object({heading: z.string(), body: z.string()}),
  fontFiles: z.array(z.object({family: z.string(), file: z.string(), weight: z.number().optional()})).optional(),
  motion: z.object({
    enterSec: z.number().positive().optional().describe('How long an element takes to arrive'),
    exitSec: z.number().positive().optional().describe('How long an element takes to leave'),
    staggerSec: z.number().min(0).optional().describe('Gap between items arriving in a group'),
    transitionSec: z.number().positive().optional().describe('Default scene transition length'),
    distance: z.number().min(0).optional().describe('Pixels an element travels as it arrives'),
    enterEase: bezier.optional().describe('Cubic-bezier for arrivals'),
    moveEase: bezier.optional().describe('Cubic-bezier for moves on screen'),
  }).optional(),
  background: z.string().optional(),
  glass: z.object({tint: zColor(), opacity: z.number().min(0).max(1)}).optional(),
});

export const jobPropsSchema = z.object({
  jobId: z.string(),
  plan: planSchema,
  brand: brandSchema,
  words: z.array(z.object({word: z.string(), start: z.number(), end: z.number()})).optional(),
});
