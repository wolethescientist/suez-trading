"use client";

import Image from "next/image";
import { cloudinaryUrl, isCloudinary } from "@/lib/image";
import Link from "next/link";
import { useState } from "react";
import { AlertCircle, Loader2, Lock, Store, Truck } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { formatNaira } from "@/lib/money";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/field";
import { NIGERIAN_STATES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function CheckoutForm({
  shippingFlatRate,
  freeShippingThreshold,
  pickupAddress,
}: {
  shippingFlatRate: number;
  freeShippingThreshold: number;
  pickupAddress: string;
}) {
  const { items, subtotal, ready, clear } = useCart();
  const [method, setMethod] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const freeShipping = freeShippingThreshold > 0 && subtotal >= freeShippingThreshold;
  const shipping = method === "PICKUP" || freeShipping ? 0 : shippingFlatRate;
  const total = subtotal + shipping;

  if (!ready) return <div className="mt-10 h-96 animate-pulse rounded-sm bg-bone" />;

  if (items.length === 0) {
    return (
      <div className="mt-10 flex flex-col items-center gap-4 rounded-sm border border-dashed border-bone-line bg-bone py-24 text-center">
        <p className="font-display text-lg font-bold text-ink">
          There is nothing to check out
        </p>
        <ButtonLink href="/shop">Browse the catalogue</ButtonLink>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    const body = {
      customerName: String(form.get("customerName") ?? ""),
      customerEmail: String(form.get("customerEmail") ?? ""),
      customerPhone: String(form.get("customerPhone") ?? ""),
      deliveryMethod: method,
      addressLine1: String(form.get("addressLine1") ?? ""),
      addressLine2: String(form.get("addressLine2") ?? ""),
      city: String(form.get("city") ?? ""),
      state: String(form.get("state") ?? ""),
      notes: String(form.get("notes") ?? ""),
      couponCode: String(form.get("couponCode") ?? ""),
      // Only ids and quantities travel — the server prices the order itself.
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "We could not place this order. Please try again.");
        setSubmitting(false);
        return;
      }

      // The cart is cleared only once Paystack has accepted the transaction.
      clear();
      window.location.href = data.authorizationUrl;
    } catch {
      setError("Network problem — check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-14">
      <div className="space-y-10 lg:col-span-7">
        <fieldset className="space-y-5">
          <legend className="font-display text-lg font-bold text-ink">
            1. Contact details
          </legend>
          <Field label="Full name" htmlFor="customerName" required>
            <input id="customerName" name="customerName" required autoComplete="name" className={inputClass} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Email address"
              htmlFor="customerEmail"
              required
              hint="Your receipt and order updates go here."
            >
              <input
                id="customerEmail"
                name="customerEmail"
                type="email"
                required
                autoComplete="email"
                className={inputClass}
              />
            </Field>
            <Field label="Phone number" htmlFor="customerPhone" required>
              <input
                id="customerPhone"
                name="customerPhone"
                type="tel"
                required
                autoComplete="tel"
                placeholder="+234 800 000 0000"
                className={inputClass}
              />
            </Field>
          </div>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="font-display text-lg font-bold text-ink">
            2. How would you like it?
          </legend>

          <div className="grid gap-3 sm:grid-cols-2">
            <MethodCard
              active={method === "DELIVERY"}
              onClick={() => setMethod("DELIVERY")}
              icon={Truck}
              title="Delivery"
              copy={freeShipping ? "Free on this order" : `${formatNaira(shippingFlatRate)} flat rate`}
            />
            <MethodCard
              active={method === "PICKUP"}
              onClick={() => setMethod("PICKUP")}
              icon={Store}
              title="Depot pickup"
              copy="Free — collect from Wuse II"
            />
          </div>

          {method === "DELIVERY" ? (
            <div className="space-y-5">
              <Field label="Street address" htmlFor="addressLine1" required>
                <input
                  id="addressLine1"
                  name="addressLine1"
                  required
                  autoComplete="address-line1"
                  className={inputClass}
                />
              </Field>
              <Field label="Apartment, suite, landmark" htmlFor="addressLine2">
                <input
                  id="addressLine2"
                  name="addressLine2"
                  autoComplete="address-line2"
                  className={inputClass}
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="City / town" htmlFor="city" required>
                  <input id="city" name="city" required autoComplete="address-level2" className={inputClass} />
                </Field>
                <Field label="State" htmlFor="state" required>
                  <select id="state" name="state" required defaultValue="" className={inputClass}>
                    <option value="" disabled>
                      Select a state
                    </option>
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>
          ) : (
            <div className="rounded-sm border border-bone-line bg-bone p-4 text-sm text-ink-3">
              <p className="font-display font-bold">Collect from</p>
              <p className="mt-1 leading-relaxed">{pickupAddress}</p>
              <p className="mt-2 text-[0.8125rem] text-fg-bone-muted">
                We will call you when your order is picked and ready.
              </p>
            </div>
          )}
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="font-display text-lg font-bold text-ink">
            3. Anything else?
          </legend>
          <Field
            label="Order notes"
            htmlFor="notes"
            hint="Sizes, colours, delivery windows, site contact — anything we should know."
          >
            <textarea id="notes" name="notes" rows={3} className={cn(inputClass, "h-auto py-2.5")} />
          </Field>
        </fieldset>
      </div>

      <aside className="lg:col-span-5">
        <div className="sticky top-24 rounded-sm border border-bone-line bg-bone p-6">
          <h2 className="font-display text-lg font-bold text-ink">
            Order summary
            <span className="ml-2 text-sm font-semibold text-fg-bone-muted">
              ({items.length} line{items.length === 1 ? "" : "s"})
            </span>
          </h2>

          <ul className="mt-5 max-h-72 space-y-4 overflow-y-auto pr-1">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-3">
                <div className="relative h-14 w-14 flex-none overflow-hidden rounded-sm border border-bone-line bg-white">
                  <Image
                    src={cloudinaryUrl(item.image, 112)}
                    alt=""
                    fill
                    sizes="56px"
                    unoptimized={isCloudinary(item.image) || item.image.endsWith(".svg")}
                    className="object-cover"
                  />
                  <span className="tnum absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[0.625rem] font-bold text-white">
                    {item.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-display text-[0.8125rem] font-semibold leading-snug text-ink">
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-[0.75rem] text-fg-bone-muted">
                    {item.quantity} × {formatNaira(item.price)}
                  </p>
                </div>
                <span className="tnum text-[0.8125rem] font-bold">
                  {formatNaira(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 border-t border-bone-line pt-5">
            <Field label="Discount code" htmlFor="couponCode">
              <input
                id="couponCode"
                name="couponCode"
                placeholder="Enter code"
                className={cn(inputClass, "uppercase")}
              />
            </Field>
          </div>

          <dl className="mt-5 space-y-3 border-t border-bone-line pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-fg-bone-muted">Subtotal</dt>
              <dd className="tnum font-semibold">{formatNaira(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-fg-bone-muted">
                {method === "PICKUP" ? "Pickup" : "Delivery"}
              </dt>
              <dd className="tnum font-semibold">
                {shipping === 0 ? "Free" : formatNaira(shipping)}
              </dd>
            </div>
          </dl>

          <div className="mt-5 flex items-baseline justify-between border-t border-bone-line pt-5">
            <span className="font-display font-bold text-ink">Total due</span>
            <span className="tnum font-display text-2xl font-extrabold text-ink">
              {formatNaira(total)}
            </span>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-5 flex gap-2.5 rounded-sm border border-alert/30 bg-alert-soft p-3.5 text-[0.8125rem] leading-relaxed text-alert"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" size="lg" disabled={submitting} className="mt-6 w-full">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Starting payment…
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" /> Pay {formatNaira(total)}
              </>
            )}
          </Button>

          <p className="mt-4 flex items-center justify-center gap-2 text-[0.75rem] text-fg-bone-muted">
            <Lock className="h-3 w-3" />
            Secured by Paystack — card, transfer, USSD
          </p>

          <p className="mt-3 text-center text-[0.75rem] leading-relaxed text-fg-bone-muted">
            By paying you accept our{" "}
            <Link href="/legal/terms" className="underline hover:text-ink">
              terms of sale
            </Link>
            .
          </p>
        </div>
      </aside>
    </form>
  );
}

function MethodCard({
  active,
  onClick,
  icon: Icon,
  title,
  copy,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  copy: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-start gap-3 rounded-sm border p-4 text-left transition-all",
        active
          ? "border-ink bg-white ring-2 ring-ink/10"
          : "border-bone-line bg-white hover:border-fg-bone-muted",
      )}
    >
      <Icon className={cn("mt-0.5 h-4.5 w-4.5 flex-none", active ? "text-cargo" : "text-fg-bone-muted")} />
      <span>
        <span className="block font-display text-sm font-bold text-ink">{title}</span>
        <span className="mt-0.5 block text-[0.75rem] text-fg-bone-muted">{copy}</span>
      </span>
    </button>
  );
}
