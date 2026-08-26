import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkoutSchema, priceCart } from "@/lib/checkout";
import { initializeTransaction, paystackConfigured } from "@/lib/paystack";
import { demoPaymentsEnabled } from "@/lib/demo-payments";
import { orderReference } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." },
      { status: 422 },
    );
  }
  const input = parsed.data;

  if (input.deliveryMethod === "DELIVERY" && (!input.addressLine1 || !input.city || !input.state)) {
    return NextResponse.json(
      { error: "A delivery address, city and state are required for delivery orders." },
      { status: 422 },
    );
  }

  const pricing = await priceCart(input);
  if (!pricing.ok) {
    return NextResponse.json({ error: pricing.error }, { status: 409 });
  }
  if (pricing.total < 100) {
    return NextResponse.json(
      { error: "Order total is below the minimum Paystack can process (₦1)." },
      { status: 422 },
    );
  }

  const demoMode = demoPaymentsEnabled();

  if (!demoMode && !paystackConfigured()) {
    return NextResponse.json(
      {
        error:
          "Payments are not configured yet. Add PAYSTACK_SECRET_KEY to the environment, or contact us to place this order directly.",
      },
      { status: 503 },
    );
  }

  const reference = orderReference();

  const order = await prisma.order.create({
    data: {
      reference,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      deliveryMethod: input.deliveryMethod,
      addressLine1: input.addressLine1 || null,
      addressLine2: input.addressLine2 || null,
      city: input.city || null,
      state: input.state || null,
      notes: input.notes || null,
      couponCode: pricing.couponCode,
      subtotal: pricing.subtotal,
      shipping: pricing.shipping,
      discount: pricing.discount,
      total: pricing.total,
      items: { create: pricing.lines },
      events: {
        create: {
          type: "CREATED",
          message: `Order created from the storefront for ${pricing.lines.length} line(s).`,
        },
      },
    },
  });

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;

  // Demo mode: the order is real, only the card network is simulated. Send the
  // customer to our own stand-in for the Paystack hosted page.
  if (demoMode) {
    await prisma.orderEvent.create({
      data: {
        orderId: order.id,
        type: "NOTE",
        message: "Demo payment mode — routed to the simulated checkout.",
      },
    });
    return NextResponse.json({
      reference,
      authorizationUrl: `${origin}/checkout/demo/${encodeURIComponent(reference)}`,
      demo: true,
    });
  }

  try {
    const transaction = await initializeTransaction({
      email: input.customerEmail,
      amount: pricing.total,
      reference,
      callbackUrl: `${origin}/api/paystack/callback`,
      metadata: {
        orderId: order.id,
        orderReference: reference,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        custom_fields: [
          {
            display_name: "Order reference",
            variable_name: "order_reference",
            value: reference,
          },
        ],
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { paystackAccessCode: transaction.access_code },
    });

    return NextResponse.json({
      reference,
      authorizationUrl: transaction.authorization_url,
    });
  } catch (error) {
    // The order stays PENDING so staff can see the attempt and follow it up.
    await prisma.orderEvent.create({
      data: {
        orderId: order.id,
        type: "NOTE",
        message: `Paystack initialisation failed: ${
          error instanceof Error ? error.message : "unknown error"
        }`,
      },
    });
    return NextResponse.json(
      { error: "We could not reach Paystack to start this payment. Please try again shortly." },
      { status: 502 },
    );
  }
}
