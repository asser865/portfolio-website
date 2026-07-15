/**
 * Single source of truth for site identity + deployment paths.
 * If the site moves off /portfolio-website (custom domain or
 * user-site repo), change BASE_PATH here and in next.config.ts.
 */
export const BASE_PATH = "/portfolio-website";

export const SITE = {
  name: "Asser Essam",
  role: "Software Engineer & QA",
  url: "https://asser865.github.io/portfolio-website",
  email: "asseressam123@gmail.com",
  github: "https://github.com/asser865",
  linkedin: "https://www.linkedin.com/in/asseressam/",
  location: "Cairo, Egypt",
} as const;

/** Prefix a /public asset path with the deployment base path.
 *  Needed for raw <img>/<a>/meta references (next/link handles it alone). */
export const asset = (path: string): string => `${BASE_PATH}${path}`;
