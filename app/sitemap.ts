import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { services } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({ where: { active: true }, select: { slug: true } }),
  ]);

  const staticPages = [
    { path: "", priority: 1 },
    { path: "/shop", priority: 0.9 },
    { path: "/services", priority: 0.8 },
    { path: "/about", priority: 0.7 },
    { path: "/contact", priority: 0.7 },
    { path: "/faq", priority: 0.5 },
    { path: "/track", priority: 0.4 },
    { path: "/legal/terms", priority: 0.3 },
    { path: "/legal/privacy", priority: 0.3 },
    { path: "/legal/shipping", priority: 0.4 },
  ];

  return [
    ...staticPages.map((page) => ({
      url: `${base}${page.path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: page.priority,
    })),
    ...services.map((service) => ({
      url: `${base}/services/${service.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...categories.map((category) => ({
      url: `${base}/shop?category=${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
    ...products.map((product) => ({
      url: `${base}/shop/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];
}
