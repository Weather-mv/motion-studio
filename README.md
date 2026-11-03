# Motion Studio

Brief + brand + script + audio in, motion-graphics video out. Built on Remotion, Three.js and GSAP, driven by Claude Code.

## One-time setup
1. Install Node 20+, ffmpeg, and (for audio timing) Python with `pip install faster-whisper`.
2. `npm install`
3. Open Claude Code in this folder. It reads `CLAUDE.md` automatically.

## Make a video
1. `/new-job my-promo 16x9 30` (name, ratio 16x9|9x16|1x1, seconds)
2. Put assets in `public/jobs/my-promo/`: logo, font TTFs, voiceover, `ref.mp4`.
3. Fill `jobs/my-promo/brief.md`, `brand.json` (hex colours, fonts) and `script.md`. Set `meta.audio` in `plan.json` to your audio file name.
4. `/intake my-promo` lists what is still missing.
5. `/storyboard my-promo` aligns the audio, studies the reference, offers 3 directions and 3 hooks, then writes `plan.json` and the storyboard. Reply by beat number ("Beat 3: slower"), then say "approved".
6. `/build my-promo` builds scenes, shows stills of the riskiest beats first.
7. `/qa my-promo` measures and writes `qa/VERIFY.md`.
8. `/render my-promo` writes `out/my-promo-final.mp4`.

Preview any time: `npm run studio`, then pick the job in the sidebar.

## Add a scene
Create `src/scenes/Foo.tsx`, register it in `src/scenes/registry.ts`, add its key to `SCENES` in `tools/check-job.mjs`. Ask Claude to do this when a script needs something new.

## Scenes included
title, featureGrid, metric, stepFlow, alert, threeStage, cta. The `threeStage` 3D scene is a generic placeholder (boxes on a ground plane); replace the geometry per brand.
