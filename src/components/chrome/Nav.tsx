"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/site";
import { Magnetic } from "@/components/ui/Magnetic";
import { useMotion } from "@/components/motion/MotionProvider";

const LINKS = [
  { label: "Work", href: "/#work", id: "work" },
  { label: "About", href: "/#about", id: "about" },
  { label: "Experience", href: "/#experience", id: "experience" },
  { label: "Contact", href: "/#contact", id: "contact" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [pill, setPill] = useState<{ x: number; w: number; h: number } | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const { libs, motionOK } = useMotion();

  // reading progress hairline along the pill's bottom edge
  useEffect(() => {
    if (!motionOK || !libs || !progressRef.current) return;
    const bar = progressRef.current;
    const st = libs.ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        bar.style.transform = `scaleX(${self.progress})`;
      },
    });
    return () => st.kill();
  }, [motionOK, libs]);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrolled(window.scrollY > 24));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Scroll-spy: whichever nav section crosses the middle band of the
  // viewport is "current". Pin spacers keep sections tall, so the pinned
  // scenes stay current for their whole scroll runway. Sections without
  // a nav entry (hero, capabilities) simply clear the highlight.
  useEffect(() => {
    setActive(null);
    const els = LINKS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => !!el,
    );
    if (!els.length) return; // case-study pages — nothing to spy on
    const seen = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set((e.target as HTMLElement).id, e.isIntersecting));
        setActive(LINKS.find((l) => seen.get(l.id))?.id ?? null);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  // The active highlight glides between links (desktop list only).
  useEffect(() => {
    const nav = navRef.current;
    if (!nav || !active) {
      setPill(null);
      return;
    }
    // basePath prefixes rendered hrefs — match on the hash suffix.
    const a = nav.querySelector<HTMLElement>(`a[href$="#${active}"]`);
    if (!a) {
      setPill(null);
      return;
    }
    const measure = () => {
      const nr = nav.getBoundingClientRect();
      const ar = a.getBoundingClientRect();
      setPill({ x: ar.left - nr.left, w: ar.width, h: ar.height });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active]);

  // Mobile overlay: pause page scroll, stagger links in, close on Escape.
  useEffect(() => {
    if (!open) return;
    libs?.lenis.stop();
    document.body.style.overflow = "hidden";
    if (motionOK && libs && overlayRef.current) {
      libs.gsap.from(overlayRef.current.querySelectorAll("[data-menu-link]"), {
        yPercent: 120,
        opacity: 0,
        duration: 0.7,
        stagger: 0.06,
        ease: "expo.out",
        delay: 0.1,
      });
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      libs?.lenis.start();
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, libs, motionOK]);

  return (
    <>
      {/* Floating glass pill — detached from every edge */}
      <header
        className={`fixed inset-x-3 top-3 z-[90] rounded-2xl transition-all duration-500 md:inset-x-6 md:top-5 ${
          scrolled ? "glass-strong" : "glass"
        }`}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-3 md:px-8 md:py-3.5">
          <Link
            href="/"
            aria-label="Asser Essam — home"
            className="text-display text-lg tracking-tight text-white"
          >
            asser<span className="text-white/50">.</span>
          </Link>

          <nav
            ref={navRef}
            aria-label="Primary"
            className="relative hidden items-center gap-1 md:flex"
          >
            {/* gliding "you are here" highlight */}
            <span
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-0 rounded-full border border-white/10 bg-white/[0.07] transition-[transform,width,opacity] duration-500 ease-out-expo"
              style={{
                width: pill?.w ?? 0,
                height: pill?.h ?? 0,
                transform: `translate(${pill?.x ?? 0}px, -50%)`,
                opacity: pill ? 1 : 0,
              }}
            />
            {LINKS.map((l) => (
              <Magnetic key={l.href} strength={0.25}>
                <Link
                  href={l.href}
                  aria-current={active === l.id ? "true" : undefined}
                  className={`text-label rounded-full px-4 py-2 transition-colors ${
                    active === l.id ? "!text-white" : "!text-white/64 hover:!text-white"
                  }`}
                >
                  {l.label}
                </Link>
              </Magnetic>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Magnetic strength={0.3}>
              <a
                href={asset("/AsserEssam_CV.pdf")}
                target="_blank"
                rel="noopener noreferrer"
                className="glass text-label hidden rounded-full px-5 py-2.5 !text-white transition-colors hover:bg-white hover:!text-black md:inline-block"
              >
                Résumé
              </a>
            </Magnetic>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className="relative z-[96] flex h-11 w-11 flex-col items-center justify-center gap-1.5 md:hidden"
            >
              <span
                className={`h-px w-6 bg-white transition-transform duration-300 ${
                  open ? "translate-y-[3.5px] rotate-45" : ""
                }`}
              />
              <span
                className={`h-px w-6 bg-white transition-transform duration-300 ${
                  open ? "-translate-y-[3.5px] -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </div>
        <span
          aria-hidden
          className="absolute right-4 bottom-0 left-4 h-px overflow-hidden rounded-full"
        >
          <span
            ref={progressRef}
            className="block h-full w-full origin-left scale-x-0 bg-white/40"
          />
        </span>
      </header>

      {/* Mobile menu — full-screen glass sheet */}
      <div
        id="mobile-menu"
        ref={overlayRef}
        hidden={!open}
        className="glass-strong fixed inset-0 z-[94] flex flex-col justify-between rounded-none px-6 pt-28 pb-10 md:hidden"
      >
        <nav aria-label="Mobile" className="flex flex-col gap-2">
          {LINKS.map((l, i) => (
            <span key={l.href} className="line-mask">
              <Link
                data-menu-link
                href={l.href}
                aria-current={active === l.id ? "true" : undefined}
                onClick={() => setOpen(false)}
                className="text-display block text-5xl text-white"
              >
                <span className="mr-3 font-mono text-xs text-white/50 align-super">
                  0{i + 1}
                </span>
                {l.label}
                {active === l.id ? (
                  <span
                    aria-hidden
                    className="mb-1 ml-4 inline-block size-2 rounded-full bg-white align-middle"
                  />
                ) : null}
              </Link>
            </span>
          ))}
        </nav>
        <a
          data-menu-link
          href={asset("/AsserEssam_CV.pdf")}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setOpen(false)}
          className="text-label inline-flex w-fit rounded-full border border-white/14 px-6 py-3 !text-white"
        >
          Download Résumé
        </a>
      </div>
    </>
  );
}
