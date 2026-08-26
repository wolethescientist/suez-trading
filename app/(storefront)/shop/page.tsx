import type { Metadata } from "next";
import { Suspense } from "react";
import { PackageX } from "lucide-react";
import { getCategories, listProducts } from "@/lib/catalogue";
import { ProductCard } from "@/components/shop/product-card";
import { ShopFilters } from "@/components/shop/filters";
import { Pagination } from "@/components/shop/pagination";
import { ButtonLink } from "@/components/ui/button";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Order petroleum products, lubricants, building materials, beverages, appliances and safety equipment online. Live stock, Paystack checkout, nationwide delivery.",
};

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  const [categories, totalActive] = await Promise.all([
    getCategories(),
    prisma.product.count({ where: { status: "ACTIVE" } }),
  ]);

  const { items, total, page, pages } = await listProducts({
    category: params.category,
    q: params.q,
    sort: params.sort,
    inStock: params.inStock === "1",
    page: Number(params.page) || 1,
    perPage: 12,
  });

  const activeCategory = categories.find((c) => c.slug === params.category);

  return (
    <>
      <section className="border-b border-bone-line bg-ink text-white">
        <div className="absolute inset-0" />
        <div className="container-page py-14 lg:py-18">
          <p className="eyebrow text-cargo">
            {activeCategory ? "Category" : "Full catalogue"}
          </p>
          <h1 className="mt-4 text-3xl font-extrabold sm:text-[2.75rem]">
            {activeCategory ? activeCategory.name : "Shop Suez Trading"}
          </h1>
          <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-fg-ink-muted">
            {activeCategory?.description ??
              "Live stock across six categories. Quantities shown are what we are physically holding — add to cart and pay securely with Paystack."}
          </p>
        </div>
      </section>

      <section className="container-page py-10 lg:py-14">
        <Suspense fallback={<div className="h-24" />}>
          <ShopFilters categories={categories} total={totalActive} />
        </Suspense>

        <p className="mt-8 text-[0.8125rem] text-fg-bone-muted">
          Showing <span className="tnum font-semibold text-ink">{items.length}</span> of{" "}
          <span className="tnum font-semibold text-ink">{total}</span> product
          {total === 1 ? "" : "s"}
          {params.q && (
            <>
              {" "}for “<span className="font-semibold text-ink">{params.q}</span>”
            </>
          )}
        </p>

        {items.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-4 rounded-sm border border-dashed border-bone-line bg-bone py-20 text-center">
            <PackageX className="h-8 w-8 text-fg-bone-muted" />
            <div>
              <p className="font-display text-lg font-bold text-ink">Nothing matched</p>
              <p className="mt-1.5 max-w-sm text-sm text-fg-bone-muted">
                Try a different search or clear the filters. If you need something we do not
                list, ask us for a quote — we source to order.
              </p>
            </div>
            <div className="mt-2 flex gap-2">
              <ButtonLink href="/shop" size="sm" variant="outline">
                Clear filters
              </ButtonLink>
              <ButtonLink href="/contact" size="sm">
                Request a quote
              </ButtonLink>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid border-t border-l border-bone-line sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <Pagination page={page} pages={pages} searchParams={params} />
      </section>
    </>
  );
}
