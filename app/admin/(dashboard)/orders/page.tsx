import Link from "next/link";
import { ShoppingCart, Search } from "lucide-react";
import { prisma } from "@/lib/db";
import type { OrderStatus, Prisma } from "@/lib/generated/prisma/client";
import { requireAdmin } from "@/lib/auth";
import { formatNaira } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { Badge, statusTone } from "@/components/ui/badge";
import { Card, EmptyState, PageHeader } from "@/components/admin/page-header";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PER_PAGE = 25;

const tabs = [
  { value: "ALL", label: "All" },
  { value: "PROCESSING", label: "To fulfil" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "PENDING", label: "Unpaid" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const q = params.q?.trim();
  const status = params.status ?? "ALL";

  const where: Prisma.OrderWhereInput = {
    ...(status === "PENDING"
      ? { paymentStatus: "PENDING" as const }
      : status !== "ALL"
        ? { status: status as OrderStatus }
        : {}),
    ...(q
      ? {
          OR: [
            { reference: { contains: q, mode: "insensitive" } },
            { customerName: { contains: q, mode: "insensitive" } },
            { customerEmail: { contains: q, mode: "insensitive" } },
            { customerPhone: { contains: q } },
          ],
        }
      : {}),
  };

  const [orders, total, revenue] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { _count: { select: { items: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.order.count({ where }),
    prisma.order.aggregate({ _sum: { total: true }, where: { ...where, paymentStatus: "PAID" } }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const href = (patch: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...params, ...patch })) if (v) sp.set(k, v);
    return `/admin/orders${sp.toString() ? `?${sp}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Orders"
        description={`${total} order${total === 1 ? "" : "s"} in this view · ${formatNaira(revenue._sum?.total ?? 0)} paid`}
      />

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-bone-line p-4">
          <form action="/admin/orders" className="relative min-w-56 flex-1">
            {status !== "ALL" && <input type="hidden" name="status" value={status} />}
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-bone-muted" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search reference, name, email or phone…"
              aria-label="Search orders"
              className="h-9 w-full rounded-sm border border-bone-line bg-white pl-9 pr-3 text-[0.8125rem] placeholder:text-fg-bone-muted focus:border-fg-bone focus:outline-none"
            />
          </form>

          <div className="flex flex-wrap gap-1.5">
            {tabs.map((tab) => (
              <Link
                key={tab.value}
                href={href({ status: tab.value === "ALL" ? undefined : tab.value, page: undefined })}
                className={cn(
                  "rounded-sm border px-2.5 py-1.5 font-display text-[0.75rem] font-semibold transition-colors",
                  status === tab.value
                    ? "border-ink bg-ink text-white"
                    : "border-bone-line bg-white text-ink-3 hover:bg-bone",
                )}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>

        {orders.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="No orders here"
            description="Nothing matches this filter yet. Orders appear the moment a customer starts checkout."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-4xl text-left text-[0.8125rem]">
              <thead className="border-b border-bone-line text-[0.6875rem] uppercase tracking-wider text-fg-bone-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Reference</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Placed</th>
                  <th className="px-4 py-3 text-center font-semibold">Lines</th>
                  <th className="px-4 py-3 font-semibold">Payment</th>
                  <th className="px-4 py-3 font-semibold">Fulfilment</th>
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bone-line">
                {orders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-bone">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono text-[0.75rem] font-bold text-ink hover:text-cargo"
                      >
                        {order.reference}
                      </Link>
                      <div className="mt-0.5 text-[0.6875rem] text-fg-bone-muted">
                        {order.deliveryMethod === "PICKUP" ? "Depot pickup" : order.state ?? "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-ink">{order.customerName}</div>
                      <div className="text-[0.6875rem] text-fg-bone-muted">{order.customerEmail}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-fg-bone-muted">
                      {formatDate(order.createdAt, true)}
                    </td>
                    <td className="tnum px-4 py-3 text-center text-fg-bone-muted">
                      {order._count.items}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone(order.paymentStatus)}>{order.paymentStatus}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone(order.status)}>{order.status}</Badge>
                    </td>
                    <td className="tnum px-4 py-3 text-right font-display font-bold">
                      {formatNaira(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-bone-line px-4 py-3 text-[0.8125rem]">
            <span className="text-fg-bone-muted">
              Page {page} of {pages}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={href({ page: String(page - 1) })}
                  className="rounded-sm border border-bone-line px-3 py-1.5 font-semibold hover:bg-bone"
                >
                  Previous
                </Link>
              )}
              {page < pages && (
                <Link
                  href={href({ page: String(page + 1) })}
                  className="rounded-sm border border-bone-line px-3 py-1.5 font-semibold hover:bg-bone"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
