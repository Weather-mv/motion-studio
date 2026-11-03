import React from 'react';

export const COLOR = {
  periwinkle: '#B4C0DE',
  lavender: '#B5B2D6',
  ink: '#0A0F2C', // headlines, primary text
  slate: '#3A4A63', // body text, footer
  cobalt: '#1F3BFF', // highlight, timeline, oversight layer
  violet: '#3B1AA8', // subheading
  orange: '#FF8A1F', // one soft glow in scene 1 only
  white: '#FFFFFF', // check marks and glass tint
};

export const ASSET = {
  logo: 'Logo png.png',
  background: 'Dreamy Lavender Gradient Glow.png', // one file per set, as the guideline asks
  frosted: 'Ethereal Frosted Glass Panels.png',
  regular: 'Roboto/Roboto-Regular.ttf',
  bold: 'Roboto/Roboto-Bold.ttf',
  voiceover: 'audio/veron_vo.wav', // Hale v1.mp3, normalised to -14 LUFS; see README
};

export const FONT = 'Roboto';

// Locked layout, in pixels.
export const LAYOUT = {
  margin: 96,
  // The brief says 240 px wide, but the logo file is square, so 240 px would run into the headline at y 220.
  // 140 px ends exactly at y 220 and keeps the logo uncropped.
  logo: {x: 96, y: 80, width: 140},
  endCard: {logo: 420, logoTop: 170, buttonTop: 630, buttonHeight: 104},
  logoOnLayer: {width: 240},
  headline: {x: 96, y: 220, width: 1000},
  subheadingGap: 32,
  footerY: 960,
  graphicLeft: 1152, // the right 40% of the frame
  fleet: {x: 96, y: 480, tile: 124, gap: 16, columns: 5},
  layer: {top: 150, height: 780},
};

export const TYPE: Record<string, React.CSSProperties> = {
  headline: {fontFamily: FONT, fontWeight: 700, fontSize: 100, lineHeight: 1, letterSpacing: '-0.02em'},
  subheading: {fontFamily: FONT, fontWeight: 700, fontSize: 48, color: COLOR.violet},
  footer: {fontFamily: FONT, fontWeight: 400, fontSize: 28, color: COLOR.slate},
};

export const withAlpha = (hex: string, a: number) => hex + Math.round(a * 255).toString(16).padStart(2, '0');

export const glass = (opacity = 0.45): React.CSSProperties => ({
  background: withAlpha(COLOR.white, opacity),
  backdropFilter: 'blur(18px)',
  border: `1px solid ${withAlpha(COLOR.white, Math.min(1, opacity + 0.25))}`,
  boxShadow: `0 16px 48px ${withAlpha(COLOR.ink, 0.08)}`, // soft depth only
});
