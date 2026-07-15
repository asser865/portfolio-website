"use client";

import { useEffect, useRef } from "react";
import { useMotion } from "@/components/motion/MotionProvider";

/**
 * Single custom cursor: a difference-blend dot that grows over
 * interactive elements. Activates with the motion runtime (fine
 * pointers only) — and the native cursor is hidden ONLY while
 * this is active.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const { motionOK, libs } = useMotion();

  useEffect(() => {
    if (!motionOK || !libs || !dotRef.current) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const { gsap } = libs;

    document.body.dataset.customCursor = "true";
    const dot = dotRef.current;
    dot.style.display = "block";

    const xTo = gsap.quickTo(dot, "x", { duration: 0.35, ease: "expo.out" });
    const yTo = gsap.quickTo(dot, "y", { duration: 0.35, ease: "expo.out" });

    const move = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    const INTERACTIVE = 'a, button, [role="button"], [data-cursor]';
    const over = (e: MouseEvent) => {
      const t = (e.target as HTMLElement).closest?.(INTERACTIVE);
      gsap.to(dot, {
        scale: t ? 3.2 : 1,
        opacity: t ? 0.9 : 1,
        duration: 0.3,
        ease: "power3.out",
      });
    };
    const down = () => gsap.to(dot, { scale: 0.8, duration: 0.15 });
    const up = () => gsap.to(dot, { scale: 1, duration: 0.3, ease: "back.out(3)" });
    const leave = () => gsap.to(dot, { opacity: 0, duration: 0.2 });
    const enter = () => gsap.to(dot, { opacity: 1, duration: 0.2 });

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    document.documentElement.addEventListener("mouseleave", leave);
    document.documentElement.addEventListener("mouseenter", enter);

    return () => {
      delete document.body.dataset.customCursor;
      dot.style.display = "none";
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.documentElement.removeEventListener("mouseleave", leave);
      document.documentElement.removeEventListener("mouseenter", enter);
    };
  }, [motionOK, libs]);

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[95] hidden size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white mix-blend-difference"
    />
  );
}
