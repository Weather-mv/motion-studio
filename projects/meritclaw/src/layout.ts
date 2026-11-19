// Responsive layout. Both compositions are 1080 px wide, so one pixel unit works in both.
// 1:1  = a centred cluster. 9:16 = the same objects stacked vertically inside a 15% top and bottom safe zone.
import {useVideoConfig} from 'remotion';
import {safe, type} from './config';

// Camera for the isometric look. Objects live on a floor plane that is tilted and spun.
export const CAM = {tiltDeg: 54, spinDeg: 24, perspective: 3600} as const;
const rad = (d: number) => (d * Math.PI) / 180;

// Where a point on the floor must be so that it appears at screen offset (sx, sy) from the stage centre.
export const toWorld = (sx: number, sy: number, lift = 0) => {
  const T = rad(CAM.tiltDeg);
  const S = rad(CAM.spinDeg);
  const yr = (sy + lift * Math.sin(T)) / Math.cos(T);
  return {x: sx * Math.cos(S) - yr * Math.sin(S), y: sx * Math.sin(S) + yr * Math.cos(S)};
};

export const useLayout = () => {
  const {width, height} = useVideoConfig();
  const isV = height > width;
  const sz = isV ? 'vertical' : 'square';
  const cx = width / 2;
  const cy = height / 2;
  // Screen anchors in px from the top-left, then converted to offsets from the stage centre.
  const A = isV
    ? {
        input: [540, 1010], lms: [540, 1150], lmsBack: [540, 1090], status: [540, 720], doc: [540, 1170],
        logo: [540, 620], title: [540, 880], tagline: [540, 985], cta: [540, 1290],
      }
    : {
        input: [540, 660], lms: [540, 690], lmsBack: [540, 700], status: [540, 345], doc: [540, 700],
        logo: [540, 280], title: [540, 445], tagline: [540, 530], cta: [540, 770],
      };
  const at = (k: keyof typeof A, lift = 0) => toWorld(A[k][0] - cx, A[k][1] - cy, lift);
  return {
    width,
    height,
    isV,
    cx,
    cy,
    safeTop: height * safe[sz].top,
    safeBottom: height * safe[sz].bottom,
    headlineSize: type.headlineSize[sz],
    subSize: type.subSize[sz],
    screen: A,
    at,
    // Object sizes in floor px. The window is taller in 9:16 because there is more vertical room.
    size: {
      field: {w: 820, h: 150},
      capsule: {w: 500, h: 130},
      lms: {w: 760, h: isV ? 640 : 520},
      status: {w: 640, h: 110},
      doc: isV ? {w: 460, h: 620} : {w: 420, h: 560},
      cta: {w: 560, h: 140},
    },
  };
};
