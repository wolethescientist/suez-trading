import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CreditCard, Landmark, Lock, Smartphone } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatNaira } from "@/lib/money";
import { demoPaymentsEnabled } from "@/lib/demo-payments";
import { completeDemoPayment } from "@/app/actions/demo-payment";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Payment", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function DemoCheckoutPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  if (!demoPaymentsEnabled()) redirect("/checkout");

  const { reference } = await params;
  const order = await prisma.order.findUnique({
    where: { reference },
    include: { items: true },
  });
  if (!order) notFound();

  if (order.paymentStatus === "PAID") {
    redirect(`/order/${encodeURIComponent(order.reference)}`);
  }

  return (
    <section className="mx-auto w-full max-w-lg px-5 py-14 lg:py-20">
      <div className="mb-5 rounded-sm border border-dashed border-cargo/50 bg-cargo/8 px-4 py-3">
        <p className="font-label text-[0.6875rem] uppercase tracking-[0.13em] text-cargo-ink">
          Demonstration mode
        </p>
        <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-fg-bone-muted">
          This stands in for the Paystack payment page. No card is charged and no
          money moves — but the order, the stock allocation and the receipt that
          follow are all real.
        </p>
      </div>

      <div className="overflow-hidden rounded-sm border border-bone-line bg-white">
        <header className="flex items-center justify-between border-b border-bone-line px-6 py-4">
          <div>
            <p className="font-label text-[0.625rem] uppercase tracking-[0.13em] text-fg-bone-muted">
              Paying
            </p>
            <p className="mt-0.5 font-display text-lg text-fg-bone">{site.legalName}</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-bone-line px-2.5 py-1 font-label text-[0.625rem] uppercase tracking-[0.1em] text-fg-bone-muted">
            <Lock className="h-3 w-3" />
            Secure
          </span>
        </header>

        <div className="border-b border-bone-line px-6 py-6 text-center">
          <p className="font-label text-[0.625rem] uppercase tracking-[0.13em] text-fg-bone-muted">
            Amount due
          </p>
          <p className="tnum mt-2 font-display text-4xl text-fg-bone">
            {formatNaira(order.total)}
          </p>
          <p className="mt-2 text-[0.8125rem] text-fg-bone-muted">{order.customerEmail}</p>
          <p className="mt-1 font-mono text-[0.6875rem] text-fg-bone-muted">
            {order.reference}
          </p>
        </div>

        <div className="grid grid-cols-3 divide-x divide-bone-line border-b border-bone-line">
          {[
            { icon: CreditCard, label: "Card" },
            { icon: Landmark, label: "Transfer" },
            { icon: Smartphone, label: "USSD" },
          ].map((method, i) => (
            <div
              key={method.label}
              className={`flex flex-col items-center gap-1.5 py-4 ${
                i === 0 ? "bg-bone" : ""
              }`}
            >
              <method.icon
                className={`h-4 w-4 ${i === 0 ? "text-cargo" : "text-fg-bone-muted"}`}
              />
              <span
                className={`font-label text-[0.625rem] uppercase tracking-[0.1em] ${
                  i === 0 ? "text-fg-bone" : "text-fg-bone-muted"
                }`}
              >
                {method.label}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-4 px-6 py-6">
          <div>
            <label className="font-label text-[0.625rem] uppercase tracking-[0.13em] text-fg-bone-muted">
              Card number
            </label>
            <div className="mt-1.5 flex h-11 items-center justify-between rounded-sm border border-bone-line bg-bone px-3.5 font-mono text-sm text-fg-bone-muted">
              <span>4084 0840 8408 4081</span>
              <span className="font-label text-[0.625rem] uppercase tracking-[0.1em]">
                Test card
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-label text-[0.625rem] uppercase tracking-[0.13em] text-fg-bone-muted">
                Expiry
              </label>
              <div className="mt-1.5 flex h-11 items-center rounded-sm border border-bone-line bg-bone px-3.5 font-mono text-sm text-fg-bone-muted">
                09 / 32
              </div>
            </div>
            <div>
              <label className="font-label text-[0.625rem] uppercase tracking-[0.13em] text-fg-bone-muted">
                CVV
              </label>
              <div className="mt-1.5 flex h-11 items-center rounded-sm border border-bone-line bg-bone px-3.5 font-mono text-sm text-fg-bone-muted">
                •••
              </div>
            </div>
          </div>

          <form action={completeDemoPayment} className="space-y-3 pt-1">
            <input type="hidden" name="reference" value={order.reference} />
            <button
              type="submit"
              name="outcome"
              value="success"
              className="h-12 w-full rounded-full bg-cargo font-label text-[0.8125rem] font-semibold uppercase tracking-[0.09em] text-white transition-colors hover:bg-cargo-ink"
            >
              Pay {formatNaira(order.total)}
            </button>
            <button
              type="submit"
              name="outcome"
              value="failed"
              className="h-10 w-full rounded-full border border-bone-line font-label text-[0.6875rem] uppercase tracking-[0.1em] text-fg-bone-muted transition-colors hover:border-fg-bone hover:text-fg-bone"
            >
              Simulate a declined payment
            </button>
          </form>
        </div>
      </div>

      <p className="mt-5 text-center font-label text-[0.625rem] uppercase tracking-[0.12em] text-fg-bone-muted">
        Demonstration only · no card is charged
      </p>
    </section>
  );
}
