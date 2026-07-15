"use client";

import Link from "next/link";
import { useRef } from "react";
import { CASE_STUDIES } from "@/lib/content";
import { type PicSlug } from "@/components/ui/Pic";
import { DistortImage } from "@/components/ui/DistortImage";
import { SplitReveal } from "@/components/motion/Reveal";
import { useHorizontalPin } from "@/components/motion/useHorizontalPin";
import { useMotion } from "@/components/motion/MotionProvider";

/**
 * Liquid hover: shared SVG displacement filter, attached only while
 * animating — zero rasterization cost at rest.
 */
function useLiquidHover() {
  const { motionOK, libs } = useMotion();
  const activeTween = useRef<{ kill(): void } | null>(null);

  const enter = (el: HTMLElement) => {
    if (!motionOK || !libs) return;
    const disp = document.querySelector("#liquid-distort feDisplacementMap");
    if (!disp) return;
    el.style.filter = "url(#liquid-distort)";
    activeTween.current?.kill();
    libs.gsap.set(disp, { attr: { scale: 0 } });
    activeTween.current = libs.gsap.to(disp, {
      attr: { scale: 26 },
      duration: 0.45,
      ease: "power2.out",
    });
  };

  const leave = (el: HTMLElement) => {
    if (!motionOK || !libs) return;
    const disp = document.querySelector("#liquid-distort feDisplacementMap");
    if (!disp) return;
    activeTween.current?.kill();
    activeTween.current = libs.gsap.to(disp, {
      attr: { scale: 0 },
      duration: 0.5,
      ease: "power2.inOut",
      onComplete: () => {
        el.style.filter = "";
      },
    });
  };

  return { enter, leave };
}

function Tile({
  slug,
  title,
  tag,
  year,
  summary,
  cover,
  coverAlt,
  index,
}: {
  slug: string;
  title: string;
  tag: string;
  year: string;
  summary: string;
  cover: PicSlug;
  coverAlt: string;
  index: number;
}) {
  const mediaRef = useRef<HTMLDivElement>(null);
  const { enter, leave } = useLiquidHover();

  return (
    <Link
      href={`/work/${slug}/`}
      data-cursor
      data-work-tile
      className="work-tile group block"
      onMouseEnter={() => mediaRef.current && enter(mediaRef.current)}
      onMouseLeave={() => mediaRef.current && leave(mediaRef.current)}
    >
      <div className="glass tile-card relative aspect-[16/10] overflow-hidden rounded-2xl">
        <div ref={mediaRef} data-tile-media className="absolute inset-0 will-change-transform">
          <DistortImage slug={cover} alt={coverAlt} sizes="(min-width: 768px) 50vw, 94vw" />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-30" />
        <span className="text-label absolute top-5 right-5 rounded-full border border-white/14 px-3 py-1.5 backdrop-blur-sm">
          {year}
        </span>
        <span className="text-label absolute top-5 left-5">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="mt-5 flex items-baseline justify-between gap-6">
        <div className="min-w-0">
          <h3 className="text-display inline-flex items-center gap-3 text-2xl text-white md:text-3xl">
            {title}
            <span
              aria-hidden
              className="inline-block -translate-x-1 text-xl opacity-0 transition-all duration-500 ease-out-expo group-hover:translate-x-0 group-hover:opacity-100"
            >
              →
            </span>
          </h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/64">{summary}</p>
        </div>
        <p className="text-label hidden shrink-0 md:block">{tag}</p>
      </div>
    </Link>
  );
}

export function Work() {
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const total = CASE_STUDIES.length;

  useHorizontalPin(stageRef, trackRef, {
    onProgress: (p) => {
      if (counterRef.current) {
        const i = Math.min(total, 1 + Math.round(p * (total - 1)));
        counterRef.current.textContent = `0${i} / 0${total}`;
      }
    },
    onBuild: (drive, gsap) => {
      // covers decompress from 1.14 → 1 as they cross the viewport
      trackRef.current!.querySelectorAll<HTMLElement>("[data-tile-media]").forEach((media) => {
        gsap.fromTo(
          media,
          { scale: 1.14 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: media,
              containerAnimation: drive,
              start: "left 85%",
              end: "left 20%",
              scrub: true,
            },
          },
        );
      });
    },
    onMobile: (gsap) => {
      trackRef.current!.querySelectorAll<HTMLElement>("[data-tile-media]").forEach((media) => {
        gsap.fromTo(
          media,
          { scale: 1.12 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: media, start: "top 92%", end: "top 28%", scrub: 0.4 },
          },
        );
      });
    },
  });

  return (
    <section id="work" className="relative z-10">
      <div
        ref={stageRef}
        className="pin-stage mx-auto w-full max-w-none px-5 py-24 md:px-10 md:py-0"
      >
        <div className="mx-auto mb-10 w-full max-w-[1400px] md:mb-12">
          <div className="mb-6 flex items-center gap-4">
            <span className="font-mono text-xs text-white/50">01</span>
            <span className="h-px flex-1 bg-white/10" />
            <span ref={counterRef} className="font-mono text-xs text-white/50" aria-hidden>
              01 / 0{total}
            </span>
          </div>
          <SplitReveal
            as="h2"
            scrub
            className="text-display text-[clamp(2.6rem,6.5vw,5.5rem)] text-white"
          >
            Selected work
          </SplitReveal>
        </div>

        <div ref={trackRef} className="pin-track will-change-transform">
          {CASE_STUDIES.map((c, i) => (
            <Tile
              key={c.slug}
              slug={c.slug}
              title={c.title}
              tag={c.tag}
              year={c.year}
              summary={c.summary}
              cover={c.cover}
              coverAlt={c.coverAlt}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
