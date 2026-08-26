import "server-only";
import crypto from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";

/**
 * Product image storage.
 *
 * Cloudinary is the production provider: it stores the original, serves it
 * from a CDN, and resizes / re-encodes on the fly from the URL, so a 4MB phone
 * photo of a cement pallet is delivered as a ~30KB WebP thumbnail without any
 * work on our side.
 *
 * With no Cloudinary credentials configured, uploads fall back to writing into
 * public/uploads so the app is usable straight after `git clone`. That fallback
 * needs a writable, persistent disk — fine on a VPS or container with a volume,
 * not on Vercel or Lambda.
 *
 * Swapping to Cloudflare R2 later means implementing `upload` and `remove`
 * against the S3 API here; nothing outside this file needs to change.
 */

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/svg+xml": ".svg",
};

export type StoredImage = {
  url: string;
  /** Cloudinary public_id (or object key), needed to delete the file later. */
  storageId: string | null;
  provider: "cloudinary" | "local";
};

function cloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;
  return {
    cloudName,
    apiKey,
    apiSecret,
    folder: process.env.CLOUDINARY_FOLDER || "suez-trading/products",
  };
}

export function storageProvider(): "cloudinary" | "local" {
  return cloudinaryConfig() ? "cloudinary" : "local";
}

/**
 * Vercel, Lambda and most container platforms give you a read-only (or at best
 * ephemeral) filesystem, so writing uploads into public/uploads either throws
 * EROFS or quietly vanishes on the next deploy. Detect that early and say so
 * plainly rather than letting it fail deep in fs.
 */
export function isEphemeralFilesystem() {
  return Boolean(
    process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.NETLIFY ||
      process.env.CF_PAGES,
  );
}

/** Tells the admin UI whether uploads will actually work. */
export function storageStatus() {
  const provider = storageProvider();
  if (provider === "cloudinary") {
    return { ok: true as const, provider, message: "Cloudinary is configured." };
  }
  if (isEphemeralFilesystem()) {
    return {
      ok: false as const,
      provider,
      message:
        "Image uploads are not configured. This platform has no persistent disk, so set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.",
    };
  }
  return {
    ok: true as const,
    provider,
    message: "Saving to public/uploads. Configure Cloudinary before deploying.",
  };
}

/**
 * Cloudinary signs uploads with a SHA-1 of the sorted parameters plus the API
 * secret. Doing it here rather than with the SDK keeps the dependency list
 * short and the signing logic visible.
 */
function signCloudinary(params: Record<string, string>, apiSecret: string) {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return crypto.createHash("sha1").update(toSign + apiSecret).digest("hex");
}

export async function uploadImage(file: File): Promise<StoredImage> {
  const config = cloudinaryConfig();
  if (!config) return uploadLocal(file);

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signedParams: Record<string, string> = {
    folder: config.folder,
    timestamp,
    // Cap the stored original — nobody needs a 6000px cement bag on record.
    transformation: "c_limit,w_2000,h_2000",
  };

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", config.apiKey);
  for (const [key, value] of Object.entries(signedParams)) form.append(key, value);
  form.append("signature", signCloudinary(signedParams, config.apiSecret));

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
    { method: "POST", body: form },
  );

  const body = (await response.json().catch(() => null)) as
    | { secure_url?: string; public_id?: string; error?: { message?: string } }
    | null;

  if (!response.ok || !body?.secure_url || !body.public_id) {
    throw new Error(body?.error?.message ?? `Cloudinary rejected the upload (${response.status}).`);
  }

  return { url: body.secure_url, storageId: body.public_id, provider: "cloudinary" };
}

async function uploadLocal(file: File): Promise<StoredImage> {
  if (isEphemeralFilesystem()) {
    throw new Error(
      "Image uploads need Cloudinary on this platform — its filesystem is read-only. " +
        "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET, then redeploy.",
    );
  }

  const extension = ALLOWED_IMAGE_TYPES[file.type] ?? ".bin";
  const filename = `${Date.now().toString(36)}-${crypto.randomBytes(6).toString("hex")}${extension}`;
  const directory = path.join(process.cwd(), "public", "uploads");

  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()));

  return { url: `/uploads/${filename}`, storageId: `local:${filename}`, provider: "local" };
}

/** Best-effort deletion. A storage failure must never block a catalogue edit. */
export async function removeImage(storageId: string | null | undefined) {
  if (!storageId) return;

  if (storageId.startsWith("local:")) {
    const filename = path.basename(storageId.slice("local:".length));
    await unlink(path.join(process.cwd(), "public", "uploads", filename)).catch(() => undefined);
    return;
  }

  const config = cloudinaryConfig();
  if (!config) return;

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const params = { public_id: storageId, timestamp };

  const form = new FormData();
  form.append("public_id", storageId);
  form.append("timestamp", timestamp);
  form.append("api_key", config.apiKey);
  form.append("signature", signCloudinary(params, config.apiSecret));

  await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/destroy`, {
    method: "POST",
    body: form,
  }).catch(() => undefined);
}

export { cloudinaryUrl, isCloudinary } from "@/lib/image";
