import Image from "next/image";
import { cloudinaryUrl, isCloudinary } from "@/lib/image";

/**
 * Product imagery comes from two places: local files under /public (the seeded
 * artwork and the no-Cloudinary fallback) and Cloudinary.
 *
 * For Cloudinary we ask their CDN for the exact width in an automatic format
 * and tell Next not to re-process it — their edge does the work for free, and
 * running every catalogue image through our own optimiser would just burn CPU
 * and bandwidth on the server. Everything else goes through Next as normal.
 */
export function ProductImage({
  src,
  alt,
  width,
  className,
  sizes,
  priority,
  fill = true,
}: {
  src: string;
  alt: string;
  /** Rendered width in CSS pixels; used to pick the Cloudinary variant. */
  width: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
}) {
  const remote = isCloudinary(src);
  // Ask for 2× so the image stays sharp on high-density screens.
  const source = remote ? cloudinaryUrl(src, width * 2) : src;

  // Next cannot rasterise SVG — it passes the file through and stamps it with
  // the hardening headers configured in next.config.ts (attachment disposition
  // and a sandbox CSP), which stops the browser rendering it inline. Vectors
  // need no optimising, so serve them straight from /public.
  const vector = src.endsWith(".svg");
  const skipOptimiser = remote || vector;

  if (fill) {
    return (
      <Image
        src={source}
        alt={alt}
        fill
        sizes={sizes ?? `${width}px`}
        priority={priority}
        unoptimized={skipOptimiser}
        className={className}
      />
    );
  }

  return (
    <Image
      src={source}
      alt={alt}
      width={width}
      height={width}
      priority={priority}
      unoptimized={skipOptimiser}
      className={className}
    />
  );
}
