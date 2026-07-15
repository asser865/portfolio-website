"use client";

import { useRef, type ReactNode } from "react";
import { useMotion } from "@/components/motion/MotionProvider";

/**
 * Magnetic hover: the child leans toward the pointer and springs back.
 * Inert for touch / reduced motion / before the runtime loads.
 */
export function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const { motionOK, libs } = useMotion();

  const onMove = (e: React.MouseEvent) => {
    if (!motionOK || !libs || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    libs.gsap.to(ref.current, {
      x: (e.clientX - (r.left + r.width / 2)) * strength,
      y: (e.clientY - (r.top + r.height / 2)) * strength,
      duration: 0.4,
      ease: "power3.out",
    });
  };

  const onLeave = () => {
    if (!libs || !ref.current) return;
    libs.gsap.to(ref.current, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.35)" });
  };

  return (
    <span
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`inline-block will-change-transform ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
