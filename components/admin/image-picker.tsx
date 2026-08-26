"use client";

import Image from "next/image";
import { cloudinaryUrl, isCloudinary } from "@/lib/image";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Field, inputClass } from "@/components/ui/field";

export function ImagePicker({
  name,
  defaultValue,
  defaultStorageId,
}: {
  name: string;
  defaultValue?: string;
  defaultStorageId?: string | null;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [storageId, setStorageId] = useState(defaultStorageId ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setError(null);
    setUploading(true);
    const body = new FormData();
    body.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
      } else {
        setUrl(data.url);
        setStorageId(data.storageId ?? "");
      }
    } catch {
      setError("Upload failed — check your connection.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={url} />
      <input type="hidden" name={`${name}StorageId`} value={storageId} />

      <div className="flex items-start gap-4">
        <div className="relative h-28 w-28 flex-none overflow-hidden rounded-sm border border-bone-line bg-bone">
          {url ? (
            <>
              <Image
                src={cloudinaryUrl(url, 224)}
                alt=""
                fill
                sizes="112px"
                unoptimized={isCloudinary(url) || url.endsWith(".svg")}
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setUrl("");
                  setStorageId("");
                }}
                aria-label="Remove image"
                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-sm bg-ink/80 text-white transition-colors hover:bg-alert"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <div className="grid h-full place-items-center text-fg-bone-muted">
              <ImagePlus className="h-6 w-6" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex h-9 items-center gap-2 rounded-sm border border-bone-line bg-white px-3.5 font-display text-[0.8125rem] font-semibold text-ink transition-colors hover:bg-bone disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…
              </>
            ) : (
              <>
                <ImagePlus className="h-3.5 w-3.5" /> Upload image
              </>
            )}
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload(file);
              e.target.value = "";
            }}
          />

          <Field label="…or paste an image path" htmlFor={`${name}-url`} hint="JPG, PNG, WebP, AVIF or SVG. Max 4MB.">
            <input
              id={`${name}-url`}
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                // A hand-typed path is not something we own, so forget any
                // storage id from a previous upload.
                setStorageId("");
              }}
              placeholder="/products/example.svg"
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      {error && <p className="text-xs text-alert">{error}</p>}
    </div>
  );
}
