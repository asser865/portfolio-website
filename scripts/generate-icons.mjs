/**
 * Favicon + app icon generation.
 * A geometric "liquid lens" monogram — an off-center ring inside a dark
 * rounded square — replaces the old 417 KB logo.png favicon.
 */
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const PUB = path.join(ROOT, "public");
await mkdir(PUB, { recursive: true });

const mark = (size, radiusPct = 22) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="${radiusPct}" fill="#060606"/>
  <circle cx="54" cy="46" r="27" fill="none" stroke="#ffffff" stroke-width="6"/>
  <circle cx="44" cy="56" r="12" fill="#ffffff"/>
</svg>`;

const targets = [
  ["icon-16.png", 16],
  ["icon-32.png", 32],
  ["apple-touch-icon.png", 180],
  ["icon-512.png", 512],
];

for (const [name, size] of targets) {
  await sharp(Buffer.from(mark(size))).resize(size, size).png().toFile(path.join(PUB, name));
  console.log(`✓ ${name}`);
}

// favicon.ico: single 32px BMP-in-ICO built by hand (sharp has no ico output).
// Modern browsers prefer the PNG links; the .ico is the legacy fallback.
const png32 = await sharp(Buffer.from(mark(32))).resize(32, 32).png().toBuffer();
// ICO container wrapping one PNG entry (valid since Vista)
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // count
const entry = Buffer.alloc(16);
entry[0] = 32; // width
entry[1] = 32; // height
entry.writeUInt16LE(1, 4); // color planes
entry.writeUInt16LE(32, 6); // bpp
entry.writeUInt32LE(png32.length, 8);
entry.writeUInt32LE(22, 12); // offset: 6 + 16
await writeFile(path.join(PUB, "favicon.ico"), Buffer.concat([header, entry, png32]));
console.log("✓ favicon.ico");
