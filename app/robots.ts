import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Nothing here is secret, but there is no reason to index a customer's
      // cart, checkout or receipt.
      disallow: ["/admin", "/admin/", "/api/", "/cart", "/checkout", "/order/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
