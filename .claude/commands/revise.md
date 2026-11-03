Apply my open notes for job: $ARGUMENTS
1. Run `npm run notes -- $ARGUMENTS list open`. It groups notes by scene. If there are none, say so and stop.
2. Work one scene at a time, in timeline order. For each scene:
   a. State in one line per note what you will change. If a note is unclear, or conflicts with a standing rule or a claim limit, ask me about that note and move on to the next.
   b. Make the change in plan.json props first. Change scene code only when props cannot do it, and if the scene is shared, say which other beats it affects.
   c. Run `npm run typecheck` and `npm run check -- $ARGUMENTS --static`.
   d. Render a still at each note's frame with `npm run render -- $ARGUMENTS --still=<frame>`, open it, and confirm the note is met.
   e. Mark each note with `npm run notes -- $ARGUMENTS done <n> "<what changed>"`. Mark it done only after you have looked at the still.
   f. Commit that scene's changes to git before starting the next scene, so each one can be undone alone.
3. Timing changes must stay on the frame grid and on the spoken words in edit/words.json. The audio stays the source of truth.
4. Do not change anything I did not note. If you notice another problem, list it for me instead of fixing it.
5. When all scenes are done, run the full `npm run check -- $ARGUMENTS`, then report per note: changed, or left open and why. Report plainly what could not be judged from a still, such as motion or audio.
6. Do not render the full video. Wait for me to say "render".
