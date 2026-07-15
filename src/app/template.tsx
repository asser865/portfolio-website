"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Module-scoped: survives route changes, resets on full page load.
let hasNavigated = false;

/**
 * Route transition: a soft ink veil lifts off pages reached by
 * client-side navigation. Pure CSS transition — no motion runtime
 * required. Invisible by default so SSR output (first paint, no-JS,
 * reduced motion) is never blocked.
 *
 * The veil node is React-managed — it must only ever be HIDDEN, never
 * detached. Calling .remove() on it leaves React's fiber tree pointing
 * at a ghost child; the next route change then dies in commit with
 * "NotFoundError: removeChild" and strands the user on the error screen.
 */
export default function Template({ children }: { children: ReactNode }) {
  const veilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const veil = veilRef.current;
    if (!veil) return;
    const firstLoad = !hasNavigated;
    hasNavigated = true;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (firstLoad || reduced) {
      veil.style.display = "none";
      return;
    }
    veil.style.opacity = "1";
    veil.style.transition = "opacity 0.5s ease-out";
    // double-rAF: ensure the opaque frame paints before fading
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        veil.style.opacity = "0";
      });
    });
    const hide = () => {
      veil.style.display = "none";
    };
    veil.addEventListener("transitionend", hide, { once: true });
    const fallback = setTimeout(hide, 900);
    return () => {
      clearTimeout(fallback);
      veil.removeEventListener("transitionend", hide);
    };
  }, []);

  return (
    <>
      <div
        ref={veilRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[85] bg-ink opacity-0"
      />
      {children}
    </>
  );
}
