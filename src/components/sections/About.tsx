"use client";

import { useLayoutEffect, useRef } from "react";
import { ABOUT } from "@/lib/content";
import { DistortImage } from "@/components/ui/DistortImage";
import { Reveal, SplitReveal, WordScrub } from "@/components/motion/Reveal";
import { useMotion } from "@/components/motion/MotionProvider";

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const { motionOK, libs } = useMotion();

  // continuous portrait choreography: frame de-scales while the image
  // drifts against it, the whole way through the section
  useLayoutEffect(() => {
    if (!motionOK || !libs || !portraitRef.current) return;
    const frame = portraitRef.current;
    const img = frame.querySelector("img");
    if (!img) return;
    const { gsap } = libs;
    const ctx = gsap.context(() => {
      // deck entrance: the whole section slides up over the archive
      if (sectionRef.current) {
        gsap.fromTo(
          sectionRef.current,
          { y: 110 },
          {
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 98%",
              end: "top 55%",
              scrub: 0.4,
            },
          },
        );
      }
      gsap.fromTo(
        img,
        { yPercent: -9, scale: 1.12 },
        {
          yPercent: 9,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: frame,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.4,
          },
        },
      );
      gsap.fromTo(
        frame,
        { rotate: -2.5, y: 60 },
        {
          rotate: 0,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: frame,
            start: "top 95%",
            end: "top 35%",
            scrub: 0.4,
          },
        },
      );
    });
    return () => ctx.revert();
  }, [motionOK, libs]);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative z-20 rounded-t-[2rem] border-t border-white/10 bg-[#0b0b0b] md:rounded-t-[3rem]"
    >
      <div className="mx-auto max-w-[1400px] px-5 py-28 md:px-10 md:py-40">
        <div className="mb-6 flex items-center gap-4">
          <span className="font-mono text-xs text-white/50">02</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <SplitReveal
          as="h2"
          scrub
          className="text-display max-w-5xl text-[clamp(2.4rem,5.5vw,4.8rem)] text-white"
        >
          {ABOUT.heading}
        </SplitReveal>

        <div className="mt-16 grid gap-14 md:mt-24 md:grid-cols-[minmax(280px,380px)_1fr] md:gap-24">
          <Reveal y={56}>
            <div
              ref={portraitRef}
              className="glass relative aspect-square overflow-hidden rounded-2xl"
            >
              <DistortImage
                slug="portrait"
                alt="Portrait of Asser Essam"
                sizes="(min-width: 768px) 380px, 90vw"
              />
            </div>
          </Reveal>

          <div>
            {/* scroll resolves the words as you read — continuous, reversible */}
            <WordScrub className="mb-7 max-w-2xl text-base leading-relaxed text-white md:text-lg">
              {ABOUT.body[0]}
            </WordScrub>
            <WordScrub className="mb-7 max-w-2xl text-base leading-relaxed text-white md:text-lg">
              {ABOUT.body[1]}
            </WordScrub>

            <Reveal className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4" stagger={0.08}>
              {ABOUT.stats.map((s) => (
                <div key={s.label} className="glass rounded-xl px-5 py-6">
                  <p className="text-display text-2xl text-white md:text-[1.7rem]">{s.value}</p>
                  <p className="mt-2 text-xs leading-snug text-white/46">{s.label}</p>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
