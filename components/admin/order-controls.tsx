"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import {
  addOrderNote,
  reverifyPayment,
  updateOrderStatus,
  type OrderActionState,
} from "@/app/admin/actions/orders";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/field";
import { ORDER_STATUS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const initial: OrderActionState = { status: "idle" };

function Feedback({ state }: { state: OrderActionState }) {
  if (state.status === "idle" || !state.message) return null;
  return (
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
  );
}

export function StatusControl({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [state, action] = useActionState<OrderActionState, FormData>(updateOrderStatus, initial);

  return (
    <form action={action} className="space-y-4 p-5">
      <input type="hidden" name="orderId" value={orderId} />
      <Feedback state={state} />

      <Field label="Fulfilment status" htmlFor="status">
        <select id="status" name="status" defaultValue={currentStatus} className={inputClass}>
          {Object.keys(ORDER_STATUS).map((s) => (
            <option key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="Note (optional)"
        htmlFor="note"
        hint="Waybill number, driver, reason for cancellation."
      >
        <input id="note" name="note" className={inputClass} />
      </Field>

      <p className="rounded-sm bg-bone p-3 text-[0.75rem] leading-relaxed text-fg-bone-muted">
        Cancelling or refunding a paid order automatically returns its stock to
        the shelf and records the movement.
      </p>

      <Pending label="Update status" />
    </form>
  );
}

export function NoteControl({ orderId }: { orderId: string }) {
  const [state, action] = useActionState<OrderActionState, FormData>(addOrderNote, initial);

  return (
    <form action={action} className="space-y-3 p-5">
      <input type="hidden" name="orderId" value={orderId} />
      <Feedback state={state} />
      <Field label="Internal note" htmlFor="message">
        <textarea
          id="message"
          name="message"
          rows={3}
          placeholder="Customer called to change the delivery window…"
          className={cn(inputClass, "h-auto py-2.5")}
        />
      </Field>
      <Pending label="Add note" variant="outline" />
    </form>
  );
}

export function ReverifyControl({ orderId }: { orderId: string }) {
  const [state, action] = useActionState<OrderActionState, FormData>(reverifyPayment, initial);

  return (
    <form action={action} className="space-y-3 p-5">
      <input type="hidden" name="orderId" value={orderId} />
      <Feedback state={state} />
      <p className="text-[0.8125rem] leading-relaxed text-fg-bone-muted">
        Ask Paystack again what happened to this transaction. Use it when a
        customer says they paid but the order still shows as pending.
      </p>
      <ReverifyButton />
    </form>
  );
}

function Pending({
  label,
  variant = "dark",
}: {
  label: string;
  variant?: "dark" | "outline";
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Saving…
        </>
      ) : (
        label
      )}
    </Button>
  );
}

function ReverifyButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Checking Paystack…
        </>
      ) : (
        <>
          <RefreshCw className="h-4 w-4" /> Re-check payment
        </>
      )}
    </Button>
  );
}
