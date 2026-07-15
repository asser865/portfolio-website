/**
 * The deferred motion runtime. This module (and everything it pulls in)
 * stays out of the initial bundle — MotionProvider dynamic-imports it on
 * first user engagement. The page before that moment is the static,
 * CSS-animated site; everything after is enhancement.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText, Lenis };
export type MotionLibs = {
  gsap: typeof gsap;
  ScrollTrigger: typeof ScrollTrigger;
  SplitText: typeof SplitText;
  lenis: Lenis;
};
