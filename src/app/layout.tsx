import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { SITE, asset } from "@/lib/site";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { Cursor } from "@/components/chrome/Cursor";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import "./globals.css";

const clash = localFont({
  src: "../fonts/ClashDisplay-Variable.woff2",
  variable: "--font-clash",
  weight: "200 700",
  display: "swap",
  preload: true,
});

const general = localFont({
  src: "../fonts/GeneralSans-Variable.woff2",
  variable: "--font-general",
  weight: "200 700",
  display: "swap",
  preload: true,
});

const jbm = localFont({
  src: "../fonts/JetBrainsMono-400.woff2",
  variable: "--font-jbm",
  weight: "400",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.role}`,
    template: `%s — ${SITE.name}`,
  },
  description:
    "Software engineer with a QA discipline. I design, build, test and ship complete web platforms — most recently an AI-powered services marketplace, owned end-to-end.",
  authors: [{ name: SITE.name, url: SITE.url }],
  keywords: [
    "Asser Essam",
    "full-stack engineer",
    "software engineer",
    "QA engineer",
    "ISTQB",
    "Node.js",
    "portfolio",
  ],
  openGraph: {
    type: "website",
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.role}`,
    description:
      "I design, build, test and ship complete web platforms — from front-end to Node.js back-ends and AI features.",
    images: [{ url: `${SITE.url}/og.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.role}`,
    description:
      "I design, build, test and ship complete web platforms — from front-end to Node.js back-ends and AI features.",
    images: [`${SITE.url}/og.png`],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE.url },
  // Note: metadata paths don't inherit basePath — asset() is required.
  icons: {
    icon: [
      { url: asset("/icon-32.png"), sizes: "32x32", type: "image/png" },
      { url: asset("/icon-16.png"), sizes: "16x16", type: "image/png" },
    ],
    shortcut: asset("/favicon.ico"),
    apple: asset("/apple-touch-icon.png"),
  },
  manifest: asset("/site.webmanifest"),
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE.name,
  jobTitle: "Software Engineer & QA",
  email: `mailto:${SITE.email}`,
  url: SITE.url,
  sameAs: [SITE.github, SITE.linkedin],
  address: { "@type": "PostalAddress", addressLocality: "Cairo", addressCountry: "EG" },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Arab Academy for Science and Technology",
  },
  knowsAbout: [
    "JavaScript",
    "TypeScript",
    "Node.js",
    "Software Testing",
    "ISTQB",
    "Embedded Systems",
  ],
};

export const viewport: Viewport = {
  themeColor: "#060606",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${clash.variable} ${general.variable} ${jbm.variable}`}
    >
      <body className="bg-ink font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {/* Pinned scenes change the page height radically once the motion
            runtime boots — the browser's saved scroll position is measured
            against a layout that no longer exists. Reloads start clean at
            the top: restoration off, and a section hash left over from nav
            clicks is stripped BEFORE the parser reaches its target (so the
            browser never anchors). Fresh visits to a shared /#section link
            keep the hash — the boot path re-anchors it after pins measure. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "history.scrollRestoration='manual';try{var n=performance.getEntriesByType('navigation')[0];if(n&&n.type==='reload'&&location.hash){history.replaceState(null,'',location.pathname+location.search)}}catch(e){}",
          }}
        />
        <a
          href="#main"
          className="text-label fixed top-4 left-4 z-[100] -translate-y-24 rounded-full bg-white px-5 py-3 !text-black transition-transform focus-visible:translate-y-0"
        >
          Skip to content
        </a>
        <div aria-hidden className="ambient">
          <span className="ambient-ribbon ambient-ribbon-a" />
          <span className="ambient-ribbon ambient-ribbon-b" />
        </div>
        <MotionProvider>
          <Nav />
          {children}
          <Footer />
          <Cursor />
        </MotionProvider>
        <div aria-hidden className="grain" />
        {/* Cloudflare Web Analytics — cookieless, no consent banner needed.
            afterInteractive: loads once the page is interactive, never
            competes with LCP/hydration. Token is a public site identifier,
            not a secret (same model as a GA measurement ID). */}
        <Script
          id="cf-web-analytics"
          type="module"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "43546ef81e304a399555837cfb8fc133"}'
          strategy="afterInteractive"
        />
        {/* Shared liquid-distortion filter for hover states (scale animated via GSAP) */}
        <svg aria-hidden className="absolute h-0 w-0">
          <defs>
            <filter id="liquid-distort" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.012 0.022"
                numOctaves="2"
                seed="7"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="0"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
      </body>
    </html>
  );
}
