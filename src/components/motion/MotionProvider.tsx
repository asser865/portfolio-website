"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import type { MotionLibs } from "./motion-core";

type MotionCtx = {
  /** Loaded motion runtime — null until first engagement (or never, under reduced motion) */
  libs: MotionLibs | null;
  /** true once the runtime is live and the user allows motion */
  motionOK: boolean;
};

const Ctx = createContext<MotionCtx>({ libs: null, motionOK: false });
export const useMotion = () => useContext(Ctx);

/**
 * Motion policy for the whole app:
 * - prefers-reduced-motion → nothing ever loads; the static site IS the site.
 * - otherwise → on the first pointer/scroll/key/touch, dynamic-import the
 *   GSAP+Lenis runtime and hand over scrolling. Before that moment the page
 *   is plain static HTML — which is also exactly what the lab metrics see.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MotionCtx>({ libs: null, motionOK: false });
  const pathname = usePathname();
  // ref (not a dep) so boot arriving mid-session never triggers a reset
  const libsRef = useRef<MotionCtx["libs"]>(null);
  libsRef.current = state.libs;
  const firstPath = useRef(true);

  // Every route change lands at a deterministic point. Two problems
  // otherwise: Lenis re-applies the previous page's scroll position over
  // Next's own reset, and the new page's ScrollTriggers are created in
  // effect order (≠ document order) with nobody re-sorting them — the
  // same overlapping-pins failure the boot path guards against.
  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    const libs = libsRef.current;
    if (!libs) return; // runtime not booted → native behavior is already correct
    const { lenis, ScrollTrigger } = libs;
    lenis.scrollTo(0, { immediate: true, force: true });
    const id = window.setTimeout(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      const hash = window.location.hash;
      if (hash.length > 1) {
        try {
          const el = document.querySelector(hash);
          if (el) {
            lenis.scrollTo(el as HTMLElement, { offset: -96, immediate: true, force: true });
          }
        } catch {
          /* hash isn't a valid selector — stay at top */
        }
      }
    }, 180);
    return () => window.clearTimeout(id);
  }, [pathname]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.documentElement.dataset.motion = reduced ? "off" : "on";
    if (reduced) return;

    let disposed = false;
    let cleanup: (() => void) | null = null;

    const boot = async () => {
      const core = await import("./motion-core");
      if (disposed) return;
      const { gsap, ScrollTrigger, SplitText, Lenis } = core;

      const lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        // GSAP's ticker is the single clock — Lenis must not run its own rAF.
        autoRaf: false,
      });
      lenis.on("scroll", ScrollTrigger.update);
      const { motionBus } = await import("@/lib/motion-bus");
      document.body.classList.add("motion-booted");
      // NOTE: never transform (or will-change) an ancestor of the page —
      // it becomes the containing block for every position:fixed child
      // and silently breaks the nav and all ScrollTrigger pins. Velocity
      // effects live on leaf elements (images, type) via motionBus.
      const raf = (time: number) => {
        lenis.raf(time * 1000);
        motionBus.velocity = lenis.velocity;
      };
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      if (
        process.env.NODE_ENV === "development" ||
        window.location.hash.includes("shot")
      ) {
        const w = window as unknown as { __lenis?: unknown; __gsap?: unknown };
        w.__lenis = lenis;
        w.__gsap = gsap; // capture/testing: allows manual frame-stepping
      }

      // One interceptor for every in-page anchor: nav, footer, hero CTA.
      const onClick = (e: MouseEvent) => {
        const a = (e.target as HTMLElement).closest?.('a[href*="#"]');
        if (!a) return;
        const href = a.getAttribute("href")!;
        const hash = href.slice(href.indexOf("#"));
        if (hash.length < 2) return;
        const el = document.querySelector(hash);
        if (!el) return; // different page — let Next handle it
        e.preventDefault();
        // force: the mobile menu locks Lenis (stop()) and closes on this
        // same click — without force the glide would be swallowed.
        lenis.scrollTo(el as HTMLElement, { offset: -96, duration: 1.4, force: true });
        history.replaceState(null, "", hash);
      };
      document.addEventListener("click", onClick);

      cleanup = () => {
        document.removeEventListener("click", onClick);
        gsap.ticker.remove(raf);
        lenis.destroy();
      };

      setState({ libs: { gsap, ScrollTrigger, SplitText, lenis }, motionOK: true });

      // All consumers create their triggers in effects right after this
      // setState — in MIXED order (useLayoutEffect vs useEffect), so
      // creation order ≠ document order. ScrollTrigger refreshes triggers
      // in creation order and only accounts for pin spacers of triggers
      // it has already processed: without sort(), a trigger created
      // before an earlier-in-document pin measures 1080px short and the
      // pins overlap. sort() forces document-order refresh. Load-bearing.
      const hash = window.location.hash;
      const yMatch = hash.match(/y=(\d+)/);
      setTimeout(
        () => {
          ScrollTrigger.sort();
          ScrollTrigger.refresh();
          // Capture aid: #shot&y=<px> jumps straight to a scroll offset so
          // pinned/scrubbed states can be screenshotted deterministically.
          if (yMatch) {
            lenis.scrollTo(Number(yMatch[1]), { immediate: true, force: true });
          } else if (hash.length > 1) {
            // The browser anchored this hash against the unpinned layout;
            // the pins created above it have since moved the target.
            try {
              const el = document.querySelector(hash);
              if (el) {
                lenis.scrollTo(el as HTMLElement, { offset: -96, immediate: true, force: true });
              }
            } catch {
              /* hash isn't a valid selector — nothing to anchor */
            }
          }
        },
        yMatch ? 30 : 160,
      );
    };

    const arm = () => {
      window.removeEventListener("pointermove", arm);
      window.removeEventListener("touchstart", arm);
      window.removeEventListener("wheel", arm);
      window.removeEventListener("scroll", arm);
      window.removeEventListener("keydown", arm);
      void boot();
    };
    // Capture mode boots immediately so screenshots exercise the full site.
    if (window.location.hash.includes("shot")) {
      void boot();
    } else {
      const opts = { once: true, passive: true } as AddEventListenerOptions;
      window.addEventListener("pointermove", arm, opts);
      window.addEventListener("touchstart", arm, opts);
      window.addEventListener("wheel", arm, opts);
      window.addEventListener("scroll", arm, opts);
      window.addEventListener("keydown", arm, opts);
    }

    return () => {
      disposed = true;
      window.removeEventListener("pointermove", arm);
      window.removeEventListener("touchstart", arm);
      window.removeEventListener("wheel", arm);
      window.removeEventListener("scroll", arm);
      window.removeEventListener("keydown", arm);
      cleanup?.();
      setState({ libs: null, motionOK: false });
    };
  }, []);

  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}
