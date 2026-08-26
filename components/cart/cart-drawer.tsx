"use client";

import Image from "next/image";
import { cloudinaryUrl, isCloudinary } from "@/lib/image";
import Link from "next/link";
import { useEffect } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { formatNaira } from "@/lib/money";
import { Button, ButtonLink } from "@/components/ui/button";

export function CartDrawer() {
  const { items, subtotal, drawerOpen, closeDrawer, setQuantity, remove } = useCart();

  // Escape closes, and the page behind should not scroll while it is open.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeDrawer();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [drawerOpen, closeDrawer]);

  return (
    <div
      className={`fixed inset-0 z-70 ${drawerOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!drawerOpen}
    >
      <div
        onClick={closeDrawer}
        className={`absolute inset-0 bg-ink/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          drawerOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`absolute right-0 top-0 flex h-full w-full max-w-[26rem] flex-col bg-white shadow-2xl transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-bone-line px-5 py-4">
          <h2 className="flex items-center gap-2 font-display text-base font-bold">
            <ShoppingBag className="h-4 w-4 text-cargo" />
            Your cart
            <span className="text-fg-bone-muted">({items.length})</span>
          </h2>
          <button
            onClick={closeDrawer}
            aria-label="Close cart"
            className="rounded-sm p-1.5 text-fg-bone-muted transition-colors hover:bg-bone-line hover:text-ink"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-bone-line">
              <ShoppingBag className="h-6 w-6 text-fg-bone-muted" />
            </div>
            <p className="font-display font-semibold text-ink">Your cart is empty</p>
            <p className="text-sm text-fg-bone-muted">
              Browse petroleum products, building materials and general supplies.
            </p>
            <ButtonLink href="/shop" onClick={closeDrawer} size="sm" className="mt-2">
              Start shopping
            </ButtonLink>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-bone-line overflow-y-auto px-5">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-3.5 py-4">
                  <Link
                    href={`/shop/${item.slug}`}
                    onClick={closeDrawer}
                    className="relative h-18 w-18 flex-none overflow-hidden rounded-sm border border-bone-line bg-bone"
                  >
                    <Image
                      src={cloudinaryUrl(item.image, 144)}
                      alt=""
                      fill
                      sizes="72px"
                      unoptimized={isCloudinary(item.image) || item.image.endsWith(".svg")}
                      className="object-cover"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/shop/${item.slug}`}
                      onClick={closeDrawer}
                      className="line-clamp-2 font-display text-[0.8125rem] font-semibold leading-snug text-ink hover:text-cargo"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-fg-bone-muted">
                      {formatNaira(item.price)} {item.unit !== "each" && item.unit}
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex items-center rounded-sm border border-bone-line">
                        <button
                          onClick={() => setQuantity(item.productId, item.quantity - 1)}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="grid h-7 w-7 place-items-center text-fg-bone-muted transition-colors hover:text-ink"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="tnum w-9 text-center text-[0.8125rem] font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="grid h-7 w-7 place-items-center text-fg-bone-muted transition-colors hover:text-ink disabled:opacity-30"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <span className="tnum font-display text-sm font-bold">
                        {formatNaira(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => remove(item.productId)}
                    aria-label={`Remove ${item.name}`}
                    className="h-fit rounded-sm p-1 text-fg-bone-muted transition-colors hover:bg-alert-soft hover:text-alert"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>

            <footer className="border-t border-bone-line bg-bone px-5 py-4">
              <div className="mb-1 flex items-baseline justify-between">
                <span className="font-display text-sm font-semibold text-ink-3">Subtotal</span>
                <span className="tnum font-display text-xl font-extrabold">
                  {formatNaira(subtotal)}
                </span>
              </div>
              <p className="mb-3.5 text-xs text-fg-bone-muted">
                Delivery is calculated at checkout.
              </p>
              <div className="grid gap-2">
                <ButtonLink href="/checkout" onClick={closeDrawer} size="lg" className="w-full">
                  Checkout
                </ButtonLink>
                <Button variant="ghost" size="sm" onClick={closeDrawer} className="w-full">
                  Continue shopping
                </Button>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
