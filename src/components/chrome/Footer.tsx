import { SITE } from "@/lib/site";
import { CairoTime } from "./CairoTime";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-10">
        <div>
          <p className="text-sm text-white/64">
            © {new Date().getFullYear()} {SITE.name} — designed &amp; built from scratch.
          </p>
          <p className="mt-1 font-mono text-[0.65rem] tracking-widest text-white/50 uppercase">
            Next.js · TypeScript · GSAP · WebGL — no templates
          </p>
          <p className="mt-1 font-mono text-[0.65rem] tracking-widest text-white/50 uppercase">
            Cairo, Egypt — <CairoTime />
          </p>
        </div>
        <nav aria-label="Footer" className="flex items-center gap-6">
          <a
            href={SITE.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-label !text-white/64 transition-colors hover:!text-white"
          >
            GitHub
          </a>
          <a
            href={SITE.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-label !text-white/64 transition-colors hover:!text-white"
          >
            LinkedIn
          </a>
          <a
            href={`mailto:${SITE.email}`}
            className="text-label !text-white/64 transition-colors hover:!text-white"
          >
            Email
          </a>
          <a href="#main" className="text-label !text-white/64 transition-colors hover:!text-white">
            Top ↑
          </a>
        </nav>
      </div>
    </footer>
  );
}
