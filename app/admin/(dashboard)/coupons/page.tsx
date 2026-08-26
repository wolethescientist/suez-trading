import Link from "next/link";
import { Ticket, Trash2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { formatNaira } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, EmptyState, PageHeader } from "@/components/admin/page-header";
import { ActionForm } from "@/components/admin/entity-form";
import { Field, inputClass } from "@/components/ui/field";
import { deleteCoupon, saveCoupon } from "@/app/admin/actions/store";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CouponsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  await requirePermission("manageCoupons");
  const { edit } = await searchParams;

  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  const editing = edit ? coupons.find((c) => c.code === edit) : undefined;

  return (
    <>
      <PageHeader
        title="Discount codes"
        description="Codes customers can enter at checkout. Percentage or fixed amount off the subtotal."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <Card title="All codes" className="xl:col-span-2">
          {coupons.length === 0 ? (
            <EmptyState
              icon={Ticket}
              title="No discount codes"
              description="Create one to run a promotion or give a customer an agreed discount."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[0.8125rem]">
                <thead className="border-b border-bone-line text-[0.6875rem] uppercase tracking-wider text-fg-bone-muted">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Code</th>
                    <th className="px-5 py-3 font-semibold">Discount</th>
                    <th className="px-5 py-3 font-semibold">Minimum spend</th>
                    <th className="px-5 py-3 text-right font-semibold">Used</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-bone-line">
                  {coupons.map((coupon) => {
                    const expired = coupon.expiresAt && coupon.expiresAt < new Date();
                    const exhausted =
                      coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses;
                    return (
                      <tr key={coupon.code} className="transition-colors hover:bg-bone">
                        <td className="px-5 py-3.5">
                          <Link
                            href={`/admin/coupons?edit=${coupon.code}`}
                            className="font-mono text-[0.8125rem] font-bold text-ink hover:text-cargo"
                          >
                            {coupon.code}
                          </Link>
                          {coupon.expiresAt && (
                            <div className="text-[0.6875rem] text-fg-bone-muted">
                              Expires {formatDate(coupon.expiresAt)}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3.5 font-semibold">
                          {coupon.type === "PERCENT"
                            ? `${coupon.value}% off`
                            : `${formatNaira(coupon.value)} off`}
                        </td>
                        <td className="tnum px-5 py-3.5 text-fg-bone-muted">
                          {coupon.minSubtotal > 0 ? formatNaira(coupon.minSubtotal) : "None"}
                        </td>
                        <td className="tnum px-5 py-3.5 text-right">
                          {coupon.usedCount}
                          {coupon.maxUses !== null && (
                            <span className="text-fg-bone-muted"> / {coupon.maxUses}</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          {!coupon.active ? (
                            <Badge tone="neutral">Off</Badge>
                          ) : expired ? (
                            <Badge tone="danger">Expired</Badge>
                          ) : exhausted ? (
                            <Badge tone="danger">Used up</Badge>
                          ) : (
                            <Badge tone="success">Live</Badge>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <form action={deleteCoupon}>
                            <input type="hidden" name="code" value={coupon.code} />
                            <button
                              type="submit"
                              aria-label={`Delete ${coupon.code}`}
                              className="grid h-8 w-8 place-items-center rounded-sm border border-bone-line text-fg-bone-muted transition-colors hover:border-alert/30 hover:bg-alert-soft hover:text-alert"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card
          title={editing ? `Edit ${editing.code}` : "Create a code"}
          actions={
            editing && (
              <Link
                href="/admin/coupons"
                className="text-[0.8125rem] font-semibold text-fg-bone-muted hover:text-ink"
              >
                Cancel
              </Link>
            )
          }
        >
          <div className="p-5">
            <ActionForm
              key={editing?.code ?? "new"}
              action={saveCoupon}
              submitLabel={editing ? "Save code" : "Create code"}
            >
              <Field label="Code" htmlFor="code" required hint="Letters, numbers and hyphens.">
                <input
                  id="code"
                  name="code"
                  required
                  readOnly={Boolean(editing)}
                  defaultValue={editing?.code}
                  placeholder="SUEZ10"
                  className={cn(inputClass, "font-mono uppercase", editing && "bg-bone-2")}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Type" htmlFor="type">
                  <select
                    id="type"
                    name="type"
                    defaultValue={editing?.type ?? "PERCENT"}
                    className={inputClass}
                  >
                    <option value="PERCENT">Percentage off</option>
                    <option value="FIXED">Fixed amount off</option>
                  </select>
                </Field>
                <Field label="Value" htmlFor="value" required hint="Percent, or Naira for fixed.">
                  <input
                    id="value"
                    name="value"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    defaultValue={
                      editing
                        ? editing.type === "PERCENT"
                          ? editing.value
                          : editing.value / 100
                        : 10
                    }
                    className={cn(inputClass, "tnum")}
                  />
                </Field>
              </div>

              <Field
                label="Minimum subtotal (₦)"
                htmlFor="minSubtotal"
                hint="Leave at 0 for no minimum."
              >
                <input
                  id="minSubtotal"
                  name="minSubtotal"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={editing ? editing.minSubtotal / 100 : 0}
                  className={cn(inputClass, "tnum")}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Maximum uses" htmlFor="maxUses" hint="Blank for unlimited.">
                  <input
                    id="maxUses"
                    name="maxUses"
                    type="number"
                    min="1"
                    defaultValue={editing?.maxUses ?? ""}
                    className={cn(inputClass, "tnum")}
                  />
                </Field>
                <Field label="Expires on" htmlFor="expiresAt">
                  <input
                    id="expiresAt"
                    name="expiresAt"
                    type="date"
                    defaultValue={
                      editing?.expiresAt
                        ? editing.expiresAt.toISOString().slice(0, 10)
                        : ""
                    }
                    className={inputClass}
                  />
                </Field>
              </div>

              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked={editing?.active ?? true}
                  className="h-4 w-4 rounded-[2px] border-fg-bone-muted accent-ink"
                />
                <span className="font-display text-[0.8125rem] font-semibold text-ink-2">
                  Code is live
                </span>
              </label>
            </ActionForm>
          </div>
        </Card>
      </div>
    </>
  );
}
