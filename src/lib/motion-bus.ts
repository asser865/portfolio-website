/**
 * Tiny shared channel between the motion runtime and the shader.
 * Kept dependency-free so both the initial bundle and async chunks
 * can import it without pulling anything heavy.
 */
export const motionBus = {
  /** Lenis scroll velocity (px/frame-ish), smoothed by consumers */
  velocity: 0,
  /** 0..1 progress through the pinned hero scene */
  heroProgress: 0,
};
