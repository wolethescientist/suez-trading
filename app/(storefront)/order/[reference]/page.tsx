import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  Package,
  XCircle,
} from "lucide-react";
import { getOrderByReference } from "@/lib/orders";
import { formatNaira } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { Badge, statusTone } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Your order", robots: { index: false } };
export const dynamic = "force-dynamic";

type Params = Promise<{ reference: string }>;
type Search = Promise<{ verify?: string }>;

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { reference } = await params;
  const { verify } = await searchParams;
  const order = await getOrderByReference(reference);
  if (!order) notFound();

  const paid = order.paymentStatus === "PAID";
  const failed = order.paymentStatus === "FAILED" || order.paymentStatus === "ABANDONED";

  return (
    <section className="container-page py-12 lg:py-16">
      <div
        className={`rounded-sm border p-7 lg:p-9 ${
          paid
            ? "border-signal/25 bg-signal-soft"
            : failed
              ? "border-alert/25 bg-alert-soft"
              : "border-cargo/30 bg-cargo/10"
        }`}
      >
        <div className="flex items-start gap-4">
          {paid ? (
            <CheckCircle2 className="mt-0.5 h-7 w-7 flex-none text-signal" />
          ) : failed ? (
            <XCircle className="mt-0.5 h-7 w-7 flex-none text-alert" />
          ) : (
            <Clock className="mt-0.5 h-7 w-7 flex-none text-cargo" />
          )}
          <div>
            <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">
              {paid
                ? "Payment confirmed — thank you"
                : failed
                  ? "Payment was not completed"
                  : "Awaiting payment confirmation"}
            </h1>
            <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-3">
              {paid
                ? `We have allocated stock for this order and it is now being prepared. A receipt has been sent to ${order.customerEmail}.`
                : failed
                  ? "No money has left your account. You can place the order again, or contact us and we will take it over the phone."
                  : verify === "pending"
                    ? "Paystack has not confirmed this payment with us yet. This page updates once it does — refresh in a moment."
                    : "This order is waiting for payment. If you have already paid, it will confirm shortly."}
            </p>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-black/[0.07] pt-6">
          <Detail label="Order reference" value={order.reference} mono />
          <Detail label="Placed" value={formatDate(order.createdAt, true)} />
          <Detail label="Total" value={formatNaira(order.total)} />
          <div>
            <p className="text-[0.6875rem] uppercase tracking-wider text-ink-3/60">
              Payment
            </p>
            <Badge tone={statusTone(order.paymentStatus)} className="mt-1.5">
              {order.paymentStatus}
            </Badge>
          </div>
          <div>
            <p className="text-[0.6875rem] uppercase tracking-wider text-ink-3/60">
              Fulfilment
            </p>
            <Badge tone={statusTone(order.status)} className="mt-1.5">
              {order.status}
            </Badge>
          </div>
        </div>

        {failed && (
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/shop">Shop again</ButtonLink>
            <ButtonLink href="/contact" variant="outline">
              Order by phone
            </ButtonLink>
          </div>
        )}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <h2 className="font-display text-lg font-bold text-ink">What you ordered</h2>
          <ul className="mt-5 divide-y divide-bone-line border-y border-bone-line">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-4">
                <div className="grid h-12 w-12 flex-none place-items-center rounded-sm border border-bone-line bg-bone">
                  <Package className="h-4.5 w-4.5 text-fg-bone-muted" />
                </div>
                <div className="min-w-0 flex-1">
                  {item.product ? (
                    <Link
                      href={`/shop/${item.product.slug}`}
                      className="font-display text-[0.9375rem] font-semibold text-ink hover:text-cargo"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <span className="font-display text-[0.9375rem] font-semibold text-ink">
                      {item.name}
                    </span>
                  )}
                  <p className="mt-0.5 font-mono text-[0.6875rem] text-fg-bone-muted">
                    {item.sku} · {item.quantity} × {formatNaira(item.unitPrice)}
                  </p>
                </div>
                <span className="tnum font-display text-sm font-bold">
                  {formatNaira(item.lineTotal)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-6 space-y-3 text-sm">
            <Row label="Subtotal" value={formatNaira(order.subtotal)} />
            {order.discount > 0 && (
              <Row
                label={`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`}
                value={`− ${formatNaira(order.discount)}`}
              />
            )}
            <Row
              label={order.deliveryMethod === "PICKUP" ? "Depot pickup" : "Delivery"}
              value={order.shipping === 0 ? "Free" : formatNaira(order.shipping)}
            />
            <div className="flex items-baseline justify-between border-t border-bone-line pt-4">
              <dt className="font-display font-bold text-ink">Total paid</dt>
              <dd className="tnum font-display text-xl font-extrabold text-ink">
                {formatNaira(order.total)}
              </dd>
            </div>
          </dl>
        </div>

        <aside className="space-y-6 lg:col-span-5">
          <div className="rounded-sm border border-bone-line p-6">
            <h3 className="flex items-center gap-2 font-display text-[0.9375rem] font-bold text-ink">
              <MapPin className="h-4 w-4 text-cargo" />
              {order.deliveryMethod === "PICKUP" ? "Collection" : "Delivering to"}
            </h3>
            <address className="mt-3 text-sm not-italic leading-relaxed text-ink-3">
              <span className="font-semibold">{order.customerName}</span>
              <br />
              {order.deliveryMethod === "PICKUP" ? (
                <>
                  {site.address.line1}, {site.address.line2}
                  <br />
                  {site.address.city}, {site.address.state}
                </>
              ) : (
                <>
                  {order.addressLine1}
                  {order.addressLine2 && (
                    <>
                      <br />
                      {order.addressLine2}
                    </>
                  )}
                  <br />
                  {order.city}, {order.state}
                  <br />
                  {order.country}
                </>
              )}
              <br />
              {order.customerPhone}
            </address>
          </div>

          {order.paymentChannel && (
            <div className="rounded-sm border border-bone-line p-6">
              <h3 className="flex items-center gap-2 font-display text-[0.9375rem] font-bold text-ink">
                <CreditCard className="h-4 w-4 text-cargo" />
                Payment
              </h3>
              <p className="mt-3 text-sm text-ink-3">
                Paid by <span className="font-semibold capitalize">{order.paymentChannel}</span>
                {order.paidAt && <> on {formatDate(order.paidAt, true)}</>}.
              </p>
            </div>
          )}

          <div className="rounded-sm border border-bone-line p-6">
            <h3 className="font-display text-[0.9375rem] font-bold text-ink">
              Order history
            </h3>
            <ol className="mt-4 space-y-4">
              {order.events.map((event) => (
                <li key={event.id} className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-cargo" />
                  <div>
                    <p className="text-[0.8125rem] leading-relaxed text-ink-3">
                      {event.message}
                    </p>
                    <p className="mt-0.5 text-[0.6875rem] text-fg-bone-muted">
                      {formatDate(event.createdAt, true)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-sm bg-bone p-6 text-sm">
            <p className="font-display font-bold text-ink">Need help with this order?</p>
            <p className="mt-1.5 leading-relaxed text-fg-bone-muted">
              Quote reference{" "}
              <span className="font-mono font-semibold text-ink">{order.reference}</span>{" "}
              when you contact us.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <ButtonLink href="/contact" size="sm" variant="outline">
                Contact support
              </ButtonLink>
              <ButtonLink href="/track" size="sm" variant="ghost">
                Track another order
              </ButtonLink>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[0.6875rem] uppercase tracking-wider text-ink-3/60">{label}</p>
      <p
        className={`mt-1 font-semibold text-ink ${mono ? "font-mono text-sm" : "font-display text-[0.9375rem]"}`}
      >
        {value}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-fg-bone-muted">{label}</dt>
      <dd className="tnum font-semibold text-ink">{value}</dd>
    </div>
  );
}
