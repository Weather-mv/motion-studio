# QA record: gallery

Stills and gate runs only. No video was rendered for this job.

## Run
| Check | Result |
|---|---|
| `npm run typecheck` | No errors |
| `npm run check -- gallery` at 16:9 | No blockers |
| `npm run check -- gallery --ratio=9x16` | No blockers |
| `npm run check -- gallery --ratio=1x1` | No blockers |
| Text checks | 161 on 32 frames, per ratio |
| Lowest contrast | 3.16:1 on "Phase 4" in the timeline beat, mid-fade at frame 1313 |
| Stills | 16 of 16 rendered at 1920x1080, one per beat, in this folder |

The 16 beats cover the 15 generic scenes. `title` appears twice, because the captions overlay has its own beat.

## Gates tested against deliberate defects
All 13 were caught: off-grid time, hex not in brand.json, unlogged number, unlogged claim word, invalid scene props, too-fast voiceover, unlogged asset, hex literal in code, rgba literal in code, low contrast, text overflow, safe zone, right rail.

## Not checked
- Motion in real time. Only single frames were reviewed.
- Transitions playing. Fade and slide render without error, but no frame inside a transition was reviewed by eye.
- Loudness and speaking pace on this job. It has no audio. Loudness was tested on veron-promo only.
- Captions against real speech. The timings here are hand-written samples.
- 9:16 and 1:1 motion. Those ratios were checked on frames from the audit, not as saved stills in this folder.
- The client scenes (robotDashboard, anomalyAlert, nightSite, routeMap, logoEndCard) are not in the gallery. They were tested through veron-promo only.
- The Lottie, Rive, motion blur and noise packages are installed but not used by any scene.
