import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  Mail,
  Package,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { lowStockProducts } from "@/lib/inventory";
import { formatNaira } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { Badge, statusTone } from "@/components/ui/badge";
import { Card, EmptyState, PageHeader } from "@/components/admin/page-header";
import { ButtonLink } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const user = await requireAdmin();

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    revenueMonth,
    revenuePrevMonth,
    revenueToday,
    ordersToday,
    awaitingFulfilment,
    unpaidOrders,
    newEnquiries,
    activeProducts,
    lowStock,
    recentOrders,
    topProducts,
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
      _count: true,
      where: { paymentStatus: "PAID", paidAt: { gte: startOfMonth } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: "PAID", paidAt: { gte: startOfPrevMonth, lt: startOfMonth } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: "PAID", paidAt: { gte: startOfToday } },
    }),
    prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.order.count({ where: { paymentStatus: "PAID", status: { in: ["PROCESSING", "SHIPPED"] } } }),
    prisma.order.count({ where: { paymentStatus: "PENDING" } }),
    prisma.enquiry.count({ where: { status: "NEW" } }),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    lowStockProducts(6),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        reference: true,
        customerName: true,
        total: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
      },
    }),
    prisma.orderItem.groupBy({
      by: ["productId", "name"],
      _sum: { quantity: true, lineTotal: true },
      where: { order: { paymentStatus: "PAID" } },
      orderBy: { _sum: { lineTotal: "desc" } },
      take: 5,
    }),
  ]);

  const monthTotal = revenueMonth._sum.total ?? 0;
  const prevTotal = revenuePrevMonth._sum.total ?? 0;
  const change = prevTotal > 0 ? Math.round(((monthTotal - prevTotal) / prevTotal) * 100) : null;

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${user.name.split(" ")[0]}`}
        description="Everything that needs your attention on the shop floor today."
        actions={
          <>
            <ButtonLink href="/admin/products/new" size="sm">
              Add product
            </ButtonLink>
            <ButtonLink href="/admin/orders" size="sm" variant="outline">
              All orders
            </ButtonLink>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={Banknote}
          label="Revenue this month"
          value={formatNaira(monthTotal)}
          sub={
            change === null
              ? `${revenueMonth._count} paid orders`
              : `${change >= 0 ? "+" : ""}${change}% vs last month`
          }
          tone={change === null ? "neutral" : change >= 0 ? "up" : "down"}
        />
        <Metric
          icon={ShoppingCart}
          label="Orders today"
          value={String(ordersToday)}
          sub={`${formatNaira(revenueToday._sum.total ?? 0)} taken today`}
        />
        <Metric
          icon={Package}
          label="Awaiting fulfilment"
          value={String(awaitingFulfilment)}
          sub={`${unpaidOrders} unpaid order${unpaidOrders === 1 ? "" : "s"}`}
          href="/admin/orders?status=PROCESSING"
        />
        <Metric
          icon={AlertTriangle}
          label="Low stock lines"
          value={String(lowStock.length)}
          sub={`of ${activeProducts} active products`}
          href="/admin/inventory"
          tone={lowStock.length > 0 ? "warn" : "neutral"}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card
          title="Recent orders"
          className="xl:col-span-2"
          actions={
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-ink hover:text-cargo"
            >
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {recentOrders.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title="No orders yet"
              description="Orders placed on the storefront will appear here as soon as they are created."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[0.8125rem]">
                <thead className="border-b border-bone-line text-[0.6875rem] uppercase tracking-wider text-fg-bone-muted">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Reference</th>
                    <th className="px-5 py-3 font-semibold">Customer</th>
                    <th className="px-5 py-3 font-semibold">Payment</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bone-line">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="transition-colors hover:bg-bone">
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-mono text-[0.75rem] font-semibold text-ink hover:text-cargo"
                        >
                          {order.reference}
                        </Link>
                        <div className="mt-0.5 text-[0.6875rem] text-fg-bone-muted">
                          {formatDate(order.createdAt, true)}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-medium">{order.customerName}</td>
                      <td className="px-5 py-3.5">
                        <Badge tone={statusTone(order.paymentStatus)}>{order.paymentStatus}</Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge tone={statusTone(order.status)}>{order.status}</Badge>
                      </td>
                      <td className="tnum px-5 py-3.5 text-right font-display font-bold">
                        {formatNaira(order.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card
            title="Low stock"
            description="At or below the reorder threshold"
            actions={
              <Link
                href="/admin/inventory"
                className="text-[0.8125rem] font-semibold text-ink hover:text-cargo"
              >
                Manage
              </Link>
            }
          >
            {lowStock.length === 0 ? (
              <EmptyState
                icon={Package}
                title="Stock levels are healthy"
                description="No active product has fallen to its reorder threshold."
              />
            ) : (
              <ul className="divide-y divide-bone-line">
                {lowStock.map((product) => (
                  <li key={product.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="block truncate font-display text-[0.8125rem] font-semibold text-ink hover:text-cargo"
                      >
                        {product.name}
                      </Link>
                      <p className="text-[0.6875rem] text-fg-bone-muted">{product.category.name}</p>
                    </div>
                    <span
                      className={`tnum font-display text-sm font-extrabold ${
                        product.stock <= 0 ? "text-alert" : "text-cargo"
                      }`}
                    >
                      {product.stock}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Best sellers" description="By paid revenue, all time">
            {topProducts.length === 0 ? (
              <EmptyState
                icon={TrendingUp}
                title="Nothing sold yet"
                description="Once orders are paid, your strongest lines show up here."
              />
            ) : (
              <ul className="divide-y divide-bone-line">
                {topProducts.map((row) => (
                  <li key={row.productId ?? row.name} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-[0.8125rem] font-semibold text-ink">
                        {row.name}
                      </p>
                      <p className="tnum text-[0.6875rem] text-fg-bone-muted">
                        {row._sum.quantity?.toLocaleString()} sold
                      </p>
                    </div>
                    <span className="tnum font-display text-[0.8125rem] font-bold">
                      {formatNaira(row._sum.lineTotal ?? 0)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {newEnquiries > 0 && (
            <Link
              href="/admin/enquiries"
              className="flex items-center gap-3 rounded-sm border border-cargo/30 bg-cargo/10 p-5 transition-colors hover:bg-cargo/10/70"
            >
              <Mail className="h-5 w-5 flex-none text-cargo" />
              <div className="flex-1">
                <p className="font-display text-[0.875rem] font-bold text-cargo-ink">
                  {newEnquiries} new enquir{newEnquiries === 1 ? "y" : "ies"}
                </p>
                <p className="text-[0.75rem] text-cargo-ink/80">Waiting for a reply</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-cargo" />
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  sub,
  href,
  tone = "neutral",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  href?: string;
  tone?: "neutral" | "up" | "down" | "warn";
}) {
  const subTone = {
    neutral: "text-fg-bone-muted",
    up: "text-signal",
    down: "text-alert",
    warn: "text-cargo-ink",
  }[tone];

  const body = (
    <div className="h-full rounded-sm border border-bone-line bg-white p-5 transition-colors hover:border-fg-bone-muted">
      <div className="flex items-start justify-between">
        <p className="font-display text-[0.6875rem] font-bold uppercase tracking-wider text-fg-bone-muted">
          {label}
        </p>
        <Icon className="h-4 w-4 text-fg-bone-muted" />
      </div>
      <p className="tnum mt-3 font-display text-2xl font-extrabold text-ink">{value}</p>
      <p className={`mt-1 text-[0.75rem] font-medium ${subTone}`}>{sub}</p>
    </div>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
