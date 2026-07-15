"use client";

import { useRef } from "react";
import { EXPERIENCE } from "@/lib/content";
import { SplitReveal } from "@/components/motion/Reveal";
import { useHorizontalPin } from "@/components/motion/useHorizontalPin";

/**
 * The timeline, laid out the way timelines want to be: horizontal.
 * Scroll drives travel along the years while the progress hairline
 * draws itself. Vertical stack with spine-draw on touch / no-JS.
 */
export function Experience() {
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);

  useHorizontalPin(stageRef, trackRef, {
    onProgress: (p) => {
      if (lineRef.current) lineRef.current.style.transform = `scaleX(${p})`;
    },
    onBuild: (drive, gsap) => {
      trackRef.current!.querySelectorAll<HTMLElement>("[data-exp-inner]").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 44, opacity: 0.3 },
          {
            y: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              containerAnimation: drive,
              start: "left 92%",
              end: "left 50%",
              scrub: true,
            },
          },
        );
      });
    },
    onMobile: (gsap) => {
      trackRef.current!.querySelectorAll<HTMLElement>(".exp-card").forEach((row) => {
        gsap.fromTo(
          row,
          { x: 48, opacity: 0.15 },
          {
            x: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: { trigger: row, start: "top 92%", end: "top 55%", scrub: 0.4 },
          },
        );
      });
    },
  });

  return (
    <section id="experience" className="relative z-10 border-t border-white/10 bg-black/40">
      <div ref={stageRef} className="pin-stage mx-auto w-full px-5 py-24 md:px-10 md:py-0">
        <div className="mx-auto mb-10 w-full max-w-[1400px] md:mb-12">
          <div className="mb-6 flex items-center gap-4">
            <span className="font-mono text-xs text-white/50">04</span>
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
            Experience
          </SplitReveal>
        </div>

        <div ref={trackRef} className="pin-track will-change-transform">
          {EXPERIENCE.map((e) => (
            <div key={`${e.period}-${e.title}`} className="exp-card">
              <div
                data-exp-inner
                className="flex h-full min-h-[300px] flex-col border-t border-white/14 pt-6 md:min-h-[40vh] md:pt-8"
              >
                <span className="text-label">{e.period}</span>
                <h3 className="text-display mt-4 text-xl text-white md:text-2xl">{e.title}</h3>
                <p className="mt-1 text-sm text-white/46">{e.org}</p>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-white/64 md:text-base">
                  {e.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
