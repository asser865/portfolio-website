"use client";

import { useEffect, useRef, useState } from "react";
import { Pic, type PicSlug } from "./Pic";
import manifest from "@/generated/images.json";
import { asset } from "@/lib/site";
import { useMotion } from "@/components/motion/MotionProvider";
import { motionBus } from "@/lib/motion-bus";

/**
 * WebGL image surface: drawn through a fragment shader that bends with
 * scroll velocity, ripples from the pointer — and reveals the COLOR
 * version of the photograph in a liquid pool around the cursor (the
 * monochrome system's one sanctioned use of color).
 *
 * The plain grayscale <Pic> stays underneath for SSR / no-JS / reduced
 * motion / LCP; a CSS color-crossfade covers the no-WebGL case.
 */

const VERT = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0., 1.);
}
`;

const FRAG = /* glsl */ `
precision highp float;
uniform sampler2D uMap;      // grayscale
uniform sampler2D uMapC;     // color
uniform vec2  uPlane;
uniform vec2  uImage;
uniform float uTime;
uniform float uVel;
uniform float uVelRaw;
uniform vec2  uMouse;        // 0..1, y up
uniform float uHover;
varying vec2 vUv;

vec2 coverUv(vec2 uv) {
  float pr = uPlane.x / uPlane.y;
  float ir = uImage.x / uImage.y;
  vec2 s = (pr > ir) ? vec2(1.0, ir / pr) : vec2(pr / ir, 1.0);
  return (uv - 0.5) * s + 0.5;
}

void main() {
  vec2 uv = vUv;

  // scroll bend: rows shear sideways by velocity, strongest at edges
  float edge = (uv.y - 0.5);
  uv.x += uVelRaw * 0.055 * edge * edge * 4.0 * (0.25 + uVel);

  // liquid shimmer at rest + velocity swell
  float w = sin(uv.y * 9.0 + uTime * 0.8) * cos(uv.x * 7.0 - uTime * 0.6);
  uv += w * (0.0016 + uVel * 0.012);

  // pointer ripple
  float d = distance(vUv, uMouse);
  float rip = sin(d * 26.0 - uTime * 5.0) * exp(-d * 5.5) * uHover;
  uv += normalize(vUv - uMouse + 1e-5) * rip * 0.014;

  vec2 cuv = coverUv(uv);
  vec3 g = texture2D(uMap, cuv).rgb;
  vec3 c = texture2D(uMapC, cuv).rgb;

  // color pools out of the cursor, with a soft global wash on hover;
  // the ripple ring carries a slight extra flush of color
  float pool = smoothstep(0.62, 0.06, d);
  float reveal = clamp(pool * 1.15 + 0.22 * uHover + abs(rip) * 1.4, 0.0, 1.0) * uHover;
  vec3 col = mix(g, c, reveal);

  col += uVel * 0.05 * (1.0 - distance(vUv, vec2(0.5)));
  gl_FragColor = vec4(col, 1.0);
}
`;

type Props = {
  slug: PicSlug;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  /** color-on-hover reveal (default on) */
  colorHover?: boolean;
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => rej(new Error("texture load failed: " + src));
    const poll = setInterval(() => {
      if (img.complete && img.naturalWidth > 0) {
        clearInterval(poll);
        res(img);
      }
    }, 200);
    setTimeout(() => clearInterval(poll), 15000);
    img.src = src;
  });

export function DistortImage({
  slug,
  alt,
  sizes,
  priority,
  className,
  imgClassName,
  colorHover = true,
}: Props) {
  const holderRef = useRef<HTMLDivElement>(null);
  const { motionOK, libs } = useMotion();
  const [glReady, setGlReady] = useState(false);

  const m = manifest[slug] as {
    widths?: number[];
    width?: number;
    hasColor?: boolean;
  };
  const colorFallbackSrc =
    colorHover && m.hasColor && m.widths
      ? asset(`/img/${slug}-${m.widths[Math.min(1, m.widths.length - 1)]}-c.webp`)
      : null;

  useEffect(() => {
    if (!motionOK || !libs || !holderRef.current) return;
    const holder = holderRef.current;
    const { gsap } = libs;
    let disposed = false;
    let cleanup: (() => void) | null = null;

    void (async () => {
      const { Renderer, Program, Mesh, Triangle, Texture } = await import("ogl");
      if (disposed || !m.widths) return;

      const target = holder.clientWidth * Math.min(window.devicePixelRatio || 1, 2);
      const w = m.widths.find((x) => x >= target) ?? m.widths[m.widths.length - 1];

      let gray: HTMLImageElement;
      let color: HTMLImageElement | null = null;
      try {
        [gray, color] = await Promise.all([
          loadImage(asset(`/img/${slug}-${w}.webp`)),
          colorHover && m.hasColor
            ? loadImage(asset(`/img/${slug}-${w}-c.webp`))
            : Promise.resolve(null),
        ]);
      } catch {
        return; // keep the plain <Pic>
      }
      await Promise.all([
        gray.decode().catch(() => {}),
        color ? color.decode().catch(() => {}) : null,
      ]);
      if (disposed) return;

      const renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio || 1, 1.75),
        alpha: false,
        antialias: false,
        powerPreference: "high-performance",
      });
      const gl = renderer.gl;
      gl.canvas.style.cssText =
        "position:absolute;inset:0;width:100%;height:100%;display:block;";
      holder.appendChild(gl.canvas);

      const texG = new Texture(gl, { image: gray, generateMipmaps: false });
      const texC = new Texture(gl, { image: color ?? gray, generateMipmaps: false });
      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uMap: { value: texG },
          uMapC: { value: texC },
          uPlane: { value: [1, 1] },
          uImage: { value: [gray.naturalWidth, gray.naturalHeight] },
          uTime: { value: 0 },
          uVel: { value: 0 },
          uVelRaw: { value: 0 },
          uMouse: { value: [0.5, 0.5] },
          uHover: { value: 0 },
        },
      });
      const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

      const resize = () => {
        const r = holder.getBoundingClientRect();
        renderer.setSize(r.width, r.height);
        program.uniforms.uPlane.value = [r.width, r.height];
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(holder);

      const onMove = (e: PointerEvent) => {
        const r = holder.getBoundingClientRect();
        program.uniforms.uMouse.value = [
          (e.clientX - r.left) / r.width,
          1 - (e.clientY - r.top) / r.height,
        ];
      };
      const onEnter = () => gsap.to(program.uniforms.uHover, { value: 1, duration: 0.55, ease: "power2.out" });
      const onLeave = () => gsap.to(program.uniforms.uHover, { value: 0, duration: 0.7, ease: "power2.inOut" });
      holder.addEventListener("pointermove", onMove, { passive: true });
      holder.addEventListener("pointerenter", onEnter);
      holder.addEventListener("pointerleave", onLeave);

      let visible = true;
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), {
        rootMargin: "12%",
      });
      io.observe(holder);

      let time = 0;
      let sVel = 0;
      let sRaw = 0;
      const tick = (_t: number, delta: number) => {
        if (!visible || document.hidden) return;
        time += delta / 1000;
        sVel += (Math.min(Math.abs(motionBus.velocity) / 45, 1) - sVel) * 0.1;
        sRaw += (Math.max(-1, Math.min(1, motionBus.velocity / 45)) - sRaw) * 0.1;
        program.uniforms.uTime.value = time;
        program.uniforms.uVel.value = sVel;
        program.uniforms.uVelRaw.value = sRaw;
        renderer.render({ scene: mesh });
      };
      gsap.ticker.add(tick);
      setGlReady(true);

      cleanup = () => {
        gsap.ticker.remove(tick);
        io.disconnect();
        ro.disconnect();
        holder.removeEventListener("pointermove", onMove);
        holder.removeEventListener("pointerenter", onEnter);
        holder.removeEventListener("pointerleave", onLeave);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        gl.canvas.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
      setGlReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motionOK, libs, slug, colorHover]);

  return (
    <div ref={holderRef} className={`relative h-full w-full ${className ?? ""}`}>
      <Pic
        slug={slug}
        alt={alt}
        sizes={sizes}
        priority={priority}
        className={`block h-full w-full transition-opacity duration-300 ${glReady ? "opacity-0" : "opacity-100"}`}
        imgClassName={imgClassName ?? "h-full w-full object-cover"}
      />
      {/* no-WebGL fallback: plain CSS color crossfade on hover */}
      {colorFallbackSrc && !glReady ? (
        <img
          src={colorFallbackSrc}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
      ) : null}
    </div>
  );
}
