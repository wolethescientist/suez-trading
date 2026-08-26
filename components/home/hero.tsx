import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { formatNaira } from "@/lib/money";
import { services } from "@/lib/site";

export type BoardRow = {
  slug: string;
  label: string;
  price: number;
  unit: string;
  stock: number;
  trackInventory: boolean;
};

/**
 * The hero is built around a depot rate board — the thing a fuel trader
 * actually leads with. Prices and stock come straight from the catalogue, so
 * the front page is never quoting a number the shop disagrees with.
 */
export function Hero({
  board,
  ticker,
  productCount,
}: {
  board: BoardRow[];
  ticker: { label: string; value: string }[];
  productCount: number;
}) {
  return (
    <section className="relative overflow-hidden bg-ink text-fg-ink">
      <div className="container-page">
        <div className="grid lg:grid-cols-12">
          {/* Statement */}
          <div className="border-b border-ink-line py-16 lg:col-span-7 lg:border-b-0 lg:border-r lg:py-24 lg:pr-16">
            <p className="eyebrow animate-rise text-cargo">
              Suez Trading Internationale — Abuja
            </p>

            <h1 className="animate-rise mt-8 text-[3rem] leading-[0.98] sm:text-[4rem] xl:text-[4.75rem]">
              We move what
              <br />
              Nigeria
              <br />
              <span className="relative inline-block">
                runs on.
                <svg
                  aria-hidden="true"
                  viewBox="0 0 300 12"
                  preserveAspectRatio="none"
                  className="absolute -bottom-1 left-0 h-2.5 w-full text-cargo"
                >
                  {/* Drawn by hand so the stroke has the weight of an ink mark
                      rather than a CSS rectangle. */}
                  <path
                    d="M2 8C60 3 120 2 180 4c40 1.5 78 4 118 3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="animate-rise mt-10 max-w-md text-[1.0625rem] leading-relaxed text-fg-ink-muted [animation-delay:80ms]">
              Diesel for the plant, cement for the slab, and the trucks that
              carry both. {productCount} lines held in depot, priced live, paid
              for online.
            </p>

            <div className="animate-rise mt-10 flex flex-col gap-3 sm:flex-row [animation-delay:160ms]">
              <ButtonLink href="/shop" size="lg">
                Shop the catalogue
              </ButtonLink>
              <ButtonLink href="/contact" size="lg" variant="onInk">
                Request a bulk quote
              </ButtonLink>
            </div>

            <ul className="animate-rise mt-14 flex flex-wrap gap-x-8 gap-y-3 [animation-delay:240ms]">
              {services.slice(0, 6).map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="link-slide font-label text-[0.625rem] tracking-[0.12em] text-fg-ink-muted transition-colors hover:text-cargo-lit"
                  >
                    {service.short}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Rate board */}
          <div className="flex flex-col lg:col-span-5 lg:pl-12">
            <div className="flex items-baseline justify-between border-b border-ink-line py-6">
              <p className="font-label text-[0.625rem] tracking-[0.13em] text-fg-ink">
                Depot rates
              </p>
              <span className="flex items-center gap-2 font-label text-[0.5625rem] tracking-[0.12em] text-fg-ink-muted">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
                </span>
                Live
              </span>
            </div>

            <ul className="flex-1">
              {board.map((row) => {
                const out = row.trackInventory && row.stock <= 0;
                return (
                  <li key={row.slug} className="border-b border-ink-line">
                    <Link
                      href={`/shop/${row.slug}`}
                      className="group flex items-center gap-4 py-5 transition-colors"
                    >
                      <span className="flex-1">
                        <span className="block font-display text-[1.0625rem] leading-tight transition-colors group-hover:text-cargo-lit">
                          {row.label}
                        </span>
                        <span className="mt-1 block font-label text-[0.5625rem] tracking-[0.12em] text-fg-ink-muted">
                          {out
                            ? "Out of stock"
                            : row.trackInventory
                              ? `${row.stock.toLocaleString()} available`
                              : "Available"}
                        </span>
                      </span>

                      <span className="text-right">
                        <span className="tnum block font-mono text-[1.0625rem] text-cargo-lit">
                          {formatNaira(row.price)}
                        </span>
                        <span className="mt-1 block font-label text-[0.5625rem] tracking-[0.12em] text-fg-ink-muted">
                          {row.unit === "each" ? "each" : row.unit.replace("per ", "per ")}
                        </span>
                      </span>

                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-fg-ink-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cargo-lit" />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <p className="py-5 text-[0.75rem] leading-relaxed text-fg-ink-muted">
              Petroleum pricing moves with the market. The rate shown when you
              pay is the rate you get.
            </p>
          </div>
        </div>
      </div>

      {/* Stock ticker — a depot board strip running under the fold line. */}
      <div className="border-y border-ink-line bg-ink-2">
        <div className="group flex overflow-hidden py-3">
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              aria-hidden={copy === 1}
              className="flex shrink-0 animate-ticker items-center gap-10 pr-10 group-hover:[animation-play-state:paused]"
            >
              {ticker.map((item) => (
                <li key={`${copy}-${item.label}`} className="flex items-center gap-3 whitespace-nowrap">
                  <span className="h-1 w-1 rounded-full bg-cargo" />
                  <span className="font-label text-[0.625rem] tracking-[0.13em] text-fg-ink-muted">
                    {item.label}
                  </span>
                  <span className="tnum font-mono text-[0.6875rem] text-fg-ink">
                    {item.value}
                  </span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
