import { prisma } from "@/lib/db";
import { getCategories, getFeaturedProducts } from "@/lib/catalogue";
import { Hero } from "@/components/home/hero";
import {
  BulkSupplyBand,
  CategoryGrid,
  ClosingCta,
  DepotRates,
  Divisions,
  HowItWorks,
  SectionHeading,
  TrustStrip,
} from "@/components/home/sections";
import { ProductCard } from "@/components/shop/product-card";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featured, productCount, entryPrices, rateProducts] = await Promise.all([
    getCategories(),
    getFeaturedProducts(8),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    // Cheapest live line per counter, so the hero can show a real "from" price
    // for every category rather than a marketing number.
    prisma.product.groupBy({
      by: ["categoryId"],
      where: { status: "ACTIVE" },
      _min: { price: true },
    }),
    // The fuel desk further down the page still quotes live off the catalogue.
    prisma.product.findMany({
      where: {
        status: "ACTIVE",
        slug: { in: ["ago-diesel", "pms-petrol", "dpk-kerosene", "lpg-cylinder-12-5kg"] },
      },
      select: {
        slug: true,
        name: true,
        price: true,
        unit: true,
        stock: true,
        trackInventory: true,
      },
    }),
  ]);

  const minPrice = new Map(entryPrices.map((row) => [row.categoryId, row._min.price]));

  const catalogue = categories.map((category) => ({
    slug: category.slug,
    label: category.name,
    lines: category._count.products,
    from: minPrice.get(category.id) ?? null,
  }));

  // Keep the fuel board in the order the trade quotes them, not whatever the
  // database returns.
  const rateOrder = ["ago-diesel", "pms-petrol", "dpk-kerosene", "lpg-cylinder-12-5kg"];
  const shortNames: Record<string, string> = {
    "ago-diesel": "AGO — Diesel",
    "pms-petrol": "PMS — Petrol",
    "dpk-kerosene": "DPK — Kerosene",
    "lpg-cylinder-12-5kg": "LPG — 12.5kg",
  };
  const rates = rateOrder
    .map((slug) => rateProducts.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => ({
      slug: p.slug,
      label: shortNames[p.slug] ?? p.name,
      price: p.price,
      unit: p.unit,
      stock: p.stock,
      trackInventory: p.trackInventory,
    }));

  const ticker = categories.map((category) => ({
    label: category.name,
    value: `${category._count.products} line${category._count.products === 1 ? "" : "s"}`,
  }));

  return (
    <>
      <Hero catalogue={catalogue} ticker={ticker} productCount={productCount} />
      <TrustStrip />
      <Divisions />
      <CategoryGrid categories={categories} />
      <DepotRates rates={rates} />

      {featured.length > 0 && (
        <section className="py-20 lg:py-28">
          <div className="container-page">
            <SectionHeading
              eyebrow="Moving fastest"
              title="Featured stock"
              description="The lines our customers reorder most, held in depot and ready to dispatch."
              action={{ href: "/shop", label: "See everything" }}
            />
            <div className="mt-14 grid border-t border-l border-bone-line sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <HowItWorks />
      <BulkSupplyBand />
      <ClosingCta />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: site.legalName,
            url: process.env.NEXT_PUBLIC_SITE_URL,
            description: site.description,
            email: site.email,
            telephone: site.phone,
            foundingDate: site.incorporated,
            address: {
              "@type": "PostalAddress",
              streetAddress: `${site.address.line1}, ${site.address.line2}`,
              addressLocality: site.address.city,
              addressRegion: site.address.state,
              addressCountry: "NG",
            },
          }),
        }}
      />
    </>
  );
}
