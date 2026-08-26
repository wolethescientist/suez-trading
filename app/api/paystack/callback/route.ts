import { NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/paystack";
import { applyPaystackResult } from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Where Paystack sends the customer's browser after checkout. The reference in
 * the query string is untrusted — we always call verify before believing it.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const reference = url.searchParams.get("reference") ?? url.searchParams.get("trxref");
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? url.origin;

  if (!reference) {
    return NextResponse.redirect(`${origin}/checkout?error=missing-reference`);
  }

  try {
    const transaction = await verifyTransaction(reference);
    await applyPaystackResult(transaction, "callback");
    return NextResponse.redirect(`${origin}/order/${encodeURIComponent(reference)}`);
  } catch {
    // Verification can fail transiently; the webhook is the safety net, so send
    // the customer to the order page rather than a dead end.
    return NextResponse.redirect(
      `${origin}/order/${encodeURIComponent(reference)}?verify=pending`,
    );
  }
}
