import manifest from "@/generated/images.json";
import { asset } from "@/lib/site";

type Manifest = typeof manifest;
export type PicSlug = keyof Manifest;

type Props = {
  slug: PicSlug;
  alt: string;
  /** sizes attribute, e.g. "(min-width: 768px) 50vw, 100vw" */
  sizes?: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
};

/**
 * Responsive <picture> backed by the build-time sharp pipeline:
 * AVIF → WebP → JPEG, intrinsic dimensions against CLS, inline
 * blur placeholder painted behind the real image.
 */
export function Pic({ slug, alt, sizes = "100vw", priority, className, imgClassName }: Props) {
  const m = manifest[slug] as Manifest[PicSlug] & {
    svg?: string;
    widths?: number[];
    width?: number;
    height?: number;
    blur?: string;
  };

  if (m.svg) {
    return (
      <img
        src={asset(m.svg)}
        alt={alt}
        className={imgClassName ?? className}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }

  const srcSet = (ext: string) =>
    m.widths!.map((w) => `${asset(`/img/${slug}-${w}.${ext}`)} ${w}w`).join(", ");

  return (
    <picture className={className}>
      <source type="image/avif" srcSet={srcSet("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet("webp")} sizes={sizes} />
      <img
        src={asset(`/img/${slug}-${m.width}.jpg`)}
        srcSet={srcSet("jpg")}
        sizes={sizes}
        width={m.width}
        height={m.height}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className={imgClassName}
        style={{
          backgroundImage: `url(${m.blur})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    </picture>
  );
}
