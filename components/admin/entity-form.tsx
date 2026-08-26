"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import type { StoreActionState } from "@/app/admin/actions/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const initial: StoreActionState = { status: "idle" };

/**
 * Wraps any server action form with consistent feedback and a pending state,
 * so category, staff, coupon and settings forms all behave the same way.
 */
export function ActionForm({
  action,
  submitLabel,
  children,
  className,
  variant = "dark",
}: {
  action: (prev: StoreActionState, formData: FormData) => Promise<StoreActionState>;
  submitLabel: string;
  children: React.ReactNode;
  className?: string;
  variant?: "dark" | "primary" | "outline";
}) {
  const [state, formAction] = useActionState<StoreActionState, FormData>(action, initial);

  return (
    <form action={formAction} className={cn("space-y-5", className)}>
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

      {children}

      <Submit label={submitLabel} variant={variant} />
    </form>
  );
}

function Submit({
  label,
  variant,
}: {
  label: string;
  variant: "dark" | "primary" | "outline";
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
