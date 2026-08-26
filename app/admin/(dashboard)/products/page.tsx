import { ProductImage } from "@/components/shop/product-image";
import Link from "next/link";
import { Package, Plus, Search, Star } from "lucide-react";
import { prisma } from "@/lib/db";
import type { Prisma, ProductStatus } from "@/lib/generated/prisma/client";
import { requireAdmin } from "@/lib/auth";
import { formatNaira } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, EmptyState, PageHeader } from "@/components/admin/page-header";
import { toggleFeatured } from "@/app/admin/actions/products";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PER_PAGE = 20;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const q = params.q?.trim();
  const status = params.status;
  const category = params.category;

  const where: Prisma.ProductWhereInput = {
    ...(status && status !== "ALL" ? { status: status as ProductStatus } : {}),
    ...(category ? { category: { slug: category } } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
            { brand: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [products, total, categories, statusCounts] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
      orderBy: [{ updatedAt: "desc" }],
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.product.groupBy({ by: ["status"], _count: true }),
  ]);

  const counts = Object.fromEntries(statusCounts.map((s) => [s.status, s._count]));
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  const buildHref = (patch: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...params, ...patch })) {
      if (v) sp.set(k, v);
    }
    sp.delete("page");
    return `/admin/products${sp.toString() ? `?${sp}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Products"
        description="Every line in the catalogue — pricing, stock and where it shows on the storefront."
        actions={
          <ButtonLink href="/admin/products/new" size="sm">
            <Plus className="h-4 w-4" />
            Add product
          </ButtonLink>
        }
      />

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-bone-line p-4">
          <form action="/admin/products" className="flex flex-1 flex-wrap items-center gap-2">
            {status && <input type="hidden" name="status" value={status} />}
            <div className="relative min-w-52 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-bone-muted" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Search name, SKU or brand…"
                aria-label="Search products"
                className="h-9 w-full rounded-sm border border-bone-line bg-white pl-9 pr-3 text-[0.8125rem] placeholder:text-fg-bone-muted focus:border-fg-bone focus:outline-none"
              />
            </div>
            <select
              name="category"
              defaultValue={category ?? ""}
              aria-label="Filter by category"
              className="h-9 rounded-sm border border-bone-line bg-white px-2.5 text-[0.8125rem] focus:outline-none"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="h-9 rounded-sm border border-bone-line bg-white px-3 font-display text-[0.8125rem] font-semibold text-ink transition-colors hover:bg-bone"
            >
              Apply
            </button>
          </form>

          <div className="flex flex-wrap gap-1.5">
            {[
              { value: "ALL", label: `All (${Object.values(counts).reduce((a, b) => a + b, 0)})` },
              { value: "ACTIVE", label: `Active (${counts.ACTIVE ?? 0})` },
              { value: "DRAFT", label: `Draft (${counts.DRAFT ?? 0})` },
              { value: "ARCHIVED", label: `Archived (${counts.ARCHIVED ?? 0})` },
            ].map((tab) => (
              <Link
                key={tab.value}
                href={buildHref({ status: tab.value === "ALL" ? undefined : tab.value })}
                className={cn(
                  "rounded-sm border px-2.5 py-1.5 font-display text-[0.75rem] font-semibold transition-colors",
                  (status ?? "ALL") === tab.value
                    ? "border-ink bg-ink text-white"
                    : "border-bone-line bg-white text-ink-3 hover:bg-bone",
                )}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>

        {products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products found"
            description="Nothing matches these filters. Clear them, or add your first product."
            action={
              <ButtonLink href="/admin/products/new" size="sm">
                Add product
              </ButtonLink>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-4xl text-left text-[0.8125rem]">
              <thead className="border-b border-bone-line text-[0.6875rem] uppercase tracking-wider text-fg-bone-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 text-right font-semibold">Price</th>
                  <th className="px-4 py-3 text-right font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-center font-semibold">Featured</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bone-line">
                {products.map((product) => {
                  const low =
                    product.trackInventory && product.stock <= product.lowStockThreshold;
                  return (
                    <tr key={product.id} className="transition-colors hover:bg-bone">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 flex-none overflow-hidden rounded-sm border border-bone-line bg-bone">
                            {product.images[0] && (
                              <ProductImage
                                src={product.images[0].url}
                                alt=""
                                width={40}
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/products/${product.id}`}
                              className="block truncate font-display font-semibold text-ink hover:text-cargo"
                            >
                              {product.name}
                            </Link>
                            <span className="font-mono text-[0.6875rem] text-fg-bone-muted">
                              {product.sku}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-fg-bone-muted">{product.category.name}</td>
                      <td className="tnum px-4 py-3 text-right font-semibold">
                        {formatNaira(product.price)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {product.trackInventory ? (
                          <span
                            className={cn(
                              "tnum font-display font-bold",
                              product.stock <= 0
                                ? "text-alert"
                                : low
                                  ? "text-cargo"
                                  : "text-ink",
                            )}
                          >
                            {product.stock.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-fg-bone-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          tone={
                            product.status === "ACTIVE"
                              ? "success"
                              : product.status === "DRAFT"
                                ? "warning"
                                : "neutral"
                          }
                        >
                          {product.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <form action={toggleFeatured}>
                          <input type="hidden" name="id" value={product.id} />
                          <button
                            type="submit"
                            aria-label={
                              product.featured ? "Remove from featured" : "Mark as featured"
                            }
                            className="rounded-sm p-1.5 transition-colors hover:bg-bone-line"
                          >
                            <Star
                              className={cn(
                                "h-4 w-4",
                                product.featured
                                  ? "fill-cargo text-cargo"
                                  : "text-fg-bone-muted",
                              )}
                            />
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-bone-line px-4 py-3 text-[0.8125rem]">
            <span className="text-fg-bone-muted">
              Page {page} of {pages} · {total} products
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`${buildHref({})}${buildHref({}).includes("?") ? "&" : "?"}page=${page - 1}`}
                  className="rounded-sm border border-bone-line px-3 py-1.5 font-semibold hover:bg-bone"
                >
                  Previous
                </Link>
              )}
              {page < pages && (
                <Link
                  href={`${buildHref({})}${buildHref({}).includes("?") ? "&" : "?"}page=${page + 1}`}
                  className="rounded-sm border border-bone-line px-3 py-1.5 font-semibold hover:bg-bone"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
