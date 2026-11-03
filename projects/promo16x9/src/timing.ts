// Every frame boundary in the film, timed to the voiceover. All values are frames at 30 fps from the start of the film.
// The quoted word is the one spoken on that frame. Word frames come from src/voCueSheet.ts.
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const TOTAL_FRAMES = 650; // 21.67 s. The voice ends near frame 596; the rest is the end card.

export const SCENE = {
  multiplication: {from: 0, to: 164}, // "You added more robots..." to just before "Veron"
  collapse: {from: 164, to: 297}, // "Veron takes over the oversight workflow..."
  timeline: {from: 297, to: 484}, // "Every robot identified..."
  close: {from: 484, to: TOTAL_FRAMES}, // "Scale your fleet..."
} as const;

export const HEADLINE_EXIT = 8; // a headline fades out over the last 8 frames of its scene

export const S1 = {
  robotStart: 0, // "You"
  robotStagger: 6, // one more robot every 6 frames (10 robots: last starts at frame 54)
  robotCount: 10,
  headlineInkAt: 15, // "more" (robots): "More robots."
  deskStart: 63, // "Now": the first desk arrives as the hiring is named
  deskStagger: 8, // one more desk every 8 frames (12 desks: last starts at frame 151, during "them")
  deskCount: 12,
  headlineCobaltAt: 73, // "hiring": "More overhead."
  glowMaxOpacity: 0.18, // the only orange in the film
};

export const S2 = {
  robotsOutFrom: 164, // "Veron": the fleet leaves as the scene turns to oversight
  robotsOutTo: 184,
  headlineAt: 164, // "Veron"
  collapseFrom: 164, // "Veron": desks start to merge, Easing.inOut(Easing.cubic), 60 frames
  layerFadeFrom: 204, // the single layer resolves as the desks finish merging
  layerFadeTo: 224,
  collapseTo: 224, // just after "with"
  logoAt: 224, // logo fades in on the layer
  logoFadeFrames: 15,
  subheadingAt: 235, // "qualified"
};

export const S3 = {
  layerOutFrom: 297, // "Every": the layer clears for the timeline
  layerOutTo: 313,
  lineFrom: 305, // "robot": the timeline starts to draw, left to right
  lineTo: 464, // "there": the timeline finishes
  markerCount: 6, // each pops in as the line reaches it
  robotStagger: 30, // gap between robots starting along the line
  cardFrom: 340, // just before "every action": audit card fades in
  cardTo: 352,
  rowStart: 352, // "action": first checklist row fills
  rowStagger: 20, // one more row every 20 frames (6 rows: last starts at frame 452, "already")
  rowCount: 6,
  rowFillFrames: 18, // last row finished at frame 470
  headlineInkAt: 297, // "Every": "Audit-ready" opens the scene, so the text column is not empty
  headlineCobaltAt: 404, // "audit": "by default."
  sceneOutFrom: 474, // timeline, robots and card clear before scene 4
  sceneOutTo: 484,
};

export const S4 = {
  headlineInkAt: 484, // "Scale": "Scale the fleet."
  layerFrom: 484, // "Scale": steady oversight layer arrives
  layerTo: 504,
  fleetAt: 500, // "fleet"
  headlineCobaltAt: 521, // "not": "Not the overhead."
  logoCentreFrom: 557, // "Book": top-left logo starts to fade out
  logoCornerOutTo: 565, // top-left logo gone
  logoCentreInFrom: 561, // centred logo starts to fade in
  logoCentreTo: 577, // centred logo settled
  ctaAt: 557, // "Book": CTA pill scales in with a spring
  ctaSettleFrames: 19, // the spring reaches exactly 1 one frame after this, at frame 577
  holdFrom: 577, // nothing moves from here...
  holdTo: TOTAL_FRAMES - 10, // ...to here: 63 static frames
  fadeFrom: TOTAL_FRAMES - 10, // fade to periwinkle over the last 10 frames
  fadeTo: TOTAL_FRAMES,
};
