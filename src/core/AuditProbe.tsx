import React, {useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import {measureText} from '@remotion/layout-utils';

// Used only by tools/audit.mjs. "probe" reports every piece of text and image on the frame, as the browser laid it out.
// "hide-text" makes text transparent, so the tool can read the real pixels behind it for the contrast check.
export type AuditMode = 'probe' | 'hide-text';

const parseAlpha = (color: string) => {
  const m = /rgba?\(([^)]+)\)/.exec(color);
  if (!m) return color === 'transparent' || color === 'none' ? 0 : 1;
  const parts = m[1].split(/[ ,/]+/).filter(Boolean);
  return parts.length > 3 ? Number(parts[3]) : 1;
};
const hasBox = (cs: CSSStyleDeclaration) => parseAlpha(cs.backgroundColor) > 0 || cs.backgroundImage !== 'none' || parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderLeftWidth) > 0;
const box = (r: DOMRect) => ({x: r.x, y: r.y, w: r.width, h: r.height});

const collect = (root: Element) => {
  const texts: any[] = [];
  const frameW = window.innerWidth;
  const frameH = window.innerHeight;
  const isFullFrame = (r: DOMRect) => r.width >= frameW * 0.98 && r.height >= frameH * 0.98;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const raw = node.textContent ?? '';
    const text = raw.trim();
    const parent = node.parentElement;
    if (!text || !parent || ['STYLE', 'SCRIPT', 'TITLE'].includes(parent.tagName) || parent.closest('[data-audit="skip"]')) continue;
    const cs = getComputedStyle(parent);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    let opacity = 1;
    for (let el: Element | null = parent; el; el = el.parentElement) opacity *= Number(getComputedStyle(el).opacity);
    if (opacity < 0.02) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    const rects = Array.from(range.getClientRects()).filter((r) => r.width > 0 && r.height > 0);
    if (!rects.length) continue;
    const isSvg = parent instanceof SVGElement;
    const fontSize = parseFloat(cs.fontSize);
    const issues: string[] = [];
    // Text measured with @remotion/layout-utils against the block that holds it.
    if (!isSvg) {
      let block: Element = parent;
      while (getComputedStyle(block).display === 'inline' && block.parentElement) block = block.parentElement;
      const bs = getComputedStyle(block);
      const room = block.clientWidth - parseFloat(bs.paddingLeft) - parseFloat(bs.paddingRight);
      const noWrap = cs.whiteSpace === 'nowrap' || cs.whiteSpace === 'pre';
      const pieces = noWrap ? [text] : text.split(/\s+/);
      const widest = Math.max(...pieces.map((t) => measureText({text: t, fontFamily: cs.fontFamily, fontSize, fontWeight: cs.fontWeight, letterSpacing: cs.letterSpacing, validateFontIsLoaded: false}).width));
      if (room > 0 && widest > room + 1) issues.push(`${noWrap ? 'line' : 'longest word'} is ${Math.round(widest)} px wide in a ${Math.round(room)} px block`);
    }
    // Text escaping the panel it sits on, or cut by a clipping parent.
    const slackY = fontSize * 0.15;
    for (let el: Element | null = parent; el && el !== root; el = el.parentElement) {
      const es = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const clips = es.overflowX === 'hidden' || es.overflowY === 'hidden';
      if (isFullFrame(r) || !(clips || hasBox(es))) continue;
      const out = rects.some((t) => t.left < r.left - 2 || t.right > r.right + 2 || t.top < r.top - slackY || t.bottom > r.bottom + slackY);
      if (out) issues.push(clips ? 'cut off by a clipping parent' : 'spills out of its panel');
      break;
    }
    texts.push({
      text,
      rects: rects.map(box),
      color: isSvg ? cs.fill : cs.color,
      opacity,
      family: cs.fontFamily,
      size: fontSize,
      weight: Number(cs.fontWeight),
      parentKey: texts.length,
      issues,
    });
  }
  const images = Array.from(root.querySelectorAll('img'))
    .filter((img) => !img.closest('[data-audit="skip"]'))
    .map((img) => ({src: img.getAttribute('src'), rect: box(img.getBoundingClientRect()), opacity: Number(getComputedStyle(img).opacity)}));
  return {frameW, frameH, texts, images};
};

export const AuditProbe: React.FC<{mode: AuditMode; ready: boolean}> = ({mode, ready}) => {
  const [handle] = useState(() => delayRender('Audit probe'));
  useEffect(() => {
    if (!ready) return;
    // Let scene effects, including GSAP seeks, finish first.
    const id = setTimeout(() => {
      try {
        if (mode === 'probe') {
          const root = document.querySelector('[data-job-root]');
          if (root) console.log('__AUDIT__' + JSON.stringify(collect(root)));
        }
      } finally {
        continueRender(handle);
      }
    }, 50);
    return () => clearTimeout(id);
  }, [ready, mode, handle]);
  return mode === 'hide-text' ? (
    <style>{'[data-job-root] *{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important}[data-job-root] svg text{fill:transparent!important;stroke:transparent!important}'}</style>
  ) : null;
};
