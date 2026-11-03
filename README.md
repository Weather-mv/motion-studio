# Motion Studio

Brief + brand + script + audio in, motion-graphics video out, for any video type: explainer, SaaS demo, SaaS promo, storyline, feature launch, case study, data story, social teaser or tutorial. Built on Remotion, Three.js and GSAP, driven by Claude Code.

- [REQUIREMENTS.md](REQUIREMENTS.md): tools and packages, with install commands
- [video-types.md](video-types.md): length, beat skeleton, pacing and retention rules per type
- [scenes.md](scenes.md): every scene and its props

## One-time setup
See [REQUIREMENTS.md](REQUIREMENTS.md). Then open Claude Code in this folder. It reads `CLAUDE.md` automatically.

## Make a video
1. `/new-job my-promo --type=saas-promo --ratio=16x9 --seconds=30`
2. Put assets in `public/jobs/my-promo/`: logo, font TTFs, voiceover, `ref.mp4`.
3. Fill `jobs/my-promo/brief.md`, `brand.json`, `script.md`, `claims.json` and `assets.json`. Set `meta.audio` in `plan.json` to your audio file name.
4. `/intake my-promo` lists what is still missing.
5. `/storyboard my-promo` follows the type's rules, aligns the audio, studies the reference, offers 3 directions and 3 hooks, then writes `plan.json` and the storyboard. Reply by beat number, then say "approved".
6. `/build my-promo` builds what is missing and shows stills of the riskiest beats first.
7. `/qa my-promo` runs every gate and writes `qa/VERIFY.md`.
8. `/notes my-promo f130: logo too small` saves frame-by-frame notes. `/revise my-promo` applies them one scene at a time.
9. `/render my-promo` writes `out/my-promo-final.mp4`.

Preview any time with `npm run studio`, then pick the job. Props are editable in the sidebar. Edits there are live previews and do not save to `plan.json`, because the plans are imported from JSON.

## Commands

| Command | What it does |
|---|---|
| `npm run new -- <job> --type=<type>` | Creates a job from a video type |
| `npm run check -- <job>` | All quality gates. Add `--static` to skip the browser, `--ratio=9x16` to test another ratio |
| `npm run audit -- <job>` | Browser gates only. Writes frames and results to `out/audit/` |
| `npm run render -- <job> --still=<frame>` | One still in `jobs/<job>/qa/`. Add `--ratio=` to test another ratio |
| `npm run render -- <job>` | Full video, picture and sound separately, then muxed |
| `npm run notes -- <job> list` | Shows review notes, grouped by scene |
| `npm run docs` | Regenerates `scenes.md` and `video-types.md` |

## Quality gates

| Gate | Fails when | Blocks? |
|---|---|---|
| Text contrast | Under WCAG AA (4.5:1, or 3:1 for large text), measured against the rendered pixels behind the text, on the frame a beat settles on | Yes |
| Text overflow | `@remotion/layout-utils` measures text wider than its block, or text leaves its panel or the frame | Yes |
| Safe zones | Text or an image is outside the ratio's safe zone | Yes |
| Fonts | Rendered text uses a font not in `brand.json` | Yes |
| fps grid | A beat is off the frame grid, has a gap or overlap, or a transition does not fit | Yes |
| Colour lint | A colour literal is in `src/`, or a hex in `plan.json` is not in `brand.json` | Yes |
| Claims log | A number or claim word on screen or in the voiceover is not logged for that beat | Yes, and unconfirmed claims warn |
| Assets log | A file in `public/jobs/<job>/` has no source and licence | Yes |
| Loudness | The rendered file is off -14 LUFS (by more than 0.5) or above -1.5 dBTP | Yes, once a final file exists |
| Speaking pace | A beat is over the type's syllable limit | Warns only, because the audio may be fixed |

The claims scan matches digits and a short list of claim words. It cannot read meaning, so a person still has to review claims. Jobs made before these logs existed get a warning and a NOT RUN instead of a blocker.

## Add a scene
See the end of [scenes.md](scenes.md). Ask Claude to do this when a script needs something new.
