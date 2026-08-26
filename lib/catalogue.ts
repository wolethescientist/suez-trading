import "server-only";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";

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

const ORDER_BY: Record<string, Record<string, "asc" | "desc">[]> = {
  featured: [{ featured: "desc" }, { createdAt: "desc" }],
  newest: [{ createdAt: "desc" }],
  "price-asc": [{ price: "asc" }],
  "price-desc": [{ price: "desc" }],
  name: [{ name: "asc" }],
};

export async function listProducts(filters: ProductFilters = {}) {
  const perPage = filters.perPage ?? 12;
  const page = Math.max(1, filters.page ?? 1);

  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    ...(filters.category ? { category: { slug: filters.category } } : {}),
    ...(filters.inStock ? { stock: { gt: 0 } } : {}),
    ...(filters.min !== undefined || filters.max !== undefined
      ? {
          price: {
            ...(filters.min !== undefined ? { gte: filters.min } : {}),
            ...(filters.max !== undefined ? { lte: filters.max } : {}),
          },
        }
      : {}),
    ...(filters.q
      ? {
          OR: [
            { name: { contains: filters.q, mode: "insensitive" } },
            { sku: { contains: filters.q, mode: "insensitive" } },
            { brand: { contains: filters.q, mode: "insensitive" } },
            { shortDescription: { contains: filters.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
      orderBy: ORDER_BY[filters.sort ?? "featured"] ?? ORDER_BY.featured,
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, perPage, pages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, status: { not: "ARCHIVED" } },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getRelatedProducts(categoryId: string, excludeId: string, take = 4) {
  return prisma.product.findMany({
    where: { categoryId, status: "ACTIVE", id: { not: excludeId } },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, category: { select: { slug: true, name: true } } },
    orderBy: { featured: "desc" },
    take,
  });
}

export async function getFeaturedProducts(take = 8) {
  return prisma.product.findMany({
    where: { status: "ACTIVE", featured: true },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, category: { select: { slug: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getCategories() {
  return prisma.category.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: { where: { status: "ACTIVE" } } } } },
  });
}

export type ProductCardData = Awaited<ReturnType<typeof getFeaturedProducts>>[number];
