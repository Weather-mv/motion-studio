// Approximate frame for each voiceover word: 51 words spaced evenly across the 750-frame film.
//
// NOT FILLED IN YET. The 51-word voiceover script was not supplied, so `word` is null rather than invented.
// Paste the script's words into VO_WORDS, in order. These frames are even spacing, not real speech timing.
// Once public/audio/veron_vo_25s.wav exists, align it to get real word times, then replace this file.
import {TOTAL_FRAMES} from './timing';

export const VO_WORD_COUNT = 51;
export const VO_WORDS: string[] = [];

export type VoCue = {index: number; word: string | null; frame: number};

export const voCueSheet: VoCue[] = Array.from({length: VO_WORD_COUNT}, (_, index) => ({
  index,
  word: VO_WORDS[index] ?? null,
  frame: Math.round((index / VO_WORD_COUNT) * TOTAL_FRAMES),
}));
