/**
 * Build-time image pipeline.
 * assets/*  →  public/img/{slug}-{w}.{avif,webp,jpg}  +  src/generated/images.json
 *
 * Everything is converted to grayscale: the design system is strict
 * monochrome and imagery participates in it, not against it.
 */
import sharp from "sharp";
import { mkdir, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "assets");
const OUT = path.join(ROOT, "public", "img");
const MANIFEST = path.join(ROOT, "src", "generated", "images.json");

/**
 * slug → source. Sources live under assets/, grouped by project.
 * The slug (map key) is the public contract — it names the output files
 * and the manifest entry; renaming a source file only changes `file`.
 */
const IMAGES = {
  portrait: { file: "portrait.png", widths: [480, 800] },
  "bioattend-board": { file: "bio-attend/board.png", widths: [640, 1280, 1920] },
  "bioattend-thumb": { file: "bio-attend/unit.png", widths: [338] },
  "sweetspinner": { file: "sweet-spinner/robot.png", widths: [480, 899] },
  "spotify-cover": { file: "spotify/cover.png", widths: [640, 1280] },
  "spotify-shot": { file: "spotify/shot.png", widths: [640, 818] },
  "binary-pcb": { file: "binary-counter/pcb.jpg", widths: [640, 1280] },
  // Servio product shots (real app, captured against live demo data).
  "servio-home": { file: "servio/home.png", widths: [640, 1280, 1920] },
  "servio-marketplace": { file: "servio/marketplace.png", widths: [640, 1280] },
  "servio-ai-finisher": { file: "servio/ai-finisher.png", widths: [640, 1280] },
  "servio-dashboard": { file: "servio/dashboard.png", widths: [640, 1280] },
  "servio-admin": { file: "servio/admin.png", widths: [640, 1280] },
};

const AVIF_Q = 55;
const WEBP_Q = 72;
const JPG_Q = 78;

await mkdir(OUT, { recursive: true });
await mkdir(path.dirname(MANIFEST), { recursive: true });

const manifest = {};

for (const [slug, cfg] of Object.entries(IMAGES)) {
  const srcPath = path.join(SRC, cfg.file);

  if (cfg.svg) {
    await copyFile(srcPath, path.join(OUT, `${slug}.svg`));
    manifest[slug] = { svg: `/img/${slug}.svg` };
    console.log(`✓ ${slug} (svg copied)`);
    continue;
  }

  const base = sharp(srcPath).rotate().grayscale();
  const meta = await sharp(srcPath).metadata();
  const aspect = meta.width / meta.height;

  // color originals power the hover "color reveal" (WebGL blend / CSS fade)
  const colorBase = sharp(srcPath).rotate();

  const variants = [];
  for (const w of cfg.widths) {
    const width = Math.min(w, meta.width);
    const resized = base.clone().resize({ width, withoutEnlargement: true });
    const h = Math.round(width / aspect);

    await resized.clone().avif({ quality: AVIF_Q }).toFile(path.join(OUT, `${slug}-${width}.avif`));
    await resized.clone().webp({ quality: WEBP_Q }).toFile(path.join(OUT, `${slug}-${width}.webp`));
    await resized.clone().jpeg({ quality: JPG_Q, progressive: true, mozjpeg: true }).toFile(path.join(OUT, `${slug}-${width}.jpg`));
    await colorBase
      .clone()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: WEBP_Q })
      .toFile(path.join(OUT, `${slug}-${width}-c.webp`));
    variants.push({ w: width, h });
  }

  // Tiny blurred placeholder, inlined as data URI (prevents CLS + gives instant paint)
  const blurBuf = await base
    .clone()
    .resize({ width: 24 })
    .webp({ quality: 30 })
    .toBuffer();

  manifest[slug] = {
    widths: variants.map((v) => v.w),
    width: variants.at(-1).w,
    height: variants.at(-1).h,
    aspect: Number(aspect.toFixed(4)),
    hasColor: true,
    blur: `data:image/webp;base64,${blurBuf.toString("base64")}`,
  };
  console.log(`✓ ${slug} (${variants.map((v) => v.w).join(", ")}w)`);
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 2));
console.log(`\nManifest → ${path.relative(ROOT, MANIFEST)}`);
