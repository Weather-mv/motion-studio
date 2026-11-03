import {useEffect, useLayoutEffect, useRef} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import gsap from 'gsap';

// Builds a paused GSAP timeline once, then seeks it to the current frame,
// so GSAP never runs on its own clock and renders are deterministic.
export function useGsapTimeline(build: (tl: gsap.core.Timeline, root: HTMLElement) => void) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({paused: true});
      build(tl, ref.current as HTMLElement);
      tl.seek(frame / fps, false);
      tlRef.current = tl;
    }, ref);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    tlRef.current?.seek(frame / fps, false);
  }, [frame, fps]);

  return ref;
}
