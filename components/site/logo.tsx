import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Wordmark only — Zodiak for the group name, Switzer label for the
 * subsidiary, matching Suez Electric and Suez Gas.
 */
export function Logo({
  className,
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  const text = tone === "light" ? "text-fg-ink" : "text-fg-bone";
  const sub = tone === "light" ? "text-fg-ink-muted" : "text-fg-bone-muted";

  return (
    <Link href="/" className={cn("group inline-flex items-baseline gap-2.5", className)}>
      <span className={cn("font-display text-[1.375rem] leading-none tracking-tight", text)}>
        Suez
      </span>
      <span
        className={cn(
          "font-label text-[0.625rem] tracking-[0.16em] transition-colors group-hover:text-cargo",
          sub,
        )}
      >
        Trading
      </span>
    </Link>
  );
}
