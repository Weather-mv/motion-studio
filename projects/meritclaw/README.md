# Meritclaw Link promo (1:1 and 9:16)

18-second SaaS promo, 540 frames at 30 fps, two compositions from one codebase: `MeritclawSquare` (1080x1080) and `MeritclawVertical` (1080x1920). Remotion, TypeScript, `@remotion/google-fonts` (Roboto). The 3D look is pure CSS and React: stacked-layer extrusions, floor shadows, glow pools and a tilted camera plane. No images at all, since no logo was supplied.

## Run it

```
npm install
npm run studio
```

Stills: `npx remotion still src/index.ts MeritclawSquare out/sq.png --frame=350`

Renders (not run yet, waiting on approval): `npm run render:square`, `npm run render:vertical`

Audio: `public/` is git-ignored in this repo (`projects/*/public/`), so the music and SFX are not committed. Run `npm run audio` (numpy and ffmpeg) after cloning, before Studio or any render. Without it the audio files are missing and a render fails.

## Files

| File | What it holds |
|---|---|
| `src/config.ts` | All colours, all text, all frame timings (each commented in frames and seconds), the SFX cue list |
| `src/layout.ts` | `useLayout()`: reads `useVideoConfig()`, stacks vertically in 9:16 (15% top/bottom safe zone, 80 px headlines), centred cluster in 1:1 (60 px) |
| `src/motion.ts` | Spring presets (snap, pop, soft, heavy), easings, `ramp()`, impact shake |
| `src/solids.tsx` | `Extrude`, `FloorShadow`, `GlowPool`, `Ring`, `Billboard`, cursor, check mark, link icon |
| `src/objects.tsx` | Input-to-capsule, LMS window, status bar, Integrity Report, logo, CTA pill |
| `src/Scene.tsx` | Camera, floor, headlines, end card wrapped in `<a href="https://meritclaw.com">`, audio |
| `tools/gen_audio.py` | Synthesises the music bed and SFX (original, no samples) |

## Skills used

Installed from the three repos you gave and used as guidance, not as pipelines. Their own scripts render canvas to MP4 and were not run.

- pro-motion (jack-reson8): audio first, music map on a beat grid, one protagonist (the link) that carries through every scene, objects perform on events.
- lemo-opuscar (lemomo-ai): the isometric style guide, for three-tone faces, squash on landing, solids arriving by motion rather than alpha.
- launch-video (charlie947/motion-graphics-skills): beat structure and the CTA held on screen for 3 s or more (frames 450-540 is 3 s). There is no skill called "promotion" in that repo. I used this one for that role.

## Audio

150 BPM, so a beat is 12 frames. Music map: 0-96 drive in, 96-240 full groove, 240-384 tension with 16th hats, 384-528 riser and snare roll, final hit on frame 528, tail to 540. SFX are placed from `config.ts` and each is logged with its frame.

## Assumptions to confirm

- **Logo:** none supplied. A code-drawn placeholder mark is shown. Put the real file in `public/logo.png` and set `logoFile` in `config.ts`.
- **Music:** `fast_tech_bed.mp3` is synthesised here. It is a functional bed, not a produced track. Swap in a licensed track if you want one, then check the beat alignment.
- **Illustrative UI:** the URL, the quiz, the avatar, the "45:00" session clock and the report rows are illustrative. No numbers, scores or features are claimed beyond your copy ("verified", "monitored").
- **Tagline contrast:** Vivid Blue #0A5CFF on Ink #0A0F2C is about 3.3:1. Fine for large text, below 4.5:1 for small text on a phone.
- **The `<a>` link:** it is in the DOM for Studio and web embeds. An MP4 has no clickable area, so the URL has to go in the post caption too.

## Not verified

- No full render has been made, so motion, SFX sync and the mux have not been checked in a rendered video.
- Only stills were checked: frames 30, 70, 112, 160, 176, 336, 354, 380, 500 (1:1) and 112, 176, 354, 500 (9:16), plus re-checks of the fixes. Frames in between and the vertical layout of scene 2 mid-drop were not looked at.
- Loudness of the final mix is unmeasured. The music alone measures -16.9 LUFS integrated, -7.8 dBFS peak.
