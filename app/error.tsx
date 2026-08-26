"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production this is where an error reporter (Sentry, Axiom) would go.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bone px-6 text-center">
      <p className="font-mono text-[0.75rem] font-bold uppercase tracking-[0.25em] text-cargo">
        Something went wrong
      </p>
      <h1 className="mt-5 max-w-lg text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
        We hit a problem loading this page.
      </h1>
      <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-fg-bone-muted">
        The fault has been logged. Try again — if it keeps happening, contact us
        and quote the reference below.
      </p>
      {error.digest && (
        <code className="mt-4 rounded-sm bg-white px-3 py-1.5 font-mono text-[0.75rem] text-ink-3">
          {error.digest}
        </code>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={reset}
          className="inline-flex h-12 items-center justify-center rounded-sm bg-cargo px-6 font-display text-sm font-semibold text-ink transition-colors hover:bg-cargo-lit"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center rounded-sm border border-ink/20 px-6 font-display text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
