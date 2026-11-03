# V.E.R.O.N. promo, 16:9

A 25-second motion-graphics promo: 1920x1080, 30 fps, 750 frames, one composition (`Promo16x9`). Built with Remotion and TypeScript, using `spring()` and `interpolate()` only.

## Run it

```
npm install
npx remotion studio
```

## Render it

```
npx remotion render Promo16x9 out/VERON_Master_16x9.mp4
```

This command does not normalise loudness. Measure the result before delivery (target -14 LUFS, at or below -1.5 dBTP):

```
ffmpeg -i out/VERON_Master_16x9.mp4 -af ebur128=peak=true -f null -
```

## Add the audio

Put these two files in `public/audio/`. Each plays as soon as its file exists, and the film stays silent until then.

- `veron_vo_25s.wav`: voiceover
- `music_bed.mp3`: music. Its level is set by `MUSIC_VOLUME` in `src/Promo.tsx`, currently a placeholder.

`src/voCueSheet.ts` currently holds words and times from `Hale v1.mp3` (19.88 s), which is not yet wired into the film because it does not fit the 25-second scene timing.

## Files

| File | What it holds |
|---|---|
| `src/timing.ts` | Every frame boundary, with comments |
| `src/voCueSheet.ts` | Each voiceover word with its spoken frame and an evenly spaced frame |
| `src/brand.ts` | Colours, type, locked layout, asset names |
| `src/parts.tsx` | Robots, headline, oversight layer, check mark |
| `src/scenes.tsx` | The four scenes, the logo and the final fade |
| `public/` | Supplied assets only |

## Claims to confirm before publishing

None of these has been confirmed by the client:

- "Qualified engineering oversight"
- "Audit-ready by default."
- "Scale the fleet. Not the overhead."
- The logo's tagline, "Human Intelligence for Robotics Operations"

All UI, including the audit card and the robots, is illustrative and drawn in code.
