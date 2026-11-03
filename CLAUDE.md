# Motion Studio: standing rules
This repo turns a brief + brand + script + audio into a motion-graphics video (Remotion, Three.js, GSAP). Every video is a job in jobs/<name>/. Nothing here is specific to one client.

## Inputs per job (priority order)
1. Topic and one takeaway  2. Script or facts  3. Audience  4. Platform, length, ratio
5. Reference video  6. Logo, hex colours, fonts  7. CTA (text + URL)  8. My approvals by beat number

## Layout
- jobs/<name>/: brief.md, brand.json, script.md, plan.json, edit/, qa/
- public/jobs/<name>/: logo, fonts, voiceover, ref.mp4 (served by Remotion staticFile)
- src/scenes/: reusable scenes, registered in registry.ts. src/core/: theme, GSAP hook, safe zone.
- tools/: new-job, check-job, sync, align (word timestamps), render (picture then mux)

## Workflow (slash commands)
/new-job -> fill inputs -> /intake -> /storyboard -> I approve -> /build -> /qa -> /render

## Rules
- Nothing renders until I say "approved". Storyboard first, then stills of the two riskiest beats, then the rest.
- All timing lives in jobs/<name>/plan.json (seconds, on the fps frame grid). Scenes never hard-code times from the script.
- Colours and fonts only from the job's brand.json (plus status colours ok/warn/error).
- GSAP only through useGsapTimeline (paused, seeked by frame). Three.js only through ThreeCanvas driven by useCurrentFrame.
- Safe zone: 5% margins on every ratio. 9:16 also keep text clear of the right rail (x > 90% of width, y 55-90% of height).
- Use only supplied assets. Never invent product features, numbers, logos or testimonials; list unconfirmed claims in brief.md.
- UI is illustrative unless real screens are supplied. Say so in the brief.
- Render picture and sound separately, then mux. Loudness target -14 LUFS, -1.5 dBTP.
- Say plainly what you could not verify. Do not claim a render or check you did not run.
