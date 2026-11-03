Job: $ARGUMENTS
1. Run `npm run check -- $ARGUMENTS`. Stop and ask me if there are blockers.
2. If meta.audio is set, run `python tools/align.py $ARGUMENTS` and use jobs/$ARGUMENTS/edit/words.json so every beat and on-screen word starts on its spoken word. Flag voiceover lines too fast for their beat.
3. If public/jobs/$ARGUMENTS/ref.mp4 exists, extract 1 frame per second with ffmpeg, study pace, type, colour, easing and transitions, and write jobs/$ARGUMENTS/edit/style.md. Use it as style only; never copy its text or branding.
4. Structure: problem, solution, proof, CTA (adapt to the script). Pick scenes only from src/scenes/registry.ts. If a beat needs a scene that does not exist, propose a new scene instead of faking it.
5. Offer 3 edit directions and 3 hook-text options in one message. After I pick, write jobs/$ARGUMENTS/plan.json and jobs/$ARGUMENTS/edit/storyboard.md (numbered beats: time, exact words, scene, props, SFX, why).
6. Render nothing. Wait for me to say "approved" or give notes by beat number.
