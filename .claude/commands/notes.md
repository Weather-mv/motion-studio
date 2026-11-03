Save my review notes. Arguments: "$ARGUMENTS" (the job name first, then my notes in any form, such as "f130: logo too small" or "4.3s the caption is late" or "dashboard: slower").
1. Split my message into one note per point. Keep my words; do not interpret or add to them.
2. Save each with `npm run notes -- <job> add <where> "<note>"`, where `<where>` is a frame (f130), a time (4.33s) or a beat id. The tool works out the beat, scene, frame and time, and writes jobs/<job>/edit/notes.md.
3. If a note has no frame, time or beat and I did not say where, ask me where. Do not guess.
4. Show me the saved list with `npm run notes -- <job> list open`.
5. Change nothing else. Apply nothing until I run /revise.
