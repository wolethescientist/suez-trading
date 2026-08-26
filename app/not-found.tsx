import Link from "next/link";
import { site } from "@/lib/site";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink px-6 text-center text-white">

      <div className="relative">
        <p className="font-mono text-[0.75rem] font-bold uppercase tracking-[0.25em] text-cargo">
          Error 404
        </p>
        <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] sm:text-6xl">
          This page is not
          <br />
          on our manifest.
        </h1>
        <p className="mx-auto mt-6 max-w-md text-[1.0625rem] leading-relaxed text-fg-ink-muted">
          The page you asked for has moved, been retired, or never existed.
          Everything we sell is still one click away.
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-sm bg-cargo px-6 font-display text-sm font-semibold text-ink transition-colors hover:bg-cargo-lit"
          >
            Back to home
          </Link>
          <Link
            href="/shop"
            className="inline-flex h-12 items-center justify-center rounded-sm border border-white/25 px-6 font-display text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white hover:text-ink"
          >
            Browse the shop
          </Link>
        </div>

        <p className="mt-10 text-[0.8125rem] text-fg-ink-muted">
          Need a hand? Call {site.phone} or{" "}
          <Link href="/contact" className="text-cargo underline underline-offset-4">
            send us a message
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
