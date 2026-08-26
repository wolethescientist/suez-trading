import { ProductImage } from "@/components/shop/product-image";
import Link from "next/link";
import { AlertTriangle, ArrowDownUp, Package, TrendingDown } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { formatNaira } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, EmptyState, PageHeader } from "@/components/admin/page-header";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const views = [
  { value: "low", label: "Needs attention" },
  { value: "all", label: "All tracked stock" },
  { value: "out", label: "Out of stock" },
  { value: "movements", label: "Recent movements" },
];

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  await requireAdmin();
  const { view = "low" } = await searchParams;

  const products = await prisma.product.findMany({
    where: { trackInventory: true, status: { not: "ARCHIVED" } },
    include: {
      category: { select: { name: true } },
      images: { take: 1, orderBy: { sortOrder: "asc" } },
    },
    orderBy: { stock: "asc" },
  });

  const lowStock = products.filter((p) => p.stock <= p.lowStockThreshold);
  const outOfStock = products.filter((p) => p.stock <= 0);
  const stockValue = products.reduce((sum, p) => sum + p.stock * (p.costPrice ?? p.price), 0);
  const retailValue = products.reduce((sum, p) => sum + p.stock * p.price, 0);

  const movements =
    view === "movements"
      ? await prisma.stockMovement.findMany({
          include: {
            product: { select: { id: true, name: true, sku: true } },
            actor: { select: { name: true } },
            order: { select: { reference: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 60,
        })
      : [];

  const rows =
    view === "all" ? products : view === "out" ? outOfStock : view === "low" ? lowStock : [];

  return (
    <>
      <PageHeader
        title="Inventory"
        description="What is on the shelf right now, what needs reordering, and every movement in and out."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={Package}
          label="Tracked lines"
          value={String(products.length)}
          sub="Active and draft products"
        />
        <Metric
          icon={AlertTriangle}
          label="At or below threshold"
          value={String(lowStock.length)}
          sub={`${outOfStock.length} completely out`}
          tone={lowStock.length > 0 ? "warn" : "ok"}
        />
        <Metric
          icon={ArrowDownUp}
          label="Stock value at cost"
          value={formatNaira(stockValue)}
          sub="Cost price where set"
        />
        <Metric
          icon={TrendingDown}
          label="Stock value at retail"
          value={formatNaira(retailValue)}
          sub="If everything sold at list"
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {views.map((v) => (
          <Link
            key={v.value}
            href={`/admin/inventory?view=${v.value}`}
            className={cn(
              "rounded-sm border px-3 py-1.5 font-display text-[0.75rem] font-semibold transition-colors",
              view === v.value
                ? "border-ink bg-ink text-white"
                : "border-bone-line bg-white text-ink-3 hover:bg-bone",
            )}
          >
            {v.label}
            {v.value === "low" && lowStock.length > 0 && ` (${lowStock.length})`}
            {v.value === "out" && outOfStock.length > 0 && ` (${outOfStock.length})`}
          </Link>
        ))}
      </div>

      {view === "movements" ? (
        <Card title="Stock movements" description="The full ledger, most recent first.">
          {movements.length === 0 ? (
            <EmptyState
              icon={ArrowDownUp}
              title="No movements recorded"
              description="Stock changes appear here as soon as goods are received or sold."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-3xl text-left text-[0.8125rem]">
                <thead className="border-b border-bone-line text-[0.6875rem] uppercase tracking-wider text-fg-bone-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">When</th>
                    <th className="px-4 py-3 font-semibold">Product</th>
                    <th className="px-4 py-3 font-semibold">Reason</th>
                    <th className="px-4 py-3 text-right font-semibold">Change</th>
                    <th className="px-4 py-3 text-right font-semibold">Balance</th>
                    <th className="px-4 py-3 font-semibold">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bone-line">
                  {movements.map((m) => (
                    <tr key={m.id} className="transition-colors hover:bg-bone">
                      <td className="whitespace-nowrap px-4 py-3 text-fg-bone-muted">
                        {formatDate(m.createdAt, true)}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/products/${m.product.id}`}
                          className="font-semibold text-ink hover:text-cargo"
                        >
                          {m.product.name}
                        </Link>
                        <div className="font-mono text-[0.6875rem] text-fg-bone-muted">
                          {m.product.sku}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          tone={
                            m.delta > 0 ? "success" : m.reason === "DAMAGE" ? "danger" : "neutral"
                          }
                        >
                          {m.reason}
                        </Badge>
                      </td>
                      <td
                        className={`tnum px-4 py-3 text-right font-display font-bold ${
                          m.delta > 0 ? "text-signal" : "text-alert"
                        }`}
                      >
                        {m.delta > 0 ? "+" : ""}
                        {m.delta.toLocaleString()}
                      </td>
                      <td className="tnum px-4 py-3 text-right font-semibold">
                        {m.balance.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-fg-bone-muted">
                        {m.order ? (
                          <span className="font-mono text-[0.75rem]">{m.order.reference}</span>
                        ) : (
                          (m.note ?? "—")
                        )}
                        {m.actor && (
                          <span className="ml-1.5 text-[0.6875rem] text-fg-bone-muted">
                            · {m.actor.name}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : (
        <Card
          title={views.find((v) => v.value === view)?.label ?? "Stock"}
          description="Click a product to adjust its level and see its ledger."
        >
          {rows.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Nothing to show"
              description={
                view === "low"
                  ? "Every tracked line is above its reorder threshold. Good place to be."
                  : "No products match this view."
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-3xl text-left text-[0.8125rem]">
                <thead className="border-b border-bone-line text-[0.6875rem] uppercase tracking-wider text-fg-bone-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Product</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 text-right font-semibold">On hand</th>
                    <th className="px-4 py-3 text-right font-semibold">Threshold</th>
                    <th className="px-4 py-3 text-right font-semibold">Value at cost</th>
                    <th className="px-4 py-3 font-semibold">State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bone-line">
                  {rows.map((product) => {
                    const out = product.stock <= 0;
                    const low = product.stock <= product.lowStockThreshold;
                    return (
                      <tr key={product.id} className="transition-colors hover:bg-bone">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative h-9 w-9 flex-none overflow-hidden rounded-sm border border-bone-line bg-bone">
                              {product.images[0] && (
                                <ProductImage
                                  src={product.images[0].url}
                                  alt=""
                                  width={36}
                                  className="object-cover"
                                />
                              )}
                            </div>
                            <div>
                              <Link
                                href={`/admin/products/${product.id}`}
                                className="font-display font-semibold text-ink hover:text-cargo"
                              >
                                {product.name}
                              </Link>
                              <div className="font-mono text-[0.6875rem] text-fg-bone-muted">
                                {product.sku}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-fg-bone-muted">{product.category.name}</td>
                        <td
                          className={cn(
                            "tnum px-4 py-3 text-right font-display text-base font-extrabold",
                            out ? "text-alert" : low ? "text-cargo" : "text-ink",
                          )}
                        >
                          {product.stock.toLocaleString()}
                        </td>
                        <td className="tnum px-4 py-3 text-right text-fg-bone-muted">
                          {product.lowStockThreshold.toLocaleString()}
                        </td>
                        <td className="tnum px-4 py-3 text-right font-semibold">
                          {formatNaira(product.stock * (product.costPrice ?? product.price))}
                        </td>
                        <td className="px-4 py-3">
                          {out ? (
                            <Badge tone="danger">Out of stock</Badge>
                          ) : low ? (
                            <Badge tone="warning">Reorder</Badge>
                          ) : (
                            <Badge tone="success">Healthy</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  sub,
  tone = "neutral",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  tone?: "neutral" | "warn" | "ok";
}) {
  return (
    <div className="rounded-sm border border-bone-line bg-white p-5">
      <div className="flex items-start justify-between">
        <p className="font-display text-[0.6875rem] font-bold uppercase tracking-wider text-fg-bone-muted">
          {label}
        </p>
        <Icon
          className={cn(
            "h-4 w-4",
            tone === "warn" ? "text-cargo" : tone === "ok" ? "text-signal" : "text-fg-bone-muted",
          )}
        />
      </div>
      <p className="tnum mt-3 font-display text-2xl font-extrabold text-ink">{value}</p>
      <p className="mt-1 text-[0.75rem] text-fg-bone-muted">{sub}</p>
    </div>
  );
}
