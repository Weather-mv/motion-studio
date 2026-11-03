# QA record: veron-promo

File checked: out/veron-promo-final.mp4
Score: 9.5 / 10, for the checks that could be run. Checks not run are listed below and are not included in the score.

## Measured on the final file
| Check | Target | Result | Pass |
|---|---|---|---|
| Integrated loudness | -14 LUFS | -14.1 LUFS | Yes |
| True peak | at or below -1.5 dBTP | -1.9 dBFS (ebur128 true peak) | Yes |
| Picture | 1920x1080, 30 fps | 1920x1080, 748 frames | Yes |
| Duration | audio length, 24.92 s | 24.93 s | Yes |
| Audio | delivery rate | AAC, 48 kHz, mono | Yes |
| Frozen picture for 3 s or more | none | none (freezedetect) | Yes |
| `npm run check` | no blockers | no blockers, 1 pace warning on beat 3 (accepted) | Yes |
| `tsc --noEmit` | no errors | no errors | Yes |

## Inspected on frames from the final file
- Cuts: frames either side of all four cuts. Hard cuts at 373/374 and 523/524, blur transitions at 152/153 and 618/619.
- Caption cues: frames 0, 87, 242, 377, 467, 584, 646, 679 and 699 each show the element starting on its cue frame.
- Hook: "10 Robots." starts on frame 0, and the question is on screen from frame 87.
- Text fit: no clipped or overflowing text on the frames checked. Margins were checked against layout values and by eye, not by a pixel scan.

## Beat starts against the audio
Speech onset is where silencedetect (-40 dB) ends a silence.
| Beat | Beat start | Speech onset | Difference |
|---|---|---|---|
| 2 | 5.100 | 5.077 | 0.02 s |
| 3 | 12.467 | 12.470 | under 0.01 s |
| 4 | 17.467 | 17.491 | 0.02 s |
| 5 | 20.633 | 20.711 | 0.08 s, cut slightly before the word |

## Defects found and fixed in QA
1. Loudness was -14.9 LUFS with true peak at -1.3 dBFS. The source is -17.97 LUFS with peaks at -0.75 dBTP, so gain alone could not meet both targets. render.mjs now limits peaks at -7 dB, then normalises.
2. Audio came out at 96 kHz. It is now 48 kHz.
3. Blur transitions showed a dark rim at the frame edge. The picture now scales up slightly during the blur.
4. Captions first appeared one frame after their word. They now start on the cue frame.

## Not checked
- Audio by ear. Limiting took up to about 6 dB off the loudest peaks, so the voice should be listened to.
- Motion in real time. Only sampled frames were reviewed, so movement and caption feel are unconfirmed.
- Word timing by ear. Cue times come from Whisper word timestamps, and only the beat starts were cross-checked against the waveform.
- Playback on target platforms. The video is tagged yuvj420p, full range, bt470bg, which has not been tested in players or after social upload.

## Claims needing client confirmation
Listed in brief.md, including the logo tagline "Human Intelligence for Robotics Operations". None have been confirmed.
