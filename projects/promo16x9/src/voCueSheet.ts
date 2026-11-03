// Voiceover word cues, from "jobs/compliance and audit - veron video/Hale v1.mp3" (19.88 s, 50 words).
// Words and times come from a Whisper transcript and have not been checked by ear.
// This recording is the film's voiceover, and timing.ts is built on these frames. A new take means retiming both.
import {TOTAL_FRAMES} from './timing';

// [word, frame where the word starts in the audio, at 30 fps]
const WORDS: [string, number][] = [
  ["You", 0],
  ["added", 7],
  ["more", 15],
  ["robots.", 25],
  ["Now", 63],
  ["you're", 67],
  ["hiring", 73],
  ["more", 82],
  ["people", 89],
  ["just", 101],
  ["to", 124],
  ["watch", 130],
  ["them.", 140],
  ["Veron", 164],
  ["takes", 175],
  ["over", 182],
  ["the", 190],
  ["oversight", 194],
  ["workflow", 207],
  ["with", 223],
  ["qualified", 235],
  ["engineers", 248],
  ["behind", 265],
  ["it.", 277],
  ["Every", 297],
  ["robot", 305],
  ["identified,", 314],
  ["every", 346],
  ["action", 352],
  ["recorded.", 364],
  ["So", 394],
  ["when", 397],
  ["the", 401],
  ["audit", 404],
  ["comes,", 410],
  ["your", 430],
  ["records", 434],
  ["are", 445],
  ["already", 452],
  ["there.", 464],
  ["Scale", 484],
  ["your", 494],
  ["fleet,", 500],
  ["not", 521],
  ["your", 526],
  ["overhead.", 532],
  ["Book", 557],
  ["a", 560],
  ["Veron", 565],
  ["demo.", 574],
];

export type VoCue = {
  index: number;
  word: string;
  spokenFrame: number; // where the word is actually spoken in this recording
  evenFrame: number; // the approximate frame the brief asked for: words spaced evenly across all 750 frames
};

export const voCueSheet: VoCue[] = WORDS.map(([word, spokenFrame], index) => ({
  index,
  word,
  spokenFrame,
  evenFrame: Math.round((index / WORDS.length) * TOTAL_FRAMES),
}));
