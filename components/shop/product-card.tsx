import Link from "next/link";
import { formatNaira } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/shop/add-to-cart";
import { ProductImage } from "@/components/shop/product-image";
import type { ProductCardData } from "@/lib/catalogue";

export function ProductCard({ product }: { product: ProductCardData }) {
  const image = product.images[0]?.url ?? "/products/placeholder.svg";
  const outOfStock = product.trackInventory && product.stock <= 0 && !product.allowBackorder;
  const low = !outOfStock && product.trackInventory && product.stock <= product.lowStockThreshold;
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <article className="group relative flex flex-col border-b border-r border-bone-line bg-bone transition-colors duration-300 hover:bg-white">
      <Link href={`/shop/${product.slug}`} className="relative block aspect-square overflow-hidden border-b border-bone-line bg-white">
        <ProductImage
          src={image}
          alt={product.name}
          width={400}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.045]"
        />
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {onSale && <Badge tone="amber">Save {formatNaira(product.compareAtPrice! - product.price)}</Badge>}
          {outOfStock && <Badge tone="danger">Out of stock</Badge>}
          {low && <Badge tone="warning">Low stock</Badge>}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link
          href={`/shop?category=${product.category.slug}`}
          className="font-label text-[0.5625rem] tracking-[0.13em] text-fg-bone-muted hover:text-cargo"
        >
          {product.category.name}
        </Link>

        <h3 className="mt-1.5 font-display text-[0.9375rem] font-bold leading-snug text-ink">
          <Link href={`/shop/${product.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {product.name}
          </Link>
        </h3>

        <p className="mt-2 line-clamp-2 text-[0.8125rem] leading-relaxed text-fg-bone-muted">
          {product.shortDescription}
        </p>

        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="tnum font-display text-lg font-extrabold leading-none text-ink">
                {formatNaira(product.price)}
              </div>
              <div className="mt-1.5 flex items-center gap-2 font-label text-[0.5625rem] tracking-[0.1em] text-fg-bone-muted">
                {product.unit !== "each" && <span>{product.unit}</span>}
                {onSale && (
                  <span className="tnum line-through">{formatNaira(product.compareAtPrice!)}</span>
                )}
              </div>
            </div>
            {!outOfStock && (
              <span className="tnum font-label text-[0.5625rem] tracking-[0.1em] text-signal">
                {product.stock.toLocaleString()} in stock
              </span>
            )}
          </div>

          <div className="relative z-10 mt-3">
            <AddToCartButton
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
              disabled={outOfStock}
              compact
            />
          </div>
        </div>
      </div>
    </article>
  );
}
