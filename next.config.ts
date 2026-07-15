import type { NextConfig } from "next";

// Deployed at https://asser865.github.io/portfolio-website/ via GitHub Pages.
// If this ever moves to a custom domain or the asser865.github.io root repo,
// set BASE_PATH to "" (and update src/lib/site.ts).
const nextConfig: NextConfig = {
  output: "export",
  basePath: "/portfolio-website",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
