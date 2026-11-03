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

## Audio

Voice only, no music. `public/audio/veron_vo.wav` is `Hale v1.mp3` normalised to -14 LUFS, with peaks limited. The render command needs no extra step for loudness.

All scene timing in `src/timing.ts` follows the words in this recording. A new take means retiming.

## Files

| File | What it holds |
|---|---|
| `src/timing.ts` | Every frame boundary, with comments |
| `src/voCueSheet.ts` | Each voiceover word with its spoken frame, and an evenly spaced frame |
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
