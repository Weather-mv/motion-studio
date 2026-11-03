Job: $ARGUMENTS
Check the built video before showing me anything.
1. Run `npm run check -- $ARGUMENTS`. It reports every gate as PASS, FAIL, WARN, N/A or NOT RUN: WCAG text contrast against the real rendered background, text overflow, safe zones, fonts from brand.json, fps grid, speaking pace, loudness (-14 LUFS, -1.5 dBTP, measured on out/$ARGUMENTS-final.mp4), colour lint, claims log and assets log. Copy the gate table into the report.
2. If the job could run on other ratios, also run `npm run check -- $ARGUMENTS --ratio=<ratio>`.
3. Then check what the gates cannot see, on frames from the final file: frames either side of every cut and transition, hook visible in the first second, no static shot over the type's maxStaticSec (use ffmpeg freezedetect), captions and on-screen words landing on their spoken words (words.json), and the type's retention rules from templates/types/<type>.json.
4. List every unconfirmed claim from claims.json.
5. Score out of 10, fix anything under 9.5, and write jobs/$ARGUMENTS/qa/VERIFY.md with the numbers. Say plainly which checks you could not run. A gate that says NOT RUN is not a pass.
