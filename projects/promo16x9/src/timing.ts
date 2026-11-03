// Every frame boundary in the film. All values are frames at 30 fps, counted from the start of the film.
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const TOTAL_FRAMES = 750; // 25 s

export const SCENE = {
  multiplication: {from: 0, to: 120}, // 0 to 4 s
  collapse: {from: 120, to: 300}, // 4 to 10 s
  timeline: {from: 300, to: 570}, // 10 to 19 s
  close: {from: 570, to: 750}, // 19 to 25 s
} as const;

export const HEADLINE_EXIT = 8; // a headline fades out over the last 8 frames of its scene

export const S1 = {
  robotStart: 0, // first robot
  robotStagger: 6, // one more robot every 6 frames (10 robots: last starts at frame 54)
  robotCount: 10,
  deskStart: 16, // first desk
  deskStagger: 8, // one more desk every 8 frames (12 desks: last starts at frame 104)
  deskCount: 12,
  headlineAt: 60, // two-tone headline arrives
  glowMaxOpacity: 0.18, // the only orange in the film
};

export const S2 = {
  robotsOutFrom: 120, // the fleet leaves as the scene turns to oversight
  robotsOutTo: 140,
  headlineAt: 120,
  subheadingAt: 135,
  collapseFrom: 200, // desks merge, Easing.inOut(Easing.cubic)
  collapseTo: 260,
  layerFadeFrom: 240, // the single layer resolves as the desks finish merging
  layerFadeTo: 260,
  logoAt: 260, // logo fades in on the layer
  logoFadeFrames: 15,
};

export const S3 = {
  layerOutFrom: 300, // the layer clears for the audit card
  layerOutTo: 316,
  headlineAt: 300,
  lineFrom: 310, // timeline draws left to right
  lineTo: 500,
  markerCount: 6,
  robotStagger: 30, // gap between robots starting along the line
  cardFrom: 340, // audit card fades in
  cardTo: 360,
  rowStart: 380, // first checklist row fills
  rowStagger: 25, // one more row every 25 frames (6 rows: last starts at frame 505)
  rowCount: 6,
  rowFillFrames: 18,
  sceneOutFrom: 556, // timeline, robots and card clear before scene 4
  sceneOutTo: 570,
};

export const S4 = {
  headlineAt: 570,
  fleetAt: 570, // full fleet arrives
  layerFrom: 570, // steady oversight layer arrives
  layerTo: 590,
  logoCentreFrom: 660, // top-left logo starts to fade out
  logoCornerOutTo: 668, // top-left logo gone
  logoCentreInFrom: 664, // centred logo starts to fade in
  logoCentreTo: 680, // centred logo settled
  ctaAt: 660, // CTA pill scales in with a spring
  ctaSettleFrames: 19, // the spring reaches exactly 1 one frame after this, at frame 680
  holdFrom: 680, // nothing moves from here...
  holdTo: 740, // ...to here: exactly 60 static frames
  fadeFrom: 740, // fade to periwinkle over the last 10 frames
  fadeTo: 750,
};
