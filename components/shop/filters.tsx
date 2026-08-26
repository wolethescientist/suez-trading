"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string; slug: string; _count: { products: number } };

const sorts = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name A–Z" },
];

export function ShopFilters({
  categories,
  total,
}: {
  categories: Category[];
  total: number;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [open, setOpen] = useState(false);
  const first = useRef(true);

  const activeCategory = params.get("category") ?? "";
  const activeSort = params.get("sort") ?? "featured";
  const inStockOnly = params.get("inStock") === "1";

  function push(next: Record<string, string | null>) {
    const sp = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === null || value === "") sp.delete(key);
      else sp.set(key, value);
    }
    sp.delete("page"); // any filter change resets pagination
    router.push(`/shop${sp.toString() ? `?${sp}` : ""}`, { scroll: false });
  }

  // Debounce the search box so typing does not fire a request per keystroke.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => push({ q: query || null }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const hasFilters = Boolean(activeCategory || query || inStockOnly || activeSort !== "featured");

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-bone-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, SKU or brand…"
            aria-label="Search products"
            className="h-11 w-full rounded-sm border border-bone-line bg-white pl-10 pr-4 text-sm placeholder:text-fg-bone-muted focus:border-fg-bone focus:outline-none focus:ring-2 focus:ring-fg-bone/15"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="sort">
            Sort products
          </label>
          <select
            id="sort"
            value={activeSort}
            onChange={(e) => push({ sort: e.target.value === "featured" ? null : e.target.value })}
            className="h-11 rounded-sm border border-bone-line bg-white px-3 text-sm focus:border-fg-bone focus:outline-none"
          >
            {sorts.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-11 items-center gap-2 rounded-sm border border-bone-line bg-white px-3.5 text-sm font-semibold lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>
      </div>

      <div className={cn("flex flex-wrap items-center gap-2", !open && "hidden lg:flex")}>
        <FilterChip active={!activeCategory} onClick={() => push({ category: null })}>
          All ({total})
        </FilterChip>
        {categories.map((c) => (
          <FilterChip
            key={c.id}
            active={activeCategory === c.slug}
            onClick={() => push({ category: activeCategory === c.slug ? null : c.slug })}
          >
            {c.name} ({c._count.products})
          </FilterChip>
        ))}

        <span className="mx-1 hidden h-5 w-px bg-bone-line sm:block" />

        <FilterChip active={inStockOnly} onClick={() => push({ inStock: inStockOnly ? null : "1" })}>
          In stock only
        </FilterChip>

        {hasFilters && (
          <button
            onClick={() => {
              setQuery("");
              router.push("/shop", { scroll: false });
            }}
            className="ml-auto flex items-center gap-1.5 text-[0.8125rem] font-semibold text-fg-bone-muted hover:text-alert"
          >
            <X className="h-3.5 w-3.5" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-sm border px-3 py-1.5 font-display text-[0.75rem] font-semibold transition-colors",
        active
          ? "border-ink bg-ink text-white"
          : "border-bone-line bg-white text-ink-3 hover:border-fg-bone-muted hover:bg-bone",
      )}
    >
      {children}
    </button>
  );
}
