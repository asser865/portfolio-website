"use client";

import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";
import gsap from "gsap";
import { motionBus } from "@/lib/motion-bus";

/**
 * The liquid-glass signature: a monochrome silk field seen through a
 * refractive lens that follows the pointer (or drifts autonomously on
 * touch devices), ripples on click, and dilates with scroll.
 *
 * Not mounted at all under reduced motion / missing WebGL — the hero
 * falls back to a static gradient (see Hero.tsx).
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

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uMouse;     // px, canvas space
uniform float uScroll;    // 0..1 progress through hero
uniform float uVel;       // 0..1 smoothed scroll velocity — churns the liquid
uniform float uIntro;     // 0..1 lens grows in
uniform float uClickT;    // time of last click (-10 initially)
uniform vec2  uClickPos;  // px

varying vec2 vUv;

// --- simplex noise (Ashima, condensed) ---
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.55;
  for (int i = 0; i < 3; i++) {
    v += a * snoise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

float field(vec2 p, float t, float stretch, float scroll) {
  vec2 q = vec2(p.x * 1.15, (p.y + scroll * 0.55) * stretch);
  return fbm(q * 1.55 + vec2(t, -t * 0.7) + fbm(q * 3.0 - t) * 0.38);
}

void main() {
  vec2 asp = vec2(uRes.x / uRes.y, 1.0);
  vec2 p = vUv * asp;
  vec2 m = (uMouse / uRes) * asp;

  // scroll velocity accelerates time and churns the field
  float t = uTime * (0.055 + uVel * 0.11);
  float stretch = 1.0 + uScroll * 1.6 + uVel * 0.35;

  float n = field(p, t, stretch, uScroll);

  // wobbly lens — dilates hard through the pinned hero scrub
  float baseR = (0.17 + 0.035 * sin(uTime * 0.7)) * (1.0 + uScroll * 2.1) * uIntro;
  float ang = atan(p.y - m.y, p.x - m.x);
  float wob = snoise(vec2(ang * 2.0 + 10.0, uTime * 0.32)) * (0.018 + uVel * 0.03);
  float d = length(p - m) - (baseR + wob);

  // click ripple
  float age = uTime - uClickT;
  float rip = 0.0;
  if (age < 1.8 && age > 0.0) {
    float rd = length(p - (uClickPos / uRes) * asp);
    rip = sin(26.0 * rd - age * 8.5) * exp(-3.2 * rd) * exp(-2.0 * age);
  }

  // refraction inside the lens: re-sample the field through offset UVs
  float inside = smoothstep(0.012, -0.09, d);
  vec2 nrm = (p - m) / max(length(p - m), 1e-4);
  vec2 refUv = vUv - nrm * inside * (0.085 + 0.05 * n + uVel * 0.06) - nrm * rip * 0.05;
  float n2 = field(refUv * asp, t, stretch, uScroll);

  float f = mix(n, n2 * 1.25 + 0.16, inside);
  f = f * 0.5 + 0.5;          // remap to 0..1
  f = pow(f, 1.4);            // film-ish contrast, keeps blacks deep
  float g = 0.018 + f * 0.17 + rip * 0.30 * (0.35 + inside);

  // glass edge catching light
  float edge = smoothstep(0.010, 0.0, abs(d)) * (0.45 + 0.55 * snoise(vec2(uTime * 0.5, ang * 3.0)));
  g += edge * 0.30 * uIntro;

  // vignette to seat it in the ink
  g *= 1.0 - 0.45 * length(vUv - 0.5);

  gl_FragColor = vec4(vec3(g), 1.0);
}
`;

type Props = {
  /** autonomous drift instead of pointer-follow (touch devices) */
  autonomous?: boolean;
  className?: string;
};

export default function HeroCanvas({ autonomous = false, className }: Props) {
  const holderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const holder = holderRef.current;
    if (!holder) return;

    const renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio || 1, autonomous ? 1.25 : 1.75),
      alpha: false,
      antialias: false,
      powerPreference: "high-performance",
    });
    const gl = renderer.gl;
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.display = "block";
    holder.appendChild(gl.canvas);

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uRes: { value: [1, 1] },
        uTime: { value: 0 },
        uMouse: { value: [0, 0] },
        uScroll: { value: 0 },
        uVel: { value: 0 },
        uIntro: { value: 0 },
        uClickT: { value: -10 },
        uClickPos: { value: [0, 0] },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const resize = () => {
      const { width, height } = holder.getBoundingClientRect();
      renderer.setSize(width, height);
      program.uniforms.uRes.value = [gl.drawingBufferWidth, gl.drawingBufferHeight];
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(holder);

    // pointer state, lerped for weight
    const target = { x: 0.62, y: 0.42 }; // normalized; opens off-center over the name
    const cur = { x: 0.62, y: 0.42 };

    const onMove = (e: PointerEvent) => {
      const r = holder.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width;
      target.y = (e.clientY - r.top) / r.height;
    };
    const onClick = (e: PointerEvent) => {
      const r = holder.getBoundingClientRect();
      program.uniforms.uClickT.value = time;
      program.uniforms.uClickPos.value = [
        (e.clientX - r.left) * (gl.drawingBufferWidth / r.width),
        (1 - (e.clientY - r.top) / r.height) * gl.drawingBufferHeight,
      ];
    };
    if (!autonomous) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onClick, { passive: true });
    }

    // scroll progress: prefer the pinned-scene progress from the motion
    // runtime; fall back to raw scrollY before it boots.
    const onScroll = () => {
      if (motionBus.heroProgress > 0) return;
      const h = holder.getBoundingClientRect().height || 1;
      program.uniforms.uScroll.value = Math.min(1, Math.max(0, window.scrollY / h));
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // lens intro (#shot = capture mode, skip to settled state)
    if (window.location.hash.includes("shot")) program.uniforms.uIntro.value = 1;
    else gsap.to(program.uniforms.uIntro, { value: 1, duration: 1.8, ease: "expo.out", delay: 0.35 });

    // render only while visible & tab focused
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
    io.observe(holder);

    let time = 0;
    let smoothVel = 0;
    const tick = (_t: number, delta: number) => {
      if (!visible || document.hidden) return;
      time += delta / 1000;
      if (autonomous) {
        target.x = 0.5 + 0.28 * Math.sin(time * 0.23);
        target.y = 0.42 + 0.2 * Math.sin(time * 0.31 + 1.7);
      }
      cur.x += (target.x - cur.x) * 0.06;
      cur.y += (target.y - cur.y) * 0.06;
      // scroll state from the motion runtime
      smoothVel += (Math.min(Math.abs(motionBus.velocity) / 42, 1) - smoothVel) * 0.09;
      program.uniforms.uVel.value = smoothVel;
      if (motionBus.heroProgress > 0) {
        program.uniforms.uScroll.value = motionBus.heroProgress;
      }
      program.uniforms.uTime.value = time;
      program.uniforms.uMouse.value = [
        cur.x * gl.drawingBufferWidth,
        (1 - cur.y) * gl.drawingBufferHeight,
      ];
      renderer.render({ scene: mesh });
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onClick);
      window.removeEventListener("scroll", onScroll);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      gl.canvas.remove();
    };
  }, [autonomous]);

  return <div ref={holderRef} aria-hidden className={className} />;
}
