"use client";

import { useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart, type CartItem } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/money";

export function QuantityAdd({
  product,
  outOfStock,
}: {
  product: Omit<CartItem, "quantity">;
  outOfStock: boolean;
}) {
  const { add } = useCart();
  const [qty, setQty] = useState(product.minOrderQty);
  const [added, setAdded] = useState(false);

  const ceiling = product.maxStock > 0 ? product.maxStock : 9999;
  const clamp = (n: number) => Math.max(product.minOrderQty, Math.min(n, ceiling));

  function handleAdd() {
    add(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center rounded-sm border border-bone-line bg-white">
          <button
            onClick={() => setQty((q) => clamp(q - stepFor(product.minOrderQty)))}
            disabled={outOfStock || qty <= product.minOrderQty}
            aria-label="Decrease quantity"
            className="grid h-12 w-12 place-items-center text-fg-bone-muted transition-colors hover:text-ink disabled:opacity-30"
          >
            <Minus className="h-4 w-4" />
          </button>
          <input
            type="number"
            value={qty}
            min={product.minOrderQty}
            max={ceiling}
            aria-label="Quantity"
            onChange={(e) => setQty(clamp(Number(e.target.value) || product.minOrderQty))}
            className="tnum h-12 w-16 border-x border-bone-line text-center font-display text-base font-bold focus:outline-none"
          />
          <button
            onClick={() => setQty((q) => clamp(q + stepFor(product.minOrderQty)))}
            disabled={outOfStock || qty >= ceiling}
            aria-label="Increase quantity"
            className="grid h-12 w-12 place-items-center text-fg-bone-muted transition-colors hover:text-ink disabled:opacity-30"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div>
          <div className="text-[0.6875rem] uppercase tracking-wider text-fg-bone-muted">
            Line total
          </div>
          <div className="tnum font-display text-xl font-extrabold text-ink">
            {formatNaira(product.price * qty)}
          </div>
        </div>
      </div>

      {product.minOrderQty > 1 && (
        <p className="text-[0.8125rem] text-fg-bone-muted">
          Minimum order: {product.minOrderQty.toLocaleString()} {product.unit.replace("per ", "")}
          {product.minOrderQty > 1 ? "s" : ""}.
        </p>
      )}

      <Button onClick={handleAdd} disabled={outOfStock} size="lg" className="w-full sm:w-auto sm:min-w-64">
        {added ? (
          <>
            <Check className="h-4 w-4" /> Added to cart
          </>
        ) : outOfStock ? (
          "Out of stock"
        ) : (
          <>
            <ShoppingBag className="h-4 w-4" /> Add to cart
          </>
        )}
      </Button>
    </div>
  );
}

/** Bulk lines (fuel by the litre) step in useful increments, not one at a time. */
function stepFor(minOrderQty: number) {
  if (minOrderQty >= 100) return 50;
  if (minOrderQty >= 10) return 10;
  return 1;
}
