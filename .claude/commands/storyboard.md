Job: $ARGUMENTS
1. Run `npm run check -- $ARGUMENTS --static`. Stop and ask me if there are blockers other than OPEN placeholders in plan.json, which this step replaces.
2. If plan.json has meta.type, read templates/types/<type>.json and follow it: length range, beat skeleton, default scenes, pacing limits and retention rules. Treat the skeleton as the starting structure, and say so if the script needs to depart from it. Flag any retention rule the script cannot meet. If there is no meta.type, ask me which type this video is.
3. If meta.audio is set, run `.venv/Scripts/python.exe tools/align.py $ARGUMENTS` and use jobs/$ARGUMENTS/edit/words.json so every beat and on-screen word starts on its spoken word. Flag voiceover lines over the type's maxSylPerSec.
4. If public/jobs/$ARGUMENTS/ref.mp4 exists, extract 1 frame per second with ffmpeg, study pace, type, colour, easing and transitions, and write jobs/$ARGUMENTS/edit/style.md. Use it as style only; never copy its text or branding.
5. Pick scenes only from src/scenes/registry.ts, with props as documented in scenes.md. If a beat needs a scene that does not exist, propose a new scene instead of faking it. Set each beat's transition (cut, fade or slide) in plan.json.
6. Log every number and factual claim in jobs/$ARGUMENTS/claims.json, and every file in jobs/$ARGUMENTS/assets.json.
7. Offer 3 edit directions and 3 hook-text options in one message. After I pick, write jobs/$ARGUMENTS/plan.json and jobs/$ARGUMENTS/edit/storyboard.md (numbered beats: time, exact words, scene, props, transition, SFX, why).
8. Render nothing. Wait for me to say "approved" or give notes by beat number.
