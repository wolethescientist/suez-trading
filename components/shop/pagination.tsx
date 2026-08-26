import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pages,
  searchParams,
}: {
  page: number;
  pages: number;
  searchParams: Record<string, string | undefined>;
}) {
  if (pages <= 1) return null;

  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v && k !== "page") sp.set(k, v);
    }
    if (p > 1) sp.set("page", String(p));
    return `/shop${sp.toString() ? `?${sp}` : ""}`;
  };

  const numbers = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pages || Math.abs(p - page) <= 1,
  );

  return (
    <nav aria-label="Pagination" className="mt-14 flex items-center justify-center gap-1.5">
      <PageLink href={href(page - 1)} disabled={page === 1} aria-label="Previous page">
        <ChevronLeft className="h-4 w-4" />
      </PageLink>

      {numbers.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5">
          {i > 0 && numbers[i - 1] !== p - 1 && (
            <span className="px-1 text-fg-bone-muted">…</span>
          )}
          <Link
            href={href(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "tnum grid h-9 min-w-9 place-items-center rounded-sm border px-2 font-display text-[0.8125rem] font-semibold transition-colors",
              p === page
                ? "border-ink bg-ink text-white"
                : "border-bone-line bg-white text-ink-3 hover:bg-bone",
            )}
          >
            {p}
          </Link>
        </span>
      ))}

      <PageLink href={href(page + 1)} disabled={page === pages} aria-label="Next page">
        <ChevronRight className="h-4 w-4" />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  children,
  ...rest
}: {
  href: string;
  disabled?: boolean;
  children: React.ReactNode;
} & React.ComponentProps<"a">) {
  const cls =
    "grid h-9 w-9 place-items-center rounded-sm border border-bone-line bg-white text-ink-3 transition-colors hover:bg-bone";
  if (disabled) {
    return (
      <span className={cn(cls, "pointer-events-none opacity-40")} {...rest}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}
