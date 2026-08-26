import { NextResponse } from "next/server";
import { isValidWebhookSignature, paystackConfigured, verifyTransaction } from "@/lib/paystack";
import { applyPaystackResult } from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Paystack webhook. Set this URL in the Paystack dashboard under
 * Settings → API Keys & Webhooks. It is the authoritative payment signal —
 * the browser callback is only a convenience and can be lost.
 */
export async function POST(request: Request) {
  // Without a secret key there is nothing to verify a signature against, so
  // refuse rather than throwing a 500 at Paystack's retry loop.
  if (!paystackConfigured()) {
    return NextResponse.json({ error: "Payments are not configured." }, { status: 503 });
  }

  const raw = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!isValidWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Malformed payload." }, { status: 400 });
  }

  const reference = event.data?.reference;
  if (!reference) return NextResponse.json({ received: true });

  // Only payment-lifecycle events matter here; anything else is acknowledged
  // so Paystack does not retry it.
  if (!event.event?.startsWith("charge.")) {
    return NextResponse.json({ received: true });
  }

  try {
    // Re-verify rather than trusting the payload body outright.
    const transaction = await verifyTransaction(reference);
    await applyPaystackResult(transaction, "webhook");
  } catch (error) {
    console.error("Paystack webhook processing failed", error);
    // A non-2xx makes Paystack retry, which is what we want on a transient fault.
    return NextResponse.json({ error: "Processing failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
