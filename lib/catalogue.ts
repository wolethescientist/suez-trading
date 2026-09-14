import "server-only";
import { CATEGORIES, PRODUCTS, withCategory } from "@/lib/catalogue-data";

/**
 * Catalogue reads, served from the repository rather than from Postgres.
 *
 * Every function keeps the signature and the row shape the database version
 * returned, so pages, cards and metadata did not change when the database came
 * out. The Prisma implementation is preserved verbatim at the bottom of this
 * file: restoring it is uncommenting that block, deleting the static one above
 * it, and setting DATABASE_URL.
 */

export type ProductFilters = {
  category?: string;
  q?: string;
  sort?: string;
  min?: number; // kobo
  max?: number; // kobo
  inStock?: boolean;
  page?: number;
  perPage?: number;
};

const active = () => PRODUCTS.filter((p) => p.status === "ACTIVE").map(withCategory);

type Card = ReturnType<typeof withCategory>;

const SORTERS: Record<string, (a: Card, b: Card) => number> = {
  featured: (a, b) =>
    Number(b.featured) - Number(a.featured) || b.createdAt.getTime() - a.createdAt.getTime(),
  newest: (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  name: (a, b) => a.name.localeCompare(b.name),
};

export async function listProducts(filters: ProductFilters = {}) {
  const perPage = filters.perPage ?? 12;
  const page = Math.max(1, filters.page ?? 1);
  const needle = filters.q?.trim().toLowerCase();

  const matched = active()
    .filter((p) => (filters.category ? p.category.slug === filters.category : true))
    .filter((p) => (filters.inStock ? p.stock > 0 : true))
    .filter((p) => (filters.min !== undefined ? p.price >= filters.min : true))
    .filter((p) => (filters.max !== undefined ? p.price <= filters.max : true))
    .filter((p) =>
      needle
        ? [p.name, p.sku, p.brand, p.shortDescription]
            .filter(Boolean)
            .some((field) => field!.toLowerCase().includes(needle))
        : true,
    )
    .sort(SORTERS[filters.sort ?? "featured"] ?? SORTERS.featured);

  const total = matched.length;
  const items = matched.slice((page - 1) * perPage, page * perPage);

  return { items, total, page, perPage, pages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function getProductBySlug(slug: string) {
  const product = PRODUCTS.find((p) => p.slug === slug && p.status !== "ARCHIVED");
  return product ? withCategory(product) : null;
}

export async function getRelatedProducts(categoryId: string, excludeId: string, take = 4) {
  return active()
    .filter((p) => p.categoryId === categoryId && p.id !== excludeId)
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, take);
}

export async function getFeaturedProducts(take = 8) {
  return active()
    .filter((p) => p.featured)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, take);
}

export async function getCategories() {
  return CATEGORIES.filter((c) => c.active)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((category) => ({
      ...category,
      _count: {
        products: PRODUCTS.filter((p) => p.categoryId === category.id && p.status === "ACTIVE")
          .length,
      },
    }));
}

/** Named lookup, for boards that quote a fixed set of lines (the fuel desk). */
export async function getProductsBySlugs(slugs: string[]) {
  return active().filter((p) => slugs.includes(p.slug));
}

/** How many lines the shop is actually holding — the counter under the filters. */
export async function countActiveProducts() {
  return PRODUCTS.filter((p) => p.status === "ACTIVE").length;
}

export type ProductCardData = Awaited<ReturnType<typeof getFeaturedProducts>>[number];

/* ===========================================================================
 * DATABASE VERSION — kept for the day the catalogue outgrows the repository.
 *
 * To switch back: uncomment this block, delete the static implementation
 * above, restore `import { prisma } from "@/lib/db"` plus the Prisma types,
 * set DATABASE_URL, and run `npx prisma migrate deploy && npx prisma db seed`.
 * Everything else in the app — pages, cards, cart, admin — reads these same
 * function names and row shapes.
 * ---------------------------------------------------------------------------
 *
 * import { prisma } from "@/lib/db";
 * import type { Prisma } from "@/lib/generated/prisma/client";
 *
 * const ORDER_BY: Record<string, Record<string, "asc" | "desc">[]> = {
 *   featured: [{ featured: "desc" }, { createdAt: "desc" }],
 *   newest: [{ createdAt: "desc" }],
 *   "price-asc": [{ price: "asc" }],
 *   "price-desc": [{ price: "desc" }],
 *   name: [{ name: "asc" }],
 * };
 *
 * export async function listProducts(filters: ProductFilters = {}) {
 *   const perPage = filters.perPage ?? 12;
 *   const page = Math.max(1, filters.page ?? 1);
 *
 *   const where: Prisma.ProductWhereInput = {
 *     status: "ACTIVE",
 *     ...(filters.category ? { category: { slug: filters.category } } : {}),
 *     ...(filters.inStock ? { stock: { gt: 0 } } : {}),
 *     ...(filters.min !== undefined || filters.max !== undefined
 *       ? {
 *           price: {
 *             ...(filters.min !== undefined ? { gte: filters.min } : {}),
 *             ...(filters.max !== undefined ? { lte: filters.max } : {}),
 *           },
 *         }
 *       : {}),
 *     ...(filters.q
 *       ? {
 *           OR: [
 *             { name: { contains: filters.q, mode: "insensitive" } },
 *             { sku: { contains: filters.q, mode: "insensitive" } },
 *             { brand: { contains: filters.q, mode: "insensitive" } },
 *             { shortDescription: { contains: filters.q, mode: "insensitive" } },
 *           ],
 *         }
 *       : {}),
 *   };
 *
 *   const [items, total] = await Promise.all([
 *     prisma.product.findMany({
 *       where,
 *       include: {
 *         category: { select: { name: true, slug: true } },
 *         images: { orderBy: { sortOrder: "asc" }, take: 1 },
 *       },
 *       orderBy: ORDER_BY[filters.sort ?? "featured"] ?? ORDER_BY.featured,
 *       skip: (page - 1) * perPage,
 *       take: perPage,
 *     }),
 *     prisma.product.count({ where }),
 *   ]);
 *
 *   return { items, total, page, perPage, pages: Math.max(1, Math.ceil(total / perPage)) };
 * }
 *
 * export async function getProductBySlug(slug: string) {
 *   return prisma.product.findFirst({
 *     where: { slug, status: { not: "ARCHIVED" } },
 *     include: {
 *       category: true,
 *       images: { orderBy: { sortOrder: "asc" } },
 *     },
 *   });
 * }
 *
 * export async function getRelatedProducts(categoryId: string, excludeId: string, take = 4) {
 *   return prisma.product.findMany({
 *     where: { categoryId, status: "ACTIVE", id: { not: excludeId } },
 *     include: {
 *       images: { orderBy: { sortOrder: "asc" }, take: 1 },
 *       category: { select: { slug: true, name: true } },
 *     },
 *     orderBy: { featured: "desc" },
 *     take,
 *   });
 * }
 *
 * export async function getFeaturedProducts(take = 8) {
 *   return prisma.product.findMany({
 *     where: { status: "ACTIVE", featured: true },
 *     include: {
 *       images: { orderBy: { sortOrder: "asc" }, take: 1 },
 *       category: { select: { slug: true, name: true } },
 *     },
 *     orderBy: { createdAt: "desc" },
 *     take,
 *   });
 * }
 *
 * export async function getCategories() {
 *   return prisma.category.findMany({
 *     where: { active: true },
 *     orderBy: { sortOrder: "asc" },
 *     include: { _count: { select: { products: { where: { status: "ACTIVE" } } } } },
 *   });
 * }
 *
 * export async function countActiveProducts() {
 *   return prisma.product.count({ where: { status: "ACTIVE" } });
 * }
 * =========================================================================== */
