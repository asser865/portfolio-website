"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import type { CaseStudy } from "@/lib/content";
import { type PicSlug } from "@/components/ui/Pic";
import { DistortImage } from "@/components/ui/DistortImage";
import { Reveal, SplitReveal, WordScrub } from "@/components/motion/Reveal";
import { useMotion } from "@/components/motion/MotionProvider";

export function CaseStudyView({
  study,
  next,
}: {
  study: CaseStudy;
  next: { slug: string; title: string };
}) {
  const coverRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLElement>(null);
  const { motionOK, libs } = useMotion();

  // scroll-driven: cover unclips + decompresses as it enters, drifts while
  // passing; the next-project title slides in with approach
  useLayoutEffect(() => {
    if (!motionOK || !libs || !coverRef.current) return;
    const wrap = coverRef.current;
    const inner = wrap.firstElementChild as HTMLElement;
    const { gsap } = libs;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        wrap,
        { clipPath: "inset(5% 4% 5% 4% round 24px)", scale: 0.97 },
        {
          clipPath: "inset(0% 0% 0% 0% round 24px)",
          scale: 1,
          ease: "none",
          scrollTrigger: { trigger: wrap, start: "top 95%", end: "top 40%", scrub: 0.45 },
        },
      );
      if (inner) {
        gsap.fromTo(
          inner,
          { yPercent: -7, scale: 1.1 },
          {
            yPercent: 7,
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: wrap, start: "top bottom", end: "bottom top", scrub: 0.4 },
          },
        );
      }
      gsap.fromTo(
        "[data-next-title]",
        { xPercent: 14, opacity: 0.25 },
        {
          xPercent: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-next-title]",
            start: "top 96%",
            end: "top 60%",
            scrub: 0.4,
          },
        },
      );
    }, rootRef);
    return () => ctx.revert();
  }, [motionOK, libs]);

  return (
    <article
      ref={rootRef}
      className="relative z-10 mx-auto max-w-[1400px] px-5 pt-32 pb-24 md:px-10 md:pt-44"
    >
      <Reveal y={16}>
        <Link
          href="/#work"
          className="text-label inline-flex items-center gap-2 !text-white/64 transition-colors hover:!text-white"
        >
          ← All work
        </Link>
      </Reveal>

      <header className="mt-10 md:mt-14">
        <Reveal y={20}>
          <p className="text-label">
            {study.tag} — {study.year}
          </p>
        </Reveal>
        <SplitReveal
          as="h1"
          className="text-display mt-4 text-[clamp(3.2rem,10vw,9rem)] text-white"
          delay={0.1}
        >
          {study.title}
        </SplitReveal>
        <Reveal y={24} delay={0.2} className="mt-8 flex flex-wrap items-start justify-between gap-6">
          <p className="max-w-2xl text-base leading-relaxed text-white/64 md:text-lg">
            {study.summary}
          </p>
          <p className="text-label md:pt-2">{study.role}</p>
        </Reveal>
      </header>

      <div
        ref={coverRef}
        className="mt-14 aspect-[16/10] overflow-hidden rounded-3xl md:mt-20 md:aspect-[21/10]"
      >
        <div className="h-[114%] w-full">
          <DistortImage
            slug={study.cover as PicSlug}
            alt={study.coverAlt}
            sizes="(min-width: 1400px) 1320px, 94vw"
            priority
          />
        </div>
      </div>

      {/* Problem */}
      <div className="mt-24 grid gap-8 md:mt-36 md:grid-cols-[220px_1fr] md:gap-16">
        <Reveal>
          <p className="text-label">The problem</p>
        </Reveal>
        <WordScrub
          as="p"
          className="text-display max-w-3xl text-[clamp(1.4rem,2.6vw,2.2rem)] !leading-[1.25] text-white"
        >
          {study.problem}
        </WordScrub>
      </div>

      {/* Process */}
      <div className="mt-24 grid gap-8 md:mt-36 md:grid-cols-[220px_1fr] md:gap-16">
        <Reveal>
          <p className="text-label">The build</p>
        </Reveal>
        <div>
          {study.process.map((step, i) => (
            <Reveal key={i} y={32}>
              <div className="flex gap-6 border-t border-white/10 py-7 first:border-t-0 md:gap-10 md:py-8">
                <span className="font-mono text-xs text-white/50 md:pt-1.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="max-w-2xl text-base leading-relaxed text-white/64 md:text-lg">
                  {step}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Product gallery — real screens, captioned */}
      {study.gallery?.length ? (
        <div
          className={`mt-24 grid gap-10 md:mt-36 md:gap-12 ${
            study.gallery.length > 1 ? "md:grid-cols-2" : ""
          }`}
        >
          {study.gallery.map((g) => (
            <Reveal key={g.slug} y={40}>
              <figure className={study.gallery!.length === 1 ? "md:max-w-md" : undefined}>
                <div
                  className="glass overflow-hidden rounded-2xl"
                  style={{ aspectRatio: g.aspect.replace("/", " / ") }}
                >
                  <DistortImage
                    slug={g.slug as PicSlug}
                    alt={g.alt}
                    sizes="(min-width: 768px) 660px, 94vw"
                  />
                </div>
                <figcaption className="text-label mt-4">{g.caption}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      ) : null}

      {/* Detail shot */}
      {study.detail ? (
        <Reveal y={48} className="mt-24 md:mt-36">
          <div className="glass aspect-[16/10] overflow-hidden rounded-3xl">
            <DistortImage
              slug={study.detail.slug as PicSlug}
              alt={study.detail.alt}
              sizes="(min-width: 1400px) 1320px, 94vw"
            />
          </div>
        </Reveal>
      ) : null}

      {/* Outcome */}
      <Reveal y={56} className="mt-24 md:mt-36">
        <div className="glass-strong grid gap-10 rounded-3xl p-8 md:grid-cols-[auto_1fr] md:items-center md:gap-16 md:p-14">
          <div>
            <p className="text-display text-[clamp(2.6rem,6vw,5rem)] text-white">
              {study.outcomeStat.value}
            </p>
            <p className="text-label mt-3 max-w-[220px]">{study.outcomeStat.label}</p>
          </div>
          <p className="max-w-2xl text-base leading-relaxed text-white/64 md:text-lg">
            {study.outcome}
          </p>
        </div>
      </Reveal>

      {/* Stack */}
      <Reveal className="mt-16 md:mt-20">
        <p className="text-label mb-6">Stack</p>
        <ul className="flex flex-wrap gap-3">
          {study.stack.map((s) => (
            <li
              key={s}
              className="rounded-full border border-white/14 px-4 py-2 font-mono text-xs text-white/64"
            >
              {s}
            </li>
          ))}
        </ul>
      </Reveal>

      {study.links?.length ? (
        <Reveal className="mt-12">
          <div className="flex flex-wrap gap-4">
            {study.links.map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass text-label rounded-full px-6 py-3 !text-white transition-colors hover:bg-white hover:!text-black"
              >
                {l.label} ↗
              </a>
            ))}
          </div>
        </Reveal>
      ) : null}

      {/* Next project */}
      <div className="mt-28 border-t border-white/10 pt-14 md:mt-40">
        <p className="text-label mb-6">Next</p>
        <Link
          href={`/work/${next.slug}/`}
          data-cursor
          data-next-title
          className="group text-display inline-flex items-center gap-6 text-[clamp(2.4rem,7vw,6rem)] text-white/64 transition-colors duration-500 will-change-transform hover:text-white"
        >
          {next.title}
          <span
            aria-hidden
            className="inline-block text-[0.55em] transition-transform duration-500 ease-out-expo group-hover:translate-x-4"
          >
            →
          </span>
        </Link>
      </div>
    </article>
  );
}
