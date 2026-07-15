"use client";

import { useRef } from "react";
import { CAPABILITIES } from "@/lib/content";
import { SplitReveal } from "@/components/motion/Reveal";
import { useHorizontalPin } from "@/components/motion/useHorizontalPin";

/**
 * Pinned horizontal statement cards — vertical scroll drives lateral
 * travel; base layout stays a vertical stack for touch / no-JS.
 */
export function Capabilities() {
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);

  useHorizontalPin(stageRef, trackRef, {
    onProgress: (p) => {
      if (lineRef.current) lineRef.current.style.transform = `scaleX(${p})`;
    },
    onBuild: (drive, gsap) => {
      trackRef.current!.querySelectorAll<HTMLElement>("[data-cap-inner]").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 56, opacity: 0.35 },
          {
            y: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              containerAnimation: drive,
              start: "left 90%",
              end: "left 45%",
              scrub: true,
            },
          },
        );
      });
    },
    onMobile: (gsap) => {
      trackRef.current!.querySelectorAll<HTMLElement>(".cap-card").forEach((row, i) => {
        gsap.fromTo(
          row,
          { x: i % 2 === 0 ? -70 : 70, opacity: 0.2 },
          {
            x: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: { trigger: row, start: "top 95%", end: "top 48%", scrub: 0.4 },
          },
        );
      });
    },
  });

  return (
    <section className="relative z-10">
      <div ref={stageRef} className="pin-stage mx-auto w-full px-5 py-24 md:px-10 md:py-0">
        <div className="mx-auto mb-10 w-full max-w-[1400px] md:mb-12">
          <div className="mb-6 flex items-center gap-4">
            <span className="font-mono text-xs text-white/50">03</span>
            <span className="relative h-px flex-1 overflow-hidden bg-white/10">
              <span
                ref={lineRef}
                className="absolute inset-0 origin-left scale-x-0 bg-white/40"
              />
            </span>
          </div>
          <SplitReveal
            as="h2"
            scrub
            className="text-display text-[clamp(2.6rem,6.5vw,5.5rem)] text-white"
          >
            What I do
          </SplitReveal>
        </div>

        <div ref={trackRef} className="pin-track will-change-transform">
          {CAPABILITIES.map((c) => (
            <div key={c.index} className="cap-card">
              <div
                data-cap-inner
                className="glass flex h-full min-h-[340px] flex-col justify-between rounded-2xl p-8 md:min-h-[46vh] md:p-12"
              >
                <span className="font-mono text-xs text-white/50">{c.index}</span>
                <div>
                  <h3 className="text-display text-3xl text-white md:text-[3.2rem]">{c.title}</h3>
                  <p className="mt-5 max-w-md text-base leading-relaxed text-white/64">
                    {c.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
