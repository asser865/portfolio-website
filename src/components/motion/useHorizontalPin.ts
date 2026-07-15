"use client";

import { useLayoutEffect, type RefObject } from "react";
import { useMotion } from "./MotionProvider";
import type { MotionLibs } from "./motion-core";

type Options = {
  /** scrub progress 0..1 (counters, progress hairlines) */
  onProgress?: (p: number) => void;
  /** extra triggers that ride the horizontal drive (containerAnimation) */
  onBuild?: (drive: gsap.core.Tween, gsap: MotionLibs["gsap"]) => void;
  /** choreography for the vertical (touch / small) layout */
  onMobile?: (gsap: MotionLibs["gsap"]) => void;
};

/**
 * The signature scroll mechanic, shared by Work / Capabilities /
 * Experience: pin the stage on md+ and convert vertical scroll into
 * horizontal travel through the track. Base layout (no-JS, reduced
 * motion, touch) stays a vertical stack — see .pin-stage/.pin-track CSS.
 */
export function useHorizontalPin(
  stageRef: RefObject<HTMLElement | null>,
  trackRef: RefObject<HTMLElement | null>,
  opts?: Options,
) {
  const { motionOK, libs } = useMotion();

  useLayoutEffect(() => {
    if (!motionOK || !libs || !stageRef.current || !trackRef.current) return;
    const { gsap } = libs;
    const stage = stageRef.current;
    const track = trackRef.current;
    const mm = gsap.matchMedia(stageRef as RefObject<HTMLElement>);

    mm.add("(min-width: 768px)", () => {
      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const drive = gsap.to(track, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: () => "+=" + dist(),
          pin: true,
          scrub: 0.55,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => opts?.onProgress?.(self.progress),
        },
      });
      opts?.onBuild?.(drive, gsap);
    });

    mm.add("(max-width: 767px)", () => {
      opts?.onMobile?.(gsap);
    });

    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motionOK, libs]);
}
