# V.E.R.O.N. promo: storyboard

Edit direction: Cut on the word. Hook: Question-led.
Length: 748 frames at 30 fps, set by the 24.92 s voiceover. No extension after the last word.
Times come from edit/words.json, snapped to the nearest frame. plan.json holds the same values at full precision.
Transitions: hard cut on the first word of each beat, except a short blur on the 1 to 2 night-to-light turn and into beat 5. Blur lengths are in plan.json (blurIn, blurOut).

SFX: none on any beat. No SFX files were supplied, and the job uses only supplied assets.

## Beat 1: night site
- Time: 0.00 to 5.10 (frames 0 to 153)
- Words: "Ten robots. One site. Are they all running as they should?"
- Scene: `nightSite` (built)
- Props: 10 robots patrolling one facility, no logo. Any colours allowed in this beat only.
- On screen:
  - Tag "10 Robots." at 0.00 ("Ten")
  - Tag "1 Site." at 1.40 ("One")
  - Question "Are they all running / as they should?" at 2.90 ("Are")
  - "as they should?" highlights at 3.70 ("as")
- Why: the question-led hook names the tension, and the tag keeps the fleet size in view.

## Beat 2: dashboard
- Time: 5.10 to 12.47 (frames 153 to 374)
- Words: "Veron tracks every robot on your site. Who it is, where it is, what it's doing, and how it's performing."
- Scene: `robotDashboard` (built, still reviewed)
- Props: 10 cards showing Active, Patrolling or Idle, with telemetry as bars only. Logo 140 px.
- On screen:
  - Cards fill in from 5.10 ("Veron") to 7.27 ("site")
  - "Who it is" at 8.07 ("Who"), robot glyph outlined on every card
  - "Where it is" at 8.90 ("where"), location tile outlined
  - "What it's doing" at 9.80 ("what"), status row outlined
  - "How it's performing" at 11.00 ("how"), bars outlined
- Why: each named attribute lights up on the cards as it is spoken, so the viewer sees what tracking means.

## Beat 3: alert
- Time: 12.47 to 17.47 (frames 374 to 524)
- Words: "If something looks off, you're alerted right away, so you're never monitoring alone."
- Scene: `anomalyAlert` (built, still reviewed)
- Props: alert card 7 of 10 turns orange, and its status label is replaced by the warning icon only, with no words. Generic engineer avatar with no name, title or "certified" label. Logo 140 px.
- On screen:
  - Warning icon and "Something / looks off", plus the orange card, at 12.57 ("something")
  - Alert panel at 13.90 ("alerted")
  - Avatar and "Never monitoring / alone" at 15.57 ("never")
- Why: the only orange in the video lands on the turn, then the human figure answers it.
- Flag: this is the fastest line, about 4.9 syllables per second by hand count. `npm run check` warns at ~5.8 using its rougher estimate. The audio is fixed, so the beat carries only three events.

## Beat 4: route map
- Time: 17.47 to 20.63 (frames 524 to 619)
- Words: "Every robot, every route, verified."
- Scene: `routeMap` (built)
- Props: 10 markers on routes, drawn in code. Routes are already drawn on the first frame because the beat is short. Logo 140 px.
- On screen:
  - "Every Robot." at 17.47 ("Every")
  - "Every Route." at 18.47 ("every")
  - "Verified." at 19.47 ("verified")
- Why: the shortest and simplest beat, a proof point after the alert.

## Beat 5: end card
- Time: 20.63 to 24.93 (frames 619 to 748)
- Words: "Veron, scale your robotics fleet, not your compliance overhead."
- Scene: `logoEndCard` (built)
- Props: uncropped logo shown large, left-aligned layout, CTA pill.
- On screen:
  - Logo at 20.63 ("Veron")
  - "Scale your robotics fleet," at 21.53 ("scale")
  - [Request a Demo] at 22.63 ("fleet"), not a spoken word, tied by decision
  - "not your compliance overhead." and proctortrack.com/veron at 23.30 ("not"), URL not spoken
- Why: closes on the promise and one action.
- Flag: the button is visible for 2.30 s, the URL for 1.63 s, and 0.37 s remains after the last word. Accepted: follow the audio.

## Captions changed from the client script
All accepted.
| Beat | Script | Now |
|---|---|---|
| 2 | Identity · Status · Location · Performance | Who it is / Where it is / What it's doing / How it's performing |
| 3 | ⚠ Anomaly Detected | Warning icon + Something looks off |
| 3 | Certified Engineering Oversight | Never monitoring alone |

## Open
- Frosted glass: set to translucent white. No tint was named in the go-ahead, so confirm it. To change it, edit `glass` in brand.json.
