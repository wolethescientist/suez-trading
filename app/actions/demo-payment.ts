"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { applyPaystackResult } from "@/lib/orders";
import { demoPaymentsEnabled, simulateTransaction } from "@/lib/demo-payments";

/**
 * Completes a simulated payment. This runs the *real* post-payment pipeline —
 * the same idempotent claim, stock allocation, ledger entry and coupon count a
 * live Paystack webhook would trigger.
 */
export async function completeDemoPayment(formData: FormData) {
  if (!demoPaymentsEnabled()) {
    throw new Error("Demo payments are disabled on this environment.");
  }

  const reference = String(formData.get("reference") ?? "");
  const outcome = String(formData.get("outcome") ?? "success") === "failed" ? "failed" : "success";

  const order = await prisma.order.findUnique({ where: { reference } });
  if (!order) redirect("/checkout?error=unknown-order");

  await applyPaystackResult(
    simulateTransaction(order.reference, order.total, order.customerEmail, outcome),
    "callback",
  );

  redirect(`/order/${encodeURIComponent(order.reference)}`);
}
