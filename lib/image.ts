/**
 * Cloudinary delivery helpers. Kept free of `server-only` so client components
 * (the cart drawer, for instance) can size images too.
 */

export function isCloudinary(url: string) {
  return url.includes("res.cloudinary.com") && url.includes("/upload/");
}

/**
 * Rewrites a Cloudinary URL to request a width with automatic format and
 * quality, so a 4MB upload is delivered as a small WebP/AVIF. Any other URL
 * passes through untouched, which makes this safe to call on every image.
 */
export function cloudinaryUrl(url: string, width?: number) {
  if (!isCloudinary(url)) return url;
  const transform = ["f_auto", "q_auto", width ? `w_${width}` : "", "c_limit"]
    .filter(Boolean)
    .join(",");
  return url.replace("/upload/", `/upload/${transform}/`);
}
