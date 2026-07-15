"use client";

import { useEffect, useRef } from "react";
import { useMotion } from "./MotionProvider";
import { motionBus } from "@/lib/motion-bus";

/**
 * Kinetic type strip. Runs as a plain CSS loop pre-boot; once the motion
 * runtime is live, GSAP owns it and scroll velocity drives its speed —
 * flick the page and the strip whips with you. Decorative only.
 */
export function Marquee({ text, className }: { text: string; className?: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { motionOK, libs } = useMotion();

  useEffect(() => {
    if (!motionOK || !libs || !trackRef.current) return;
    const { gsap } = libs;
    const track = trackRef.current;
    track.classList.remove("animate-marquee"); // hand over from CSS to GSAP
    const loop = gsap.to(track, { xPercent: -50, ease: "none", duration: 24, repeat: -1 });
    const tick = () => {
      // scroll speed whips the strip along; eases back to cruise when idle
      const v = Math.min(Math.abs(motionBus.velocity) * 0.055, 3.4);
      loop.timeScale(gsap.utils.interpolate(loop.timeScale(), 1 + v, 0.08));
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      loop.kill();
    };
  }, [motionOK, libs]);

  const row = Array(6).fill(text).join("  —  ");
  return (
    <div
      aria-hidden
      className={`pointer-events-none overflow-hidden border-y border-white/10 py-4 md:py-6 ${className ?? ""}`}
    >
      <div ref={trackRef} className="animate-marquee flex w-max whitespace-nowrap will-change-transform">
        <span className="text-display pr-8 text-2xl tracking-tight text-white/25 md:text-4xl">
          {row}&nbsp;&nbsp;—&nbsp;&nbsp;
        </span>
        <span className="text-display pr-8 text-2xl tracking-tight text-white/25 md:text-4xl">
          {row}&nbsp;&nbsp;—&nbsp;&nbsp;
        </span>
      </div>
    </div>
  );
}
