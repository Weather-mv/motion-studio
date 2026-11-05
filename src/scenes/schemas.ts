// One zod schema per scene. These drive Studio's sidebar, the prop checks in `npm run check`, and scenes.md.
// This file must stay free of React and of src/ imports, because the Node tools load it too.
import {z} from 'zod';

export const ICON_NAMES = ['check', 'cross', 'shield', 'chart', 'clock', 'user', 'users', 'gear', 'bolt', 'globe', 'lock', 'doc', 'search', 'star', 'bell', 'link'] as const;
export type IconName = (typeof ICON_NAMES)[number];
const icon = z.enum(ICON_NAMES);

// Every scene accepts the beat-level blur fields and keeps unknown props, so older plans stay valid.
const scene = <T extends z.ZodRawShape>(shape: T) =>
  z.looseObject({
    ...shape,
    blurIn: z.number().min(0).optional().describe('Frames of blur as the beat arrives'),
    blurOut: z.number().min(0).optional().describe('Frames of blur as the beat leaves'),
  });

const SCREEN = {
  src: z.string().optional().describe('Screenshot file in public/jobs/<job>/. Leave out to draw a blank illustrative UI'),
  illustrative: z.boolean().default(true).describe('True unless src is a real product screen. List it in the brief'),
};

export const sceneSchemas = {
  title: scene({
    headline: z.string().describe('Main line'),
    sub: z.string().optional().describe('Supporting line'),
    align: z.enum(['left', 'center']).optional().describe('Text alignment'),
  }),
  featureGrid: scene({
    title: z.string().optional().describe('Heading'),
    items: z.array(z.string()).min(1).max(6).describe('2 to 6 short items'),
    cycleSec: z.number().positive().optional().describe('Seconds each item stays highlighted'),
  }),
  metric: scene({
    value: z.number().describe('The number. Log it in claims.json'),
    label: z.string().describe('What it measures'),
    prefix: z.string().optional().describe('Text before the number'),
    suffix: z.string().optional().describe('Text after the number'),
    decimals: z.number().int().min(0).max(4).optional().describe('Decimal places'),
    countSec: z.number().positive().optional().describe('Seconds to count up'),
  }),
  stepFlow: scene({
    title: z.string().optional().describe('Heading'),
    steps: z.array(z.object({
      title: z.string().describe('Step name'),
      body: z.string().optional().describe('One short line'),
      icon: icon.optional().describe('Replaces the step number'),
    })).min(2).max(6).describe('2 to 6 steps, in order'),
    startSec: z.number().min(0).default(0.2).describe('When the first step arrives'),
    stepSec: z.number().positive().default(1).describe('Seconds between steps. Set from the voiceover'),
  }),
  alert: scene({
    badge: z.string().describe('Small label above the headline'),
    headline: z.string().describe('Main line'),
    sub: z.string().optional().describe('Line below the box'),
    tone: z.enum(['ok', 'warn', 'error']).optional().describe('Status colour'),
  }),
  threeStage: scene({
    count: z.number().int().min(1).max(20).optional().describe('Number of objects'),
    highlightIndex: z.number().int().min(0).optional().describe('Object shown in the warn colour'),
    headline: z.string().optional().describe('Main line'),
    sub: z.string().optional().describe('Supporting line'),
  }),
  cta: scene({
    headline: z.string().describe('One promise'),
    sub: z.string().optional().describe('Supporting line'),
    button: z.string().describe('Button text'),
    url: z.string().optional().describe('Address shown under the button'),
  }),
  deviceMockup: scene({
    device: z.enum(['laptop', 'browser', 'tablet', 'phone']).default('laptop').describe('Frame drawn around the screen'),
    headline: z.string().optional().describe('Main line'),
    sub: z.string().optional().describe('Supporting line'),
    ...SCREEN,
    zoomTo: z.number().min(1).max(1.5).default(1.04).describe('Slow push-in over the beat. 1 means none'),
  }),
  cursorDemo: scene({
    device: z.enum(['laptop', 'browser', 'tablet', 'phone']).default('browser').describe('Frame drawn around the screen'),
    headline: z.string().optional().describe('Main line'),
    sub: z.string().optional().describe('Supporting line'),
    ...SCREEN,
    path: z.array(z.object({
      x: z.number().min(0).max(100).describe('Percent of screen width'),
      y: z.number().min(0).max(100).describe('Percent of screen height'),
      at: z.number().min(0).describe('Seconds from the start of the beat when the cursor arrives'),
      click: z.boolean().optional().describe('Show a click here'),
    })).min(1).describe('Cursor stops, in time order'),
    callout: z.object({
      at: z.number().min(0).describe('Seconds from the start of the beat when the zoom begins'),
      until: z.number().min(0).optional().describe('When the zoom ends. Leave out to hold'),
      x: z.number().min(0).max(100).describe('Left edge of the region, percent of screen'),
      y: z.number().min(0).max(100).describe('Top edge of the region, percent of screen'),
      w: z.number().min(1).max(100).describe('Region width, percent of screen'),
      h: z.number().min(1).max(100).describe('Region height, percent of screen'),
      zoom: z.number().min(1).max(4).default(2).describe('Zoom amount'),
      label: z.string().optional().describe('Text shown with the zoom'),
    }).optional().describe('Zoom into one region'),
  }),
  beforeAfter: scene({
    mode: z.enum(['split', 'wipe']).default('split').describe('Side by side, or one wiping over the other'),
    before: z.object({label: z.string().describe('Panel label'), items: z.array(z.string()).optional().describe('Short lines'), src: z.string().optional().describe('Image file')}),
    after: z.object({label: z.string().describe('Panel label'), items: z.array(z.string()).optional().describe('Short lines'), src: z.string().optional().describe('Image file')}),
    revealAt: z.number().min(0).default(1).describe('Seconds from the start of the beat when "after" appears'),
  }),
  chart: scene({
    type: z.enum(['bar', 'line']).default('bar').describe('Bar for comparing, line for change over time'),
    title: z.string().describe('The insight, as a sentence'),
    source: z.string().describe('Where the data comes from. Shown on screen'),
    labels: z.array(z.string()).min(2).describe('One label per value'),
    series: z.array(z.object({
      name: z.string().describe('Series name'),
      values: z.array(z.number()).describe('One value per label'),
    })).min(1).max(3).describe('1 to 3 series, all on one axis'),
    prefix: z.string().optional().describe('Text before each value'),
    suffix: z.string().optional().describe('Text after each value'),
    highlight: z.number().int().min(0).optional().describe('Index of the label that matters. The others fade back'),
    startSec: z.number().min(0).default(0.3).describe('When the marks start to build'),
    buildSec: z.number().positive().default(1.2).describe('Seconds the marks take to build'),
  }),
  quote: scene({
    text: z.string().describe('Approved quote, exact words. Never invent one'),
    author: z.string().describe('Name, with permission'),
    role: z.string().optional().describe('Title and company'),
  }),
  timeline: scene({
    title: z.string().optional().describe('Heading'),
    items: z.array(z.object({
      label: z.string().describe('Date or phase'),
      title: z.string().describe('What happened'),
      body: z.string().optional().describe('One short line'),
    })).min(2).max(6).describe('2 to 6 events, in order'),
    startSec: z.number().min(0).default(0.2).describe('When the first event arrives'),
    itemSec: z.number().positive().default(0.7).describe('Seconds between events. Set from the voiceover'),
  }),
  logoReveal: scene({
    tagline: z.string().optional().describe('Confirmed tagline'),
    size: z.number().min(0.1).max(0.8).default(0.3).describe('Logo size, as a share of the short side'),
    taglineAt: z.number().min(0).default(0.7).describe('Seconds from the start of the beat when the tagline arrives'),
  }),
  iconGrid: scene({
    title: z.string().optional().describe('Heading'),
    items: z.array(z.object({
      icon: icon.describe('Icon name'),
      label: z.string().describe('Short label'),
      body: z.string().optional().describe('One short line'),
    })).min(2).max(9).describe('2 to 9 items'),
    startSec: z.number().min(0).default(0.2).describe('When the first item arrives'),
  }),
  // Written for one client job. Their props are job-specific, so only the shared fields are typed here.
  robotDashboard: scene({}),
  anomalyAlert: scene({}),
  nightSite: scene({}),
  routeMap: scene({}),
  logoEndCard: scene({}),
  fleetOverhead: scene({}),
  oversightConsolidation: scene({}),
  auditTrail: scene({}),
  scaleFinale: scene({}),
};

export type SceneName = keyof typeof sceneSchemas;
export const SCENE_NAMES = Object.keys(sceneSchemas) as SceneName[];
export const CLIENT_SCENES: SceneName[] = [
  'robotDashboard', 'anomalyAlert', 'nightSite', 'routeMap', 'logoEndCard',
  'fleetOverhead', 'oversightConsolidation', 'auditTrail', 'scaleFinale',
];
export const NEW_SCENE_SUMMARIES: Partial<Record<SceneName, string>> = {
  title: 'Headline and supporting line. Use for hooks and section openers.',
  featureGrid: 'Short items in a grid, highlighted one after another.',
  metric: 'One number counting up, with a label.',
  stepFlow: 'Numbered steps joined by a drawn line. The current step is highlighted. Horizontal on 16:9, vertical on 9:16 and 1:1.',
  alert: 'A status box in the ok, warn or error colour.',
  threeStage: 'Generic 3D row of objects on a ground plane. Replace the geometry per brand.',
  cta: 'Logo, one promise, button and address.',
  deviceMockup: 'A screen inside a laptop, browser, tablet or phone frame, with a slow push-in.',
  cursorDemo: 'A cursor moves over a screen, clicks, and zooms into a region with a callout.',
  beforeAfter: 'Two states, side by side or wiping across.',
  chart: 'Bar or line chart built from props, with its source on screen. One axis only.',
  quote: 'An approved quote with attribution.',
  timeline: 'Events along a drawn line. Horizontal on 16:9, vertical on 9:16 and 1:1.',
  logoReveal: 'Logo arrival with an optional tagline. Falls back to the brand name if there is no logo file.',
  iconGrid: 'Icons with labels in a grid that adapts to the ratio.',
};
