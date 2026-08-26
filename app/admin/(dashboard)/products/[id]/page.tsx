import Link from "next/link";
import { notFound } from "next/navigation";
import { Copy, ExternalLink, History, Trash2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { can } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { formatNaira } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { Card, PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { StockAdjuster } from "@/components/admin/stock-adjuster";
import { deleteProduct, duplicateProduct } from "@/app/admin/actions/products";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const user = await requireAdmin();
  const { id } = await params;
  const { created } = await searchParams;

  const [product, categories, movements, salesTotals] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.stockMovement.findMany({
      where: { productId: id },
      include: { actor: { select: { name: true } }, order: { select: { reference: true } } },
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
    prisma.orderItem.aggregate({
      _sum: { quantity: true, lineTotal: true },
      where: { productId: id, order: { paymentStatus: "PAID" } },
    }),
  ]);

  if (!product) notFound();

  return (
    <>
      <PageHeader
        title={product.name}
        description={`SKU ${product.sku} · last updated ${formatDate(product.updatedAt, true)}`}
        back={{ href: "/admin/products", label: "Back to products" }}
        actions={
          <>
            <Link
              href={`/shop/${product.slug}`}
              target="_blank"
              className="inline-flex h-9 items-center gap-2 rounded-sm border border-bone-line bg-white px-3.5 font-display text-[0.8125rem] font-semibold text-ink transition-colors hover:bg-bone"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View live
            </Link>
            {can(user.role, "manageProducts") && (
              <form action={duplicateProduct}>
                <input type="hidden" name="id" value={product.id} />
                <button
                  type="submit"
                  className="inline-flex h-9 items-center gap-2 rounded-sm border border-bone-line bg-white px-3.5 font-display text-[0.8125rem] font-semibold text-ink transition-colors hover:bg-bone"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Duplicate
                </button>
              </form>
            )}
            {can(user.role, "deleteProducts") && (
              <form action={deleteProduct}>
                <input type="hidden" name="id" value={product.id} />
                <button
                  type="submit"
                  className="inline-flex h-9 items-center gap-2 rounded-sm border border-alert/30 bg-white px-3.5 font-display text-[0.8125rem] font-semibold text-alert transition-colors hover:bg-alert-soft"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </form>
            )}
          </>
        }
      />

      {created && (
        <div className="mb-6 rounded-sm border border-signal/25 bg-signal-soft p-4 text-[0.875rem] text-signal">
          Product created. It is now live on the storefront unless you saved it as a draft.
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Units sold" value={(salesTotals._sum.quantity ?? 0).toLocaleString()} />
        <Stat label="Revenue" value={formatNaira(salesTotals._sum.lineTotal ?? 0)} />
        <Stat label="Stock on hand" value={product.stock.toLocaleString()} />
        <Stat
          label="Margin per unit"
          value={
            product.costPrice
              ? formatNaira(product.price - product.costPrice)
              : "Cost not set"
          }
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-3">
          <ProductForm
            mode="edit"
            categories={categories}
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              sku: product.sku,
              categoryId: product.categoryId,
              brand: product.brand,
              shortDescription: product.shortDescription,
              description: product.description,
              price: product.price,
              compareAtPrice: product.compareAtPrice,
              costPrice: product.costPrice,
              unit: product.unit,
              minOrderQty: product.minOrderQty,
              stock: product.stock,
              lowStockThreshold: product.lowStockThreshold,
              trackInventory: product.trackInventory,
              allowBackorder: product.allowBackorder,
              featured: product.featured,
              requiresQuote: product.requiresQuote,
              status: product.status,
              weightKg: product.weightKg,
              warehouse: product.warehouse,
              imageUrl: product.images[0]?.url,
              imageStorageId: product.images[0]?.storageId,
            }}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card
          title="Adjust stock"
          description="Receipts, counts, damages and returns — all recorded."
        >
          <StockAdjuster productId={product.id} currentStock={product.stock} />
        </Card>

        <Card
          title="Stock ledger"
          description="Every movement, most recent first."
          className="xl:col-span-2"
        >
          {movements.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
              <History className="h-5 w-5 text-fg-bone-muted" />
              <p className="text-[0.8125rem] text-fg-bone-muted">No stock movements recorded yet.</p>
            </div>
          ) : (
            <div className="max-h-125 overflow-y-auto">
              <table className="w-full text-left text-[0.8125rem]">
                <thead className="sticky top-0 border-b border-bone-line bg-white text-[0.6875rem] uppercase tracking-wider text-fg-bone-muted">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">When</th>
                    <th className="px-4 py-2.5 font-semibold">Reason</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Change</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Balance</th>
                    <th className="px-4 py-2.5 font-semibold">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bone-line">
                  {movements.map((movement) => (
                    <tr key={movement.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-fg-bone-muted">
                        {formatDate(movement.createdAt, true)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          tone={
                            movement.delta > 0
                              ? "success"
                              : movement.reason === "DAMAGE"
                                ? "danger"
                                : "neutral"
                          }
                        >
                          {movement.reason}
                        </Badge>
                      </td>
                      <td
                        className={`tnum px-4 py-3 text-right font-display font-bold ${
                          movement.delta > 0 ? "text-signal" : "text-alert"
                        }`}
                      >
                        {movement.delta > 0 ? "+" : ""}
                        {movement.delta.toLocaleString()}
                      </td>
                      <td className="tnum px-4 py-3 text-right font-semibold">
                        {movement.balance.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-fg-bone-muted">
                        {movement.order ? (
                          <span className="font-mono text-[0.75rem]">
                            {movement.order.reference}
                          </span>
                        ) : (
                          movement.note ?? "—"
                        )}
                        {movement.actor && (
                          <span className="ml-1.5 text-[0.6875rem] text-fg-bone-muted">
                            · {movement.actor.name}
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
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-bone-line bg-white p-4">
      <p className="font-display text-[0.6875rem] font-bold uppercase tracking-wider text-fg-bone-muted">
        {label}
      </p>
      <p className="tnum mt-1.5 font-display text-lg font-extrabold text-ink">{value}</p>
    </div>
  );
}
