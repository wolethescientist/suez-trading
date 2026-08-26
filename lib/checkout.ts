import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { calculateShipping, getSettings } from "@/lib/settings";

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, "Please enter your full name.").max(120),
  customerEmail: z.string().trim().toLowerCase().email("Enter a valid email address."),
  customerPhone: z
    .string()
    .trim()
    .min(7, "Enter a reachable phone number.")
    .max(24)
    .regex(/^[0-9+()\-\s]+$/, "Phone number contains invalid characters."),
  deliveryMethod: z.enum(["DELIVERY", "PICKUP"]),
  addressLine1: z.string().trim().max(200).optional().or(z.literal("")),
  addressLine2: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().max(120).optional().or(z.literal("")),
  state: z.string().trim().max(120).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  couponCode: z.string().trim().max(40).optional().or(z.literal("")),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive().max(100000),
      }),
    )
    .min(1, "Your cart is empty."),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export type PricedLine = {
  productId: string;
  name: string;
  sku: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type PricingResult =
  | { ok: false; error: string }
  | {
      ok: true;
      lines: PricedLine[];
      subtotal: number;
      shipping: number;
      discount: number;
      total: number;
      couponCode: string | null;
    };

/**
 * Re-prices the cart from the database. The browser sends product ids and
 * quantities only — never prices — so a tampered cart cannot change what is
 * charged. Stock is checked here too, so an item that sold out between
 * add-to-cart and checkout is caught before we take money for it.
 */
export async function priceCart(
  input: Pick<CheckoutInput, "items" | "deliveryMethod" | "couponCode">,
): Promise<PricingResult> {
  const settings = await getSettings();
  if (!settings.ordersOpen) {
    return { ok: false, error: "Online ordering is temporarily paused. Please contact us to order." };
  }

  const ids = [...new Set(input.items.map((i) => i.productId))];
  const products = await prisma.product.findMany({ where: { id: { in: ids } } });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines: PricedLine[] = [];

  for (const item of input.items) {
    const product = byId.get(item.productId);
    if (!product) return { ok: false, error: "One of the items in your cart is no longer available." };
    if (product.status !== "ACTIVE") {
      return { ok: false, error: `${product.name} is no longer available to order online.` };
    }
    if (product.requiresQuote) {
      return { ok: false, error: `${product.name} is quoted rather than sold online. Please request a quote.` };
    }
    if (item.quantity < product.minOrderQty) {
      return {
        ok: false,
        error: `${product.name} has a minimum order of ${product.minOrderQty}.`,
      };
    }
    if (product.trackInventory && !product.allowBackorder && item.quantity > product.stock) {
      return {
        ok: false,
        error:
          product.stock > 0
            ? `Only ${product.stock} of ${product.name} left in stock.`
            : `${product.name} has just gone out of stock.`,
      };
    }

    lines.push({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      unit: product.unit,
      unitPrice: product.price,
      quantity: item.quantity,
      lineTotal: product.price * item.quantity,
    });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);

  let discount = 0;
  let couponCode: string | null = null;
  const code = input.couponCode?.trim().toUpperCase();
  if (code) {
    const coupon = await prisma.coupon.findUnique({ where: { code } });
    const usable =
      coupon &&
      coupon.active &&
      (!coupon.expiresAt || coupon.expiresAt > new Date()) &&
      (coupon.maxUses === null || coupon.usedCount < coupon.maxUses) &&
      subtotal >= coupon.minSubtotal;

    if (!usable) return { ok: false, error: "That discount code is not valid for this order." };

    discount =
      coupon.type === "PERCENT"
        ? Math.floor((subtotal * coupon.value) / 100)
        : Math.min(coupon.value, subtotal);
    couponCode = coupon.code;
  }

  const shipping = calculateShipping(subtotal, settings, input.deliveryMethod);
  const total = Math.max(0, subtotal - discount) + shipping;

  return { ok: true, lines, subtotal, shipping, discount, total, couponCode };
}
