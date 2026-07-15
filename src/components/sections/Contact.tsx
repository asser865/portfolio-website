"use client";

import { useLayoutEffect, useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { SITE, asset } from "@/lib/site";
import { CONTACT } from "@/lib/content";
import { Reveal, SplitReveal } from "@/components/motion/Reveal";
import { Magnetic } from "@/components/ui/Magnetic";
import { CairoTime } from "@/components/chrome/CairoTime";
import { useMotion } from "@/components/motion/MotionProvider";

const HeroCanvas = dynamic(() => import("@/components/hero/HeroCanvas"), { ssr: false });

const hasWebGL = () => {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
};

export function Contact() {
  const rootRef = useRef<HTMLElement>(null);
  const { motionOK, libs } = useMotion();
  const [liquid, setLiquid] = useState(false);

  // the liquid field returns for the closing scene (autonomous drift)
  useEffect(() => {
    if (!motionOK || !libs) return;
    if (!hasWebGL()) return;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    if (nav.connection?.saveData) return;
    setLiquid(true);
  }, [motionOK, libs]);

  // approach choreography: light blooms, the email scales into place
  useLayoutEffect(() => {
    if (!motionOK || !libs || !rootRef.current) return;
    const { gsap } = libs;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-contact-light]",
        { scale: 0.4, opacity: 0.2 },
        {
          scale: 1.35,
          opacity: 1,
          ease: "none",
          transformOrigin: "50% 100%",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top 90%",
            end: "bottom bottom",
            scrub: 0.5,
          },
        },
      );
      gsap.fromTo(
        "[data-contact-mail]",
        { scale: 0.82, y: 70, opacity: 0.3 },
        {
          scale: 1,
          y: 0,
          opacity: 1,
          ease: "none",
          transformOrigin: "0% 100%",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top 75%",
            end: "top 18%",
            scrub: 0.45,
          },
        },
      );
    }, rootRef);
    return () => ctx.revert();
  }, [motionOK, libs]);

  return (
    <section
      id="contact"
      ref={rootRef}
      className="relative z-10 flex min-h-[100svh] flex-col justify-center overflow-hidden"
    >
      {/* the liquid field, one last time — masked so it rises out of the dark */}
      {liquid ? (
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{
            maskImage: "linear-gradient(180deg, transparent 0%, #000 45%)",
            WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 45%)",
          }}
        >
          <HeroCanvas autonomous className="h-full w-full" />
        </div>
      ) : null}
      <div
        aria-hidden
        data-contact-light
        className="pointer-events-none absolute inset-0 will-change-transform"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 88%, rgba(255,255,255,0.09), transparent 65%)",
        }}
      />
      <div className="relative mx-auto w-full max-w-[1400px] px-5 py-28 md:px-10">
        <div className="mb-6 flex items-center gap-4">
          <span className="font-mono text-xs text-white/50">05</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <SplitReveal
          as="h2"
          scrub
          className="text-display max-w-5xl text-[clamp(2.8rem,7vw,6.5rem)] text-white"
        >
          {CONTACT.heading}
        </SplitReveal>

        <Reveal className="mt-12 md:mt-16" stagger={0.12}>
          <div className="mb-8 flex items-center gap-3">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-white" />
            </span>
            <span className="text-label !text-white">
              Open to work — Cairo, Egypt · <CairoTime /> local
            </span>
          </div>
          <p className="max-w-md text-base text-white/64 md:text-lg">{CONTACT.sub}</p>

          <div className="mt-12" data-contact-mail>
            <Magnetic strength={0.15}>
              <a
                href={`mailto:${SITE.email}`}
                data-cursor
                className="group text-display relative inline-block text-[clamp(1.6rem,5.4vw,5rem)] !leading-[1.1] text-white"
              >
                {SITE.email}
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 h-[2px] w-full origin-left scale-x-0 bg-white transition-transform duration-700 ease-out-expo group-hover:scale-x-100"
                />
              </a>
            </Magnetic>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Magnetic strength={0.25}>
              <a
                href={`mailto:${SITE.email}`}
                className="text-label inline-flex rounded-full bg-white px-7 py-4 !text-black transition-transform duration-300 hover:scale-[1.04]"
              >
                Email me
              </a>
            </Magnetic>
            <Magnetic strength={0.25}>
              <a
                href={asset("/AsserEssam_CV.pdf")}
                target="_blank"
                rel="noopener noreferrer"
                className="glass text-label inline-flex rounded-full px-7 py-4 !text-white transition-colors hover:bg-white hover:!text-black"
              >
                Download résumé
              </a>
            </Magnetic>
            <a
              href={SITE.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-label px-3 !text-white/64 transition-colors hover:!text-white"
            >
              GitHub ↗
            </a>
            <a
              href={SITE.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-label px-3 !text-white/64 transition-colors hover:!text-white"
            >
              LinkedIn ↗
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
