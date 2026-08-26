import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  storageProvider,
  uploadImage,
} from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `Images must be ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)}MB or smaller.` },
      { status: 413 },
    );
  }
  if (!ALLOWED_IMAGE_TYPES[file.type]) {
    return NextResponse.json(
      { error: "Use a JPG, PNG, WebP, AVIF or SVG image." },
      { status: 415 },
    );
  }

  try {
    const stored = await uploadImage(file);
    return NextResponse.json(stored);
  } catch (error) {
    console.error("Image upload failed", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : `Could not store the image (${storageProvider()}).`,
      },
      { status: 502 },
    );
  }
}
