"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useCart, type CartItem } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";

export function AddToCartButton({
  product,
  quantity = 1,
  disabled,
  compact,
  label = "Add to cart",
}: {
  product: Omit<CartItem, "quantity">;
  quantity?: number;
  disabled?: boolean;
  compact?: boolean;
  label?: string;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    add(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <Button
      onClick={handleAdd}
      disabled={disabled}
      size={compact ? "sm" : "lg"}
      variant={compact ? "subtle" : "primary"}
      className="w-full"
    >
      {added ? (
        <>
          <Check className="h-4 w-4" /> Added
        </>
      ) : disabled ? (
        "Out of stock"
      ) : (
        <>
          <ShoppingBag className="h-4 w-4" /> {label}
        </>
      )}
    </Button>
  );
}
