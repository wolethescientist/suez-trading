import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Package, ShieldCheck, Truck, Undo2 } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalogue";
import { formatNaira } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { QuantityAdd } from "@/components/shop/quantity-add";
import { ProductImage } from "@/components/shop/product-image";
import { ProductCard } from "@/components/shop/product-card";
import { SectionHeading } from "@/components/home/sections";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.shortDescription ?? undefined,
    openGraph: {
      title: product.name,
      description: product.shortDescription ?? undefined,
      images: product.images[0]?.url ? [product.images[0].url] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || product.status === "DRAFT") notFound();

  const [related, settings] = await Promise.all([
    getRelatedProducts(product.categoryId, product.id),
    getSettings(),
  ]);

  const image = product.images[0]?.url ?? "/products/placeholder.svg";
  const outOfStock = product.trackInventory && product.stock <= 0 && !product.allowBackorder;
  const low = !outOfStock && product.trackInventory && product.stock <= product.lowStockThreshold;
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <>
      <nav aria-label="Breadcrumb" className="border-b border-bone-line bg-bone">
        <ol className="container-page flex flex-wrap items-center gap-1.5 py-3.5 text-[0.8125rem] text-fg-bone-muted">
          <li><Link href="/" className="hover:text-ink">Home</Link></li>
          <ChevronRight className="h-3.5 w-3.5" />
          <li><Link href="/shop" className="hover:text-ink">Shop</Link></li>
          <ChevronRight className="h-3.5 w-3.5" />
          <li>
            <Link href={`/shop?category=${product.category.slug}`} className="hover:text-ink">
              {product.category.name}
            </Link>
          </li>
          <ChevronRight className="h-3.5 w-3.5" />
          <li className="font-semibold text-ink">{product.name}</li>
        </ol>
      </nav>

      <section className="container-page grid gap-12 py-12 lg:grid-cols-2 lg:gap-16 lg:py-16">
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-sm border border-bone-line bg-bone">
            <ProductImage
              src={image}
              alt={product.name}
              width={800}
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute left-4 top-4 flex flex-col items-start gap-2">
              {onSale && (
                <Badge tone="amber">
                  Save {formatNaira(product.compareAtPrice! - product.price)}
                </Badge>
              )}
              {outOfStock && <Badge tone="danger">Out of stock</Badge>}
              {low && <Badge tone="warning">Only {product.stock} left</Badge>}
            </div>
          </div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-square overflow-hidden rounded-sm border border-bone-line bg-bone"
                >
                  <ProductImage
                    src={img.url}
                    alt={img.alt ?? ""}
                    width={120}
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <Link
            href={`/shop?category=${product.category.slug}`}
            className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-cargo"
          >
            {product.category.name}
          </Link>

          <h1 className="mt-3 text-3xl font-extrabold leading-[1.08] text-ink sm:text-[2.5rem]">
            {product.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.8125rem] text-fg-bone-muted">
            <span className="font-mono">SKU {product.sku}</span>
            {product.brand && (
              <span>
                Brand: <span className="font-semibold text-ink-2">{product.brand}</span>
              </span>
            )}
            {!outOfStock ? (
              <span className="flex items-center gap-1.5 font-semibold text-signal">
                <span className="h-1.5 w-1.5 rounded-full bg-signal" />
                {product.trackInventory
                  ? `${product.stock.toLocaleString()} in stock`
                  : "Available"}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 font-semibold text-alert">
                <span className="h-1.5 w-1.5 rounded-full bg-alert" />
                Out of stock
              </span>
            )}
          </div>

          <p className="mt-6 text-[1.0625rem] leading-relaxed text-ink-3">
            {product.shortDescription}
          </p>

          <div className="mt-7 flex flex-wrap items-end gap-3 border-y border-bone-line py-6">
            <span className="tnum font-display text-4xl font-extrabold leading-none text-ink">
              {formatNaira(product.price)}
            </span>
            {product.unit !== "each" && (
              <span className="pb-1 text-sm text-fg-bone-muted">{product.unit}</span>
            )}
            {onSale && (
              <span className="tnum pb-1 text-sm text-fg-bone-muted line-through">
                {formatNaira(product.compareAtPrice!)}
              </span>
            )}
          </div>

          <div className="mt-7">
            {settings.ordersOpen ? (
              <QuantityAdd
                outOfStock={outOfStock}
                product={{
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  sku: product.sku,
                  price: product.price,
                  unit: product.unit,
                  image,
                  maxStock: product.trackInventory ? product.stock : 9999,
                  minOrderQty: product.minOrderQty,
                }}
              />
            ) : (
              <div className="rounded-sm border border-cargo/40 bg-cargo/10 p-4 text-sm text-cargo-ink">
                Online ordering is paused right now. Please contact us to place this order
                directly.
              </div>
            )}
          </div>

          {outOfStock && (
            <div className="mt-5 rounded-sm border border-bone-line bg-bone p-4">
              <p className="text-sm text-ink-3">
                This line is out of stock. We restock regularly — tell us the quantity you
                need and we will confirm a delivery date.
              </p>
              <ButtonLink href="/contact" size="sm" variant="outline" className="mt-3">
                Request restock
              </ButtonLink>
            </div>
          )}

          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            <Assurance icon={Truck} title="Nationwide delivery">
              Flat {formatNaira(settings.shippingFlatRate)}, free above{" "}
              {formatNaira(settings.freeShippingThreshold)}.
            </Assurance>
            <Assurance icon={ShieldCheck} title="Secure payment">
              Card, transfer, USSD via Paystack.
            </Assurance>
            <Assurance icon={Package} title="Pickup available">
              Collect from our Wuse II depot.
            </Assurance>
            <Assurance icon={Undo2} title="Returns">
              48 hours on damaged or wrong goods.
            </Assurance>
          </ul>
        </div>
      </section>

      {product.description && (
        <section className="border-y border-bone-line bg-bone py-14">
          <div className="container-page grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="eyebrow text-cargo">Details</p>
              <h2 className="mt-4 text-2xl font-extrabold text-ink">About this product</h2>
            </div>
            <div className="lg:col-span-8">
              <p className="max-w-3xl text-[1.0625rem] leading-relaxed text-ink-3">
                {product.description}
              </p>

              <dl className="mt-8 grid gap-px overflow-hidden rounded-sm border border-bone-line bg-bone-line sm:grid-cols-2">
                <Spec label="SKU" value={product.sku} />
                <Spec label="Unit of sale" value={product.unit} />
                <Spec label="Category" value={product.category.name} />
                <Spec
                  label="Minimum order"
                  value={`${product.minOrderQty} ${product.unit.replace("per ", "")}`}
                />
                {product.brand && <Spec label="Brand" value={product.brand} />}
                {product.weightKg && <Spec label="Weight" value={`${product.weightKg} kg`} />}
              </dl>
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="py-16 lg:py-20">
          <div className="container-page">
            <SectionHeading
              eyebrow="Also in this category"
              title="You may also need"
              action={{ href: `/shop?category=${product.category.slug}`, label: "View category" }}
            />
            <div className="mt-12 grid border-t border-l border-bone-line sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            sku: product.sku,
            description: product.shortDescription,
            brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
            offers: {
              "@type": "Offer",
              priceCurrency: "NGN",
              price: (product.price / 100).toFixed(2),
              availability: outOfStock
                ? "https://schema.org/OutOfStock"
                : "https://schema.org/InStock",
            },
          }),
        }}
      />
    </>
  );
}

function Assurance({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <Icon className="mt-0.5 h-4.5 w-4.5 flex-none text-cargo" />
      <div>
        <p className="font-display text-[0.8125rem] font-bold text-ink">{title}</p>
        <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-fg-bone-muted">{children}</p>
      </div>
    </li>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-5 py-4">
      <dt className="text-[0.6875rem] uppercase tracking-wider text-fg-bone-muted">{label}</dt>
      <dd className="mt-1 font-display text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}
