import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Caption} from '@remotion/captions';
import {fitText} from '@remotion/layout-utils';
import {alpha} from './primitives';
import {useStage} from './stage';
import {useTheme} from './theme';
import type {CaptionsConfig, Word} from './types';

const HOLD_MS = 300; // a page stays up this long after its last word, unless the next page starts first
const SENTENCE_END = /[.!?,;:]$/;

export const toCaptions = (words: Word[]): Caption[] =>
  words.map((w) => ({text: w.word, startMs: Math.round(w.start * 1000), endMs: Math.round(w.end * 1000), timestampMs: Math.round(w.start * 1000), confidence: null}));

// Groups words into pages of up to maxWords, breaking early at punctuation or a pause in speech.
export const paginate = (caps: Caption[], maxWords: number): Caption[][] => {
  const pages: Caption[][] = [];
  let page: Caption[] = [];
  caps.forEach((cap, i) => {
    page.push(cap);
    const next = caps[i + 1];
    if (!next || page.length >= maxWords || SENTENCE_END.test(cap.text) || next.startMs - cap.endMs > HOLD_MS) {
      pages.push(page);
      page = [];
    }
  });
  return pages;
};

// 1 to 3 words at a time from edit/words.json, with the word being spoken highlighted. Timing comes only from words.json.
export const CaptionsOverlay: React.FC<{words: Word[]; config: CaptionsConfig}> = ({words, config}) => {
  const {brand} = useTheme();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {safe, unit, type, height} = useStage();
  const maxWords = Math.min(3, Math.max(1, config.maxWords ?? 3));
  const pages = useMemo(() => paginate(toCaptions(words), maxWords), [words, maxWords]);
  const c = brand.colors;
  const weight = 700;
  const padX = 28 * unit;
  const wordPad = 12 * unit;

  // One size for every page, so captions never jump in size. Fitted to the widest page.
  const size = useMemo(() => {
    const widest = pages.reduce((a, p) => {
      const s = p.map((w) => w.text).join(' ');
      return s.length > a.length ? s : a;
    }, '');
    if (!widest) return type.h2;
    const room = safe.width - 2 * padX - 2 * maxWords * wordPad;
    return Math.min(type.h2 + 8 * unit, fitText({text: widest, withinWidth: room, fontFamily: brand.fonts.body, fontWeight: weight}).fontSize);
  }, [pages, safe.width, padX, maxWords, wordPad, type.h2, unit, brand.fonts.body]);

  const ms = (frame / fps) * 1000;
  const index = pages.findIndex((p, i) => {
    const nextStart = pages[i + 1]?.[0].startMs ?? Infinity;
    return ms >= p[0].startMs - 1000 / fps / 2 && ms < Math.min(nextStart, p[p.length - 1].endMs + HOLD_MS);
  });
  if (index < 0) return null;
  const page = pages[index];
  // The current word is the last one that has started, so it stays lit through short gaps.
  const current = page.reduce((acc, w, i) => (ms >= w.startMs - 1000 / fps / 2 ? i : acc), 0);
  const pos = config.position ?? 'bottom';
  const block = pos === 'top' ? {top: safe.top} : pos === 'center' ? {top: height / 2 - size} : {bottom: height - safe.bottom};

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: safe.left, width: safe.width, display: 'flex', justifyContent: 'center', ...block}}>
        <div style={{background: alpha(c.bg, 0.94), borderRadius: 18 * unit, padding: `${12 * unit}px ${padX}px`, display: 'flex', fontFamily: brand.fonts.body, fontWeight: weight, fontSize: size, lineHeight: 1.25, color: c.text, whiteSpace: 'nowrap'}}>
          {page.map((w, i) => (
            <span key={w.startMs} style={i === current ? {background: c.accent, color: c.bg, borderRadius: 10 * unit, padding: `0 ${wordPad}px`} : {padding: `0 ${wordPad}px`}}>{w.text}</span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
