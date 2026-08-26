import type { Metadata } from "next";
import { CheckoutForm } from "@/components/cart/checkout-form";
import { getSettings } from "@/lib/settings";
import { paystackConfigured } from "@/lib/paystack";
import { demoPaymentsEnabled } from "@/lib/demo-payments";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const settings = await getSettings();

  return (
    <section className="container-page py-12 lg:py-16">
      <p className="eyebrow text-cargo">Secure checkout</p>
      <h1 className="mt-4 text-3xl font-extrabold text-ink sm:text-[2.5rem]">
        Complete your order
      </h1>
      <p className="mt-3 max-w-xl text-[0.9375rem] text-fg-bone-muted">
        We verify stock and pricing when you place the order, then hand you to
        Paystack to pay.
      </p>

      {demoPaymentsEnabled() ? (
        <div className="mt-8 rounded-sm border border-dashed border-cargo/50 bg-cargo/8 p-5">
          <p className="font-label text-[0.6875rem] uppercase tracking-[0.13em] text-cargo-ink">
            Demonstration mode
          </p>
          <p className="mt-2 text-[0.875rem] leading-relaxed text-fg-bone-muted">
            Payments are simulated on this environment. Place the order as
            normal — you will reach a stand-in for the Paystack page, and
            everything after it (stock allocation, receipt, order tracking) is
            real.
          </p>
        </div>
      ) : !paystackConfigured() ? (
        <div className="mt-8 rounded-sm border border-dashed border-bone-line p-5">
          <p className="font-label text-[0.6875rem] uppercase tracking-[0.13em] text-fg-bone">
            Payments are not configured on this environment
          </p>
          <p className="mt-2 text-[0.875rem] leading-relaxed text-fg-bone-muted">
            Add <code className="font-mono">PAYSTACK_SECRET_KEY</code> to{" "}
            <code className="font-mono">.env</code> to enable live checkout. In the
            meantime, orders can be placed by phone on {site.phone}.
          </p>
        </div>
      ) : null}

      <CheckoutForm
        shippingFlatRate={settings.shippingFlatRate}
        freeShippingThreshold={settings.freeShippingThreshold}
        pickupAddress={settings.pickupAddress}
      />
    </section>
  );
}
