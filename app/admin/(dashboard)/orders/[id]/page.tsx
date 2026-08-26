import Link from "next/link";
import { notFound } from "next/navigation";
import { CreditCard, MapPin, Printer, User } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { formatNaira } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { Badge, statusTone } from "@/components/ui/badge";
import { Card, PageHeader } from "@/components/admin/page-header";
import {
  NoteControl,
  ReverifyControl,
  StatusControl,
} from "@/components/admin/order-controls";

export const dynamic = "force-dynamic";

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: { select: { id: true, slug: true } } } },
      events: {
        include: { actor: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!order) notFound();


  return (
    <>
      <PageHeader
        title={order.reference}
        description={`Placed ${formatDate(order.createdAt, true)} · ${order.items.length} line${order.items.length === 1 ? "" : "s"}`}
        back={{ href: "/admin/orders", label: "Back to orders" }}
        actions={
          <Link
            href={`/order/${order.reference}`}
            target="_blank"
            className="inline-flex h-9 items-center gap-2 rounded-sm border border-bone-line bg-white px-3.5 font-display text-[0.8125rem] font-semibold text-ink transition-colors hover:bg-bone"
          >
            <Printer className="h-3.5 w-3.5" />
            Customer receipt
          </Link>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-6 rounded-sm border border-bone-line bg-white px-5 py-4">
        <div>
          <p className="text-[0.6875rem] uppercase tracking-wider text-fg-bone-muted">Payment</p>
          <Badge tone={statusTone(order.paymentStatus)} className="mt-1.5">
            {order.paymentStatus}
          </Badge>
        </div>
        <div>
          <p className="text-[0.6875rem] uppercase tracking-wider text-fg-bone-muted">Fulfilment</p>
          <Badge tone={statusTone(order.status)} className="mt-1.5">
            {order.status}
          </Badge>
        </div>
        <div>
          <p className="text-[0.6875rem] uppercase tracking-wider text-fg-bone-muted">Method</p>
          <p className="mt-1 font-display text-[0.875rem] font-bold text-ink">
            {order.deliveryMethod === "PICKUP" ? "Depot pickup" : "Delivery"}
          </p>
        </div>
        <div>
          <p className="text-[0.6875rem] uppercase tracking-wider text-fg-bone-muted">Stock</p>
          <p className="mt-1 font-display text-[0.875rem] font-bold text-ink">
            {order.stockCommitted ? "Allocated" : "Not allocated"}
          </p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-[0.6875rem] uppercase tracking-wider text-fg-bone-muted">Order total</p>
          <p className="tnum mt-0.5 font-display text-xl font-extrabold text-ink">
            {formatNaira(order.total)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card title="Items">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[0.8125rem]">
                <thead className="border-b border-bone-line text-[0.6875rem] uppercase tracking-wider text-fg-bone-muted">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Product</th>
                    <th className="px-5 py-3 text-right font-semibold">Unit price</th>
                    <th className="px-5 py-3 text-right font-semibold">Qty</th>
                    <th className="px-5 py-3 text-right font-semibold">Line total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bone-line">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-5 py-3.5">
                        {item.product ? (
                          <Link
                            href={`/admin/products/${item.product.id}`}
                            className="font-display font-semibold text-ink hover:text-cargo"
                          >
                            {item.name}
                          </Link>
                        ) : (
                          <span className="font-display font-semibold text-ink">
                            {item.name}
                          </span>
                        )}
                        <div className="font-mono text-[0.6875rem] text-fg-bone-muted">
                          {item.sku} · {item.unit}
                        </div>
                      </td>
                      <td className="tnum px-5 py-3.5 text-right">
                        {formatNaira(item.unitPrice)}
                      </td>
                      <td className="tnum px-5 py-3.5 text-right font-semibold">
                        {item.quantity.toLocaleString()}
                      </td>
                      <td className="tnum px-5 py-3.5 text-right font-display font-bold">
                        {formatNaira(item.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-bone-line text-[0.8125rem]">
                  <tr>
                    <td colSpan={3} className="px-5 py-2.5 text-right text-fg-bone-muted">
                      Subtotal
                    </td>
                    <td className="tnum px-5 py-2.5 text-right font-semibold">
                      {formatNaira(order.subtotal)}
                    </td>
                  </tr>
                  {order.discount > 0 && (
                    <tr>
                      <td colSpan={3} className="px-5 py-2.5 text-right text-fg-bone-muted">
                        Discount {order.couponCode && `(${order.couponCode})`}
                      </td>
                      <td className="tnum px-5 py-2.5 text-right font-semibold text-signal">
                        − {formatNaira(order.discount)}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={3} className="px-5 py-2.5 text-right text-fg-bone-muted">
                      {order.deliveryMethod === "PICKUP" ? "Pickup" : "Delivery"}
                    </td>
                    <td className="tnum px-5 py-2.5 text-right font-semibold">
                      {order.shipping === 0 ? "Free" : formatNaira(order.shipping)}
                    </td>
                  </tr>
                  <tr className="border-t border-bone-line">
                    <td colSpan={3} className="px-5 py-3 text-right font-display font-bold">
                      Total
                    </td>
                    <td className="tnum px-5 py-3 text-right font-display text-base font-extrabold">
                      {formatNaira(order.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

          {order.notes && (
            <Card title="Customer notes">
              <p className="p-5 text-[0.875rem] leading-relaxed text-ink-3">{order.notes}</p>
            </Card>
          )}

          <Card title="Activity" description="Payments, status changes and staff notes.">
            <ol className="divide-y divide-bone-line">
              {order.events.map((event) => (
                <li key={event.id} className="flex gap-3 px-5 py-3.5">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-cargo" />
                  <div className="flex-1">
                    <p className="text-[0.8125rem] leading-relaxed text-ink-3">
                      {event.message}
                    </p>
                    <p className="mt-0.5 text-[0.6875rem] text-fg-bone-muted">
                      {formatDate(event.createdAt, true)}
                      {event.actor && ` · ${event.actor.name}`}
                      {` · ${event.type}`}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Customer">
            <dl className="space-y-4 p-5 text-[0.8125rem]">
              <div className="flex gap-3">
                <User className="mt-0.5 h-4 w-4 flex-none text-fg-bone-muted" />
                <div>
                  <dt className="font-display font-bold text-ink">{order.customerName}</dt>
                  <dd className="mt-0.5 text-fg-bone-muted">
                    <a href={`mailto:${order.customerEmail}`} className="block hover:text-ink">
                      {order.customerEmail}
                    </a>
                    <a href={`tel:${order.customerPhone}`} className="block hover:text-ink">
                      {order.customerPhone}
                    </a>
                  </dd>
                </div>
              </div>

              <div className="flex gap-3 border-t border-bone-line pt-4">
                <MapPin className="mt-0.5 h-4 w-4 flex-none text-fg-bone-muted" />
                <div>
                  <dt className="font-display font-bold text-ink">
                    {order.deliveryMethod === "PICKUP" ? "Collecting from depot" : "Deliver to"}
                  </dt>
                  <dd className="mt-0.5 leading-relaxed text-fg-bone-muted">
                    {order.deliveryMethod === "PICKUP" ? (
                      "Customer is collecting."
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
                  </dd>
                </div>
              </div>

              <div className="flex gap-3 border-t border-bone-line pt-4">
                <CreditCard className="mt-0.5 h-4 w-4 flex-none text-fg-bone-muted" />
                <div>
                  <dt className="font-display font-bold text-ink">Payment</dt>
                  <dd className="mt-0.5 leading-relaxed text-fg-bone-muted">
                    Reference{" "}
                    <span className="font-mono text-ink">{order.reference}</span>
                    <br />
                    {order.paidAt
                      ? `Paid by ${order.paymentChannel ?? "Paystack"} on ${formatDate(order.paidAt, true)}`
                      : "Not yet paid"}
                  </dd>
                </div>
              </div>
            </dl>
          </Card>

          <Card title="Update fulfilment">
            <StatusControl orderId={order.id} currentStatus={order.status} />
          </Card>

          {order.paymentStatus !== "PAID" && (
            <Card title="Payment check">
              <ReverifyControl orderId={order.id} />
            </Card>
          )}

          <Card title="Add a note">
            <NoteControl orderId={order.id} />
          </Card>
        </div>
      </div>
    </>
  );
}
