import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { ProductImage } from "@/components/shop/product-image";
import { services } from "@/lib/site";

/**
 * A statement hero, deliberately without a data panel: Suez trades general
 * goods, so the front page opens on the yard rather than on a price board.
 * Live pricing belongs to the shop and to the fuel desk further down the page.
 */
export function Hero({
  image,
  ticker,
  productCount,
}: {
  image: string | null;
  ticker: { label: string; value: string }[];
  productCount: number;
}) {
  return (
    <section className="relative overflow-hidden bg-ink text-fg-ink">
      {/* Statement and yard share one box so the image spans the hero body
          only — the ticker keeps its own full-width strip below. */}
      <div className="relative">
      <div className="container-page relative z-10">
        <div className="max-w-2xl py-16 lg:py-32">
          <p className="eyebrow animate-rise text-cargo">
            Suez Trading Internationale — Abuja
          </p>

          <h1 className="animate-rise mt-8 text-[3rem] leading-[0.98] sm:text-[4rem] xl:text-[4.75rem]">
            One supplier
            <br />
            for the whole
            <br />
            <span className="relative inline-block">
              list.
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

          <p className="animate-rise mt-10 max-w-lg text-[1.0625rem] leading-relaxed text-fg-ink-muted [animation-delay:80ms]">
            Cement and rods for the site, drinks and consumables for the office,
            generators, tools, safety kit — and the fuel and trucks that keep it
            all moving. {productCount} lines held in depot and delivered
            nationwide.
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
      </div>

      {/* The yard. Below lg it sits under the statement; from lg it bleeds off
          the right edge and the gradient carries it back into the ink. */}
      {image && (
        <div className="relative h-64 w-full sm:h-80 lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[46%]">
          <ProductImage
            src={image}
            alt=""
            width={900}
            sizes="(max-width: 1024px) 100vw, 46vw"
            priority
            className="object-cover opacity-65"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/10 lg:bg-gradient-to-r lg:from-ink lg:via-ink/40 lg:to-ink/5" />
        </div>
      )}
      </div>

      {/* Stock ticker — a depot board strip running under the fold line. */}
      <div className="relative z-10 border-y border-ink-line bg-ink-2">
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
