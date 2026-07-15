"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { HERO } from "@/lib/content";
import { useMotion } from "@/components/motion/MotionProvider";

const HeroCanvas = dynamic(() => import("./HeroCanvas"), { ssr: false });

const hasWebGL = () => {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
};

/**
 * Entrance is pure CSS (.hero-anim) — the headline and statement are
 * LCP candidates and must paint at first render, not after hydration.
 * JS owns only the shader canvas and the scroll-out scrub.
 */
export function Hero() {
  const { motionOK, libs } = useMotion();
  const rootRef = useRef<HTMLElement>(null);
  const [canvasMode, setCanvasMode] = useState<"off" | "pointer" | "autonomous">("off");

  // Decide the shader tier after paint — never block LCP on it.
  useEffect(() => {
    if (!motionOK) return; // reduced motion → static fallback stays
    if (!hasWebGL()) return;
    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
    };
    if (nav.connection?.saveData) return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (coarse && (nav.deviceMemory ?? 8) < 4) return; // low-power phones keep the static field
    const mode = coarse ? "autonomous" : "pointer";
    if (window.location.hash.includes("shot")) {
      setCanvasMode(mode); // capture mode: mount immediately
      return;
    }
    // Mount on first engagement, not on a timer: the canvas is a
    // full-viewport paint, so mounting it "whenever" makes it the
    // page's LCP. Engaged visitors trigger this within milliseconds.
    const arm = () => setCanvasMode(mode);
    const opts = { once: true, passive: true } as AddEventListenerOptions;
    window.addEventListener("pointermove", arm, opts);
    window.addEventListener("touchstart", arm, opts);
    window.addEventListener("scroll", arm, opts);
    window.addEventListener("keydown", arm, opts);
    return () => {
      window.removeEventListener("pointermove", arm);
      window.removeEventListener("touchstart", arm);
      window.removeEventListener("scroll", arm);
      window.removeEventListener("keydown", arm);
    };
  }, [motionOK]);

  // Capture modes + the pinned scroll scene.
  useEffect(() => {
    if (window.location.hash.includes("shot")) document.body.classList.add("shot-capture");
    if (window.location.hash.includes("og")) document.body.classList.add("og-capture");
    if (!motionOK || !libs || !rootRef.current) return;
    const { gsap } = libs;
    let bus: { heroProgress: number } | null = null;
    void import("@/lib/motion-bus").then((m) => (bus = m.motionBus));

    const mm = gsap.matchMedia(rootRef);

    // Desktop: pin the hero for an extra ~1.7 viewports — scroll tears the
    // name apart, zooms it through the lens, and feeds the shader's dilation.
    // The long runway + soft scrub keep the scene unhurried under fast flicks.
    mm.add("(min-width: 768px)", () => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: "+=170%",
          pin: true,
          scrub: 0.75,
          anticipatePin: 1,
          onUpdate: (self) => {
            if (bus) bus.heroProgress = self.progress;
          },
        },
      });
      tl.to("[data-hero-cue]", { opacity: 0, duration: 0.12 }, 0)
        .to("[data-hero-l1]", { xPercent: -17 }, 0)
        .to("[data-hero-l2]", { xPercent: 13 }, 0)
        .to("[data-hero-title]", { scale: 1.16, transformOrigin: "50% 90%" }, 0)
        .to("[data-hero-label]", { yPercent: -140, opacity: 0 }, 0)
        .to("[data-og-hide]", { yPercent: 55, opacity: 0 }, 0.05)
        .to("[data-hero-canvas]", { scale: 1.07 }, 0);
    });

    // Touch/small: no pin — a lighter continuous drift + sink.
    mm.add("(max-width: 767px)", () => {
      const st = {
        trigger: rootRef.current,
        start: "top top",
        end: "bottom 30%",
        scrub: 0.65,
        onUpdate: (self: { progress: number }) => {
          if (bus) bus.heroProgress = self.progress * 0.7;
        },
      };
      gsap.to("[data-hero-l1]", { xPercent: -7, ease: "none", scrollTrigger: st });
      gsap.to("[data-hero-l2]", { xPercent: 6, ease: "none", scrollTrigger: { ...st } });
      gsap.to("[data-hero-inner]", {
        opacity: 0.25,
        ease: "none",
        scrollTrigger: { ...st },
      });
      gsap.to("[data-hero-cue]", { opacity: 0, ease: "none", scrollTrigger: { ...st } });
    });

    return () => mm.revert();
  }, [motionOK, libs]);

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden"
      aria-label="Introduction"
    >
      {/* Shader layer / static fallback */}
      <div data-hero-canvas className="absolute inset-0">
        {canvasMode !== "off" ? (
          <HeroCanvas autonomous={canvasMode === "autonomous"} className="h-full w-full" />
        ) : (
          <div
            aria-hidden
            className="h-full w-full"
            style={{
              background:
                "radial-gradient(90% 70% at 68% 32%, rgba(255,255,255,0.075), transparent 60%), radial-gradient(70% 60% at 22% 78%, rgba(255,255,255,0.05), transparent 65%)",
            }}
          />
        )}
        {/* seat the type: darken the lower third over the canvas */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
      </div>

      <div
        data-hero-inner
        className="relative z-10 mx-auto w-full max-w-[1400px] px-5 pt-32 pb-14 md:px-10 md:pb-20"
      >
        <div data-hero-label className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-3 md:mb-12">
          <p
            className="hero-anim text-label"
            style={{ "--rise-delay": "0.1s" } as React.CSSProperties}
          >
            {HERO.label}
          </p>
          <span
            className="hero-anim glass inline-flex items-center gap-2.5 rounded-full px-3.5 py-1.5"
            style={{ "--rise-delay": "0.22s" } as React.CSSProperties}
          >
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-white" />
            </span>
            <span className="text-label !text-white">Open to work</span>
          </span>
        </div>

        <h1 data-hero-title className="text-display text-[clamp(4.2rem,15.5vw,15rem)] text-white">
          <span
            data-hero-l1
            className="hero-anim block will-change-transform"
            style={{ "--rise-delay": "0.18s" } as React.CSSProperties}
          >
            Asser
          </span>
          <span
            data-hero-l2
            className="hero-anim block -mt-[0.06em] will-change-transform"
            style={{ "--rise-delay": "0.28s" } as React.CSSProperties}
          >
            Essam
          </span>
        </h1>

        <div
          data-og-hide
          className="mt-10 flex flex-col gap-8 md:mt-14 md:flex-row md:items-end md:justify-between"
        >
          {/* Static by design: this is the LCP element — any animation
              (even opacity-safe) re-anchors simulated LCP after the JS chain. */}
          <p className="max-w-md text-base leading-relaxed text-white/64 md:text-lg">
            {HERO.statement}
          </p>
          <a
            href={HERO.cta.href}
            className="hero-anim glass group inline-flex w-fit shrink-0 items-center gap-3 rounded-full px-7 py-4"
            style={{ "--rise-delay": "0.55s" } as React.CSSProperties}
          >
            <span className="text-label !text-white">{HERO.cta.label}</span>
            <span
              aria-hidden
              className="inline-block transition-transform duration-500 ease-out-expo group-hover:translate-y-1.5"
            >
              ↓
            </span>
          </a>
        </div>
      </div>

      {/* scroll cue */}
      <div
        data-hero-cue
        aria-hidden
        className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="font-mono text-[0.6rem] tracking-[0.3em] text-white/50 uppercase">
          Scroll
        </span>
        <span className="cue-line block h-7 w-px bg-white/40" />
      </div>
    </section>
  );
}
