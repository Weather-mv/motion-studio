# Motion Studio: standing rules
This repo turns a brief + brand + script + audio into a motion-graphics video of any type (Remotion, Three.js, GSAP). Every video is a job in jobs/<name>/. Nothing here is specific to one client.

## Inputs per job (priority order)
1. Topic and one takeaway  2. Script or facts  3. Audience  4. Video type, platform, length, ratio
5. Reference video  6. Logo, hex colours, fonts  7. CTA (text + URL)  8. My approvals by beat number

## Layout
- jobs/<name>/: brief.md, brand.json, script.md, plan.json, claims.json, assets.json, edit/ (words.json, storyboard.md, notes.md), qa/
- public/jobs/<name>/: logo, fonts, voiceover, ref.mp4 (served by Remotion staticFile)
- templates/types/: one JSON per video type (see video-types.md)
- src/scenes/: reusable scenes (see scenes.md). schemas.ts holds their props, registry.ts lists them.
- src/core/: theme, motion tokens, stage and safe zones, job schema, captions overlay, audit probe, GSAP hook.
- tools/: new-job, check-job, audit, lint-colors, sync, align, render, notes, gen-*-doc
- jobs/gallery: one beat per generic scene, used to test scenes and gates. All content is sample data.

## Workflow (slash commands)
/new-job -> fill inputs -> /intake -> /storyboard -> I approve -> /build -> /qa -> /notes -> /revise -> /render

## Rules
- Nothing renders until I say "approved". Storyboard first, then stills of the two riskiest beats, then the rest. Stills for tests and review are fine; a full video needs my word.
- All timing lives in jobs/<name>/plan.json (seconds, on the fps frame grid). Scenes never hard-code times from the script; they take them as props.
- Transitions are set per beat in plan.json (cut, fade, slide). A beat starts on its plan time; the outgoing beat holds through the transition, so total length does not change.
- Colours and fonts only from the job's brand.json (plus status colours ok/warn/error). No colour literals in src/. Motion comes from the brand's motion tokens through useMotion.
- GSAP only through useGsapTimeline (paused, seeked by frame). Three.js only through ThreeCanvas driven by useCurrentFrame. New scenes prefer useMotion, because it follows prop edits in Studio.
- Every new scene gets a zod schema with a description on every prop, then `npm run docs:scenes`.
- Safe zone: 5% margins on every ratio. 9:16 also keep text clear of the right rail (x > 90% of width, y 55-90% of height). The values live in src/core/safe-zones.json.
- Use only supplied assets. Log every file in assets.json with its source and licence.
- Never invent product features, numbers, logos or testimonials. Log every number and factual claim in claims.json with its source and status (confirmed, unconfirmed or illustrative). Also list unconfirmed claims in brief.md.
- UI is illustrative unless real screens are supplied. Say so in the brief.
- Render picture and sound separately, then mux. Loudness target -14 LUFS, -1.5 dBTP.
- `npm run check -- <job>` must show no blockers before I see a video. NOT RUN is not a pass.
- Commit to git after each scene or step. Client media stays out of git (see .gitignore).
- Say plainly what you could not verify. Do not claim a render or check you did not run.
