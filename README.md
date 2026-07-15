# asser.dev — Portfolio

Monochrome, liquid-glass portfolio for **Asser Essam** — Full-Stack Engineer & QA.
Live at **https://asser865.github.io/portfolio-website/**

## Stack

- **Next.js 15** (App Router, static export) + React 19 + TypeScript
- **Tailwind CSS v4** — grayscale-only token system (`white`/`black`/`ink`; no other color exists in the build)
- **GSAP** (ScrollTrigger, SplitText) + **Lenis** smooth scroll — loaded as a *deferred motion runtime*
- **OGL** WebGL fragment shader — the hero's liquid-glass lens
- **sharp** build-time image pipeline — AVIF/WebP/JPEG at responsive widths, grayscale-converted, blur placeholders

## Architecture notes

**Static-first, motion as enhancement.** The SSR output is a complete, fully
visible site: CSS-only hero entrance, no layout work done by JS. On first user
engagement (pointer move / scroll / touch / key) the motion runtime
(`src/components/motion/motion-core.ts`) is dynamically imported: Lenis takes
over scrolling on the GSAP ticker, ScrollTrigger choreography arms for content
still below the fold, and the WebGL lens mounts. Consequences:

- `prefers-reduced-motion` users get the static site, period. No Lenis, no shader, no reveals.
- No-JS visitors get the complete site.
- Initial JS is the Next.js runtime only (~103 kB gz); GSAP/Lenis/OGL live in deferred chunks.
- Lab metrics (Lighthouse) measure the page users actually first see.

**Scroll choreography.** Three sections (Work, Capabilities, Experience)
share one mechanic — `useHorizontalPin`: the section pins on md+ and
vertical scroll drives horizontal travel through the track, with
per-item scrub effects riding the drive via `containerAnimation`.
Project covers render through `DistortImage` (OGL): grayscale by
default, bending with scroll velocity, and revealing the **color**
version of the photo in a liquid pool around the pointer.

**Images** are processed at build (`npm run assets`): sources in `assets/` →
`public/img/` + `src/generated/images.json` manifest (dimensions, blur data,
grayscale + color variants) consumed by `Pic.tsx` / `DistortImage.tsx`.

**Error handling**: `error.tsx` / `global-error.tsx` give branded recovery
screens; chunk-load failures after a fresh deploy (stale cached HTML →
purged hashed chunks) auto-reload once.

**Content lives in one file**: `src/lib/content.ts` — copy, case studies,
timeline. Edit there, not in components. Site identity/URLs: `src/lib/site.ts`.

## Project structure

```
src/
  app/                 routes, layout, error boundaries, global CSS
  components/
    chrome/            nav, footer, cursor, live clock
    hero/              hero section + WebGL lens canvas
    motion/            deferred GSAP/Lenis runtime, reveals, pin hook
    sections/          work, about, capabilities, experience, contact
    ui/                Pic, DistortImage, Magnetic
    work/              case-study view
  lib/                 content.ts (all copy), site.ts (identity), motion-bus
  fonts/               self-hosted variable fonts (woff2)
  generated/           images.json manifest (built — committed for dev)
assets/                image SOURCES, grouped per project → the pipeline
  bio-attend/  binary-counter/  spotify/  sweet-spinner/  servio/  portrait.png
scripts/               optimize-images.mjs, generate-icons.mjs (run by `npm run assets`)
public/                static served files + generated img/ (AVIF/WebP/JPEG)
```

## Development

Requires Node.js ≥ 20.

```bash
npm ci
npm run dev      # dev server at http://localhost:3000/portfolio-website/
npm run build    # image pipeline + static export → out/
```

The site is served under the `/portfolio-website` base path (GitHub Pages
project site). To move to a custom domain, change `basePath` in
`next.config.ts` and `BASE_PATH` in `src/lib/site.ts`.

## Deployment

Pushing to `main` triggers `.github/workflows/static.yml`: CI builds the
static export and deploys `out/` to GitHub Pages. No local build required.

## URL hooks (capture/testing)

- `#shot` — skip entrance animations, boot motion immediately (screenshots)
- `#shot-og` — additionally strips nav/statement (used to generate `public/og.png`)
