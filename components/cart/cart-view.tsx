"use client";

import Image from "next/image";
import { cloudinaryUrl, isCloudinary } from "@/lib/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { formatNaira } from "@/lib/money";
import { ButtonLink } from "@/components/ui/button";

export function CartView({
  shippingFlatRate,
  freeShippingThreshold,
}: {
  shippingFlatRate: number;
  freeShippingThreshold: number;
}) {
  const { items, subtotal, setQuantity, remove, ready } = useCart();

  if (!ready) {
    return <div className="mt-10 h-64 animate-pulse rounded-sm bg-bone" />;
  }

  if (items.length === 0) {
    return (
      <div className="mt-10 flex flex-col items-center gap-4 rounded-sm border border-dashed border-bone-line bg-bone py-24 text-center">
        <ShoppingBag className="h-8 w-8 text-fg-bone-muted" />
        <div>
          <p className="font-display text-lg font-bold text-ink">Your cart is empty</p>
          <p className="mt-1.5 text-sm text-fg-bone-muted">
            Add products from the shop to get started.
          </p>
        </div>
        <ButtonLink href="/shop" className="mt-2">
          Browse the catalogue
        </ButtonLink>
      </div>
    );
  }

  const qualifiesFreeShipping = freeShippingThreshold > 0 && subtotal >= freeShippingThreshold;
  const remaining = freeShippingThreshold - subtotal;
  const shipping = qualifiesFreeShipping ? 0 : shippingFlatRate;

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-8">
        <ul className="divide-y divide-bone-line border-y border-bone-line">
          {items.map((item) => (
            <li key={item.productId} className="flex flex-col gap-4 py-6 sm:flex-row">
              <Link
                href={`/shop/${item.slug}`}
                className="relative h-28 w-28 flex-none overflow-hidden rounded-sm border border-bone-line bg-bone"
              >
                <Image
                  src={cloudinaryUrl(item.image, 224)}
                  alt=""
                  fill
                  sizes="112px"
                  unoptimized={isCloudinary(item.image) || item.image.endsWith(".svg")}
                  className="object-cover"
                />
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/shop/${item.slug}`}
                      className="font-display text-base font-bold text-ink hover:text-cargo"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 font-mono text-[0.6875rem] text-fg-bone-muted">
                      SKU {item.sku}
                    </p>
                    <p className="mt-1 text-[0.8125rem] text-fg-bone-muted">
                      {formatNaira(item.price)} {item.unit !== "each" && item.unit}
                    </p>
                  </div>
                  <span className="tnum font-display text-lg font-extrabold text-ink">
                    {formatNaira(item.price * item.quantity)}
                  </span>
                </div>

                <div className="mt-auto flex items-center justify-between gap-4 pt-4">
                  <div className="flex items-center rounded-sm border border-bone-line">
                    <button
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                      aria-label={`Decrease ${item.name}`}
                      className="grid h-9 w-9 place-items-center text-fg-bone-muted hover:text-ink"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      aria-label={`Quantity of ${item.name}`}
                      onChange={(e) => setQuantity(item.productId, Number(e.target.value) || 1)}
                      className="tnum h-9 w-14 border-x border-bone-line text-center text-sm font-semibold focus:outline-none"
                    />
                    <button
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.maxStock}
                      aria-label={`Increase ${item.name}`}
                      className="grid h-9 w-9 place-items-center text-fg-bone-muted hover:text-ink disabled:opacity-30"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {item.quantity >= item.maxStock && (
                    <span className="text-[0.75rem] font-semibold text-cargo-ink">
                      Max available
                    </span>
                  )}

                  <button
                    onClick={() => remove(item.productId)}
                    className="ml-auto flex items-center gap-1.5 text-[0.8125rem] font-semibold text-fg-bone-muted hover:text-alert"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-2 font-display text-sm font-bold text-ink hover:text-cargo"
        >
          ← Continue shopping
        </Link>
      </div>

      <aside className="lg:col-span-4">
        <div className="sticky top-24 rounded-sm border border-bone-line bg-bone p-6">
          <h2 className="font-display text-lg font-bold text-ink">Order summary</h2>

          <dl className="mt-5 space-y-3 border-b border-bone-line pb-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-fg-bone-muted">Subtotal</dt>
              <dd className="tnum font-semibold">{formatNaira(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-fg-bone-muted">Delivery (estimate)</dt>
              <dd className="tnum font-semibold">
                {shipping === 0 ? "Free" : formatNaira(shipping)}
              </dd>
            </div>
          </dl>

          <div className="flex items-baseline justify-between py-5">
            <span className="font-display font-bold text-ink">Total</span>
            <span className="tnum font-display text-2xl font-extrabold text-ink">
              {formatNaira(subtotal + shipping)}
            </span>
          </div>

          {!qualifiesFreeShipping && freeShippingThreshold > 0 && (
            <div className="mb-5 rounded-sm border border-cargo/30 bg-cargo/10 p-3 text-[0.8125rem] text-cargo-ink">
              Spend {formatNaira(remaining)} more for free delivery.
            </div>
          )}

          <ButtonLink href="/checkout" size="lg" className="w-full">
            Proceed to checkout
          </ButtonLink>

          <p className="mt-4 text-center text-[0.75rem] leading-relaxed text-fg-bone-muted">
            Final delivery cost is confirmed at checkout. Payment is processed
            securely by Paystack.
          </p>
        </div>
      </aside>
    </div>
  );
}
