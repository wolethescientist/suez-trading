"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { adjustStockAction, type ActionState } from "@/app/admin/actions/products";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/field";
import { STOCK_REASONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const initial: ActionState = { status: "idle" };

const reasonLabels: Record<string, string> = {
  RESTOCK: "Restock — goods received",
  ADJUSTMENT: "Adjustment — stock count correction",
  RETURN: "Return — goods came back",
  DAMAGE: "Damage — write off",
  SALE: "Sale — manual/offline order",
  CANCELLED_ORDER: "Cancelled order — stock released",
};

export function StockAdjuster({
  productId,
  currentStock,
}: {
  productId: string;
  currentStock: number;
}) {
  const [state, action] = useActionState<ActionState, FormData>(adjustStockAction, initial);

  return (
    <form action={action} className="space-y-4 p-5">
      <input type="hidden" name="productId" value={productId} />

      {state.status !== "idle" && state.message && (
        <div
          role="alert"
          className={cn(
            "flex gap-2 rounded-sm border p-3 text-[0.8125rem]",
            state.status === "error"
              ? "border-alert/25 bg-alert-soft text-alert"
              : "border-signal/25 bg-signal-soft text-signal",
          )}
        >
          {state.status === "error" ? (
            <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" />
          )}
          <span>{state.message}</span>
        </div>
      )}

      <div className="rounded-sm bg-bone px-4 py-3">
        <p className="text-[0.6875rem] uppercase tracking-wider text-fg-bone-muted">
          Current stock on hand
        </p>
        <p className="tnum mt-0.5 font-display text-2xl font-extrabold text-ink">
          {currentStock.toLocaleString()}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Change type" htmlFor="mode">
          <select id="mode" name="mode" defaultValue="delta" className={inputClass}>
            <option value="delta">Add / remove (±)</option>
            <option value="set">Set to exact level</option>
          </select>
        </Field>
        <Field
          label="Quantity"
          htmlFor="amount"
          hint="Use a negative number to remove stock."
        >
          <input
            id="amount"
            name="amount"
            type="number"
            step="1"
            required
            defaultValue={0}
            className={cn(inputClass, "tnum")}
          />
        </Field>
      </div>

      <Field label="Reason" htmlFor="reason" required>
        <select id="reason" name="reason" defaultValue="RESTOCK" className={inputClass}>
          {STOCK_REASONS.map((r) => (
            <option key={r} value={r}>
              {reasonLabels[r] ?? r}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Note" htmlFor="note" hint="Waybill number, supplier, who counted it.">
        <input id="note" name="note" className={inputClass} />
      </Field>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="dark" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Recording…
        </>
      ) : (
        "Record stock movement"
      )}
    </Button>
  );
}
