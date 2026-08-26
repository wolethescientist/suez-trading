import "server-only";
import type { PaystackTransaction } from "@/lib/paystack";

/**
 * Demo payment mode.
 *
 * Lets stakeholders walk the full checkout without a Paystack merchant
 * account: the order is created for real, stock is allocated for real, and the
 * receipt is real — only the card network is simulated.
 *
 * All the Paystack code stays in place and untouched. Set DEMO_PAYMENTS=false
 * and add a secret key to switch to live processing.
 */
export function demoPaymentsEnabled() {
  const flag = process.env.DEMO_PAYMENTS?.toLowerCase();
  if (flag === "true") return true;
  if (flag === "false") return false;
  // Unset: fall back to demo mode whenever Paystack is not configured, so a
  // fresh clone can always complete a checkout.
  return !process.env.PAYSTACK_SECRET_KEY;
}

/** Builds the transaction payload a successful Paystack charge would return. */
export function simulateTransaction(
  reference: string,
  amount: number,
  email: string,
  outcome: "success" | "failed",
): PaystackTransaction {
  return {
    id: Number(`9${Date.now().toString().slice(-9)}`),
    status: outcome,
    reference,
    amount,
    currency: "NGN",
    paid_at: outcome === "success" ? new Date().toISOString() : null,
    channel: outcome === "success" ? "card" : null,
    gateway_response:
      outcome === "success" ? "Successful" : "Declined by financial institution",
    customer: { email },
    metadata: { simulated: true },
  };
}
