import React from 'react';
import type {IconName} from '../scenes/schemas';

// Generic line icons drawn in code on a 24 px grid, so no icon pack or licence is involved.
const ICONS: Record<IconName, React.ReactNode> = {
  check: <path d="M5 13l4 4L19 7" />,
  cross: <path d="M6 6l12 12M18 6L6 18" />,
  shield: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />,
  chart: <path d="M4 20V11M10 20V4M16 20v-7M2 20h20" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2 20c0-3.5 3-6 7-6s7 2.500 7 6M16 4.800a3.500 3.500 0 010 6.400M18 14.300c2.400.7 4 2.800 4 5.700" /></>,
  gear: <><circle cx="12" cy="12" r="3.500" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l2.800 2.800M16.200 16.200 19 19M19 5l-2.800 2.800M7.800 16.200 5 19" /></>,
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3.500 3 3.500 15 0 18M12 3c-3.500 3-3.500 15 0 18" /></>,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></>,
  doc: <path d="M6 3h8l4 4v14H6zM14 3v4h4M9 13h6M9 17h6" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-5-5" /></>,
  star: <path d="M12 3l2.800 5.800 6.200.9-4.500 4.400 1.100 6.300L12 17.400l-5.600 3 1.100-6.300L3 9.700l6.200-.9z" />,
  bell: <path d="M6 16V11a6 6 0 0112 0v5l2 2H4zM10 21h4" />,
  link: <path d="M10 14a4 4 0 005.700 0l3-3a4 4 0 00-5.700-5.700l-1 1M14 10a4 4 0 00-5.700 0l-3 3a4 4 0 005.700 5.700l1-1" />,
};

export const Icon: React.FC<{name: IconName; size: number; color: string; strokeWidth?: number}> = ({name, size, color, strokeWidth = 2}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{flexShrink: 0}}>
    {ICONS[name]}
  </svg>
);
