"use client";

import { useLayoutEffect, useRef, type ReactNode, type ElementType } from "react";
import { useMotion } from "./MotionProvider";
import type { SplitText as SplitTextType } from "gsap/SplitText";

/**
 * Scroll-triggered entrances. SSR ships fully visible content; the motion
 * runtime arrives only after first engagement, so anything already in the
 * viewport at boot is left untouched — only content still below the fold
 * gets choreographed.
 */
const alreadyOnScreen = (el: HTMLElement) =>
  el.getBoundingClientRect().top < window.innerHeight * 0.86;

export function Reveal({
  children,
  as: Tag = "div",
  y = 48,
  delay = 0,
  stagger = 0.08,
  className,
  once = true,
}: {
  children: ReactNode;
  as?: ElementType;
  y?: number;
  delay?: number;
  stagger?: number;
  className?: string;
  once?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const { motionOK, libs } = useMotion();

  useLayoutEffect(() => {
    if (!motionOK || !libs || !ref.current) return;
    const el = ref.current;
    if (alreadyOnScreen(el)) return;
    const { gsap } = libs;
    const targets = el.children.length > 1 ? Array.from(el.children) : [el];
    const ctx = gsap.context(() => {
      gsap.from(targets, {
        y,
        opacity: 0,
        duration: 1.1,
        delay,
        stagger,
        ease: "expo.out",
        scrollTrigger: {
          trigger: el,
          start: "top 84%",
          once,
        },
      });
    });
    return () => ctx.revert();
  }, [motionOK, libs, y, delay, stagger, once]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

/**
 * Word-by-word scrubbed reading: words sit at low opacity and resolve
 * to full white as the scroll position sweeps through them. Continuous
 * and reversible — pure scroll-driven, no one-shot trigger.
 */
export function WordScrub({
  children,
  as: Tag = "p",
  className,
  from = "top 82%",
  to = "top 32%",
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  from?: string;
  to?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const { motionOK, libs } = useMotion();

  useLayoutEffect(() => {
    if (!motionOK || !libs || !ref.current) return;
    const el = ref.current;
    const { gsap, SplitText } = libs;
    let split: SplitTextType | null = null;
    let ctx: gsap.Context | null = null;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 200));
    const id = idle(() => {
      ctx = gsap.context(() => {
        split = new SplitText(el, { type: "words" });
        gsap.fromTo(
          split.words,
          { opacity: 0.14 },
          {
            opacity: 1,
            stagger: 0.06,
            ease: "none",
            scrollTrigger: { trigger: el, start: from, end: to, scrub: 0.4 },
          },
        );
      });
    });
    return () => {
      (window.cancelIdleCallback ?? clearTimeout)(id as number);
      ctx?.revert();
      split?.revert();
    };
  }, [motionOK, libs, from, to]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

/**
 * SplitText line reveal — lines mask up from behind clipped rows.
 * The signature text treatment for headings.
 */
export function SplitReveal({
  children,
  as: Tag = "h2",
  className,
  delay = 0,
  scrub = false,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  scrub?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const { motionOK, libs } = useMotion();

  useLayoutEffect(() => {
    if (!motionOK || !libs || !ref.current) return;
    const el = ref.current;
    if (alreadyOnScreen(el)) return;
    const { gsap, SplitText } = libs;
    let split: SplitTextType | null = null;
    let ctx: gsap.Context | null = null;
    // SplitText measures + rebuilds DOM — keep it off the boot frame.
    const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 200));
    const id = idle(() => {
      if (alreadyOnScreen(el)) return;
      ctx = gsap.context(() => {
        split = new SplitText(el, {
          type: "lines",
          linesClass: "split-line",
          mask: "lines",
        });
        gsap.from(split.lines, {
          yPercent: 110,
          duration: 1.2,
          delay,
          stagger: 0.09,
          ease: "expo.out",
          scrollTrigger: scrub
            ? { trigger: el, start: "top 90%", end: "top 40%", scrub: true }
            : { trigger: el, start: "top 86%", once: true },
        });
      });
    });
    return () => {
      (window.cancelIdleCallback ?? clearTimeout)(id as number);
      ctx?.revert();
      split?.revert();
    };
  }, [motionOK, libs, delay, scrub]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
