import "server-only";
import { prisma } from "@/lib/db";
import { commitOrderStock } from "@/lib/inventory";
import type { PaystackTransaction } from "@/lib/paystack";

/**
 * Applies a verified Paystack transaction to an order. Both the browser
 * callback and the webhook call this, so it must be idempotent — whichever
 * arrives first does the work and the second becomes a no-op.
 */
export async function applyPaystackResult(
  transaction: PaystackTransaction,
  source: "callback" | "webhook",
) {
  const order = await prisma.order.findUnique({
    where: { reference: transaction.reference },
    include: { items: true },
  });
  if (!order) return { ok: false as const, reason: "unknown-order" };

  const succeeded = transaction.status === "success";

  // Guard against a mismatched amount — a failed integration or a tampered
  // callback should never mark an order paid for less than it is worth.
  if (succeeded && transaction.amount < order.total) {
    await prisma.orderEvent.create({
      data: {
        orderId: order.id,
        type: "WEBHOOK",
        message: `Amount mismatch from ${source}: paid ${transaction.amount} kobo against a total of ${order.total} kobo. Held for review.`,
      },
    });
    return { ok: false as const, reason: "amount-mismatch", order };
  }

  if (order.paymentStatus === "PAID") {
    return { ok: true as const, order, alreadyPaid: true };
  }

  if (!succeeded) {
    const failedStatus = transaction.status === "abandoned" ? "ABANDONED" : "FAILED";
    if (order.paymentStatus !== failedStatus) {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: failedStatus, paymentRaw: JSON.stringify(transaction) },
      });
      await prisma.orderEvent.create({
        data: {
          orderId: order.id,
          type: "WEBHOOK",
          message: `Payment ${transaction.status} (${source}): ${
            transaction.gateway_response ?? "no gateway response"
          }`,
        },
      });
    }
    return { ok: true as const, order, alreadyPaid: false };
  }

  // Claim the order atomically. The callback and the webhook race each other
  // routinely, and only the winner of this conditional update should go on to
  // count the coupon and write the paid event.
  const claim = await prisma.order.updateMany({
    where: { id: order.id, paymentStatus: { not: "PAID" } },
    data: {
      paymentStatus: "PAID",
      status: "PROCESSING",
      paidAt: transaction.paid_at ? new Date(transaction.paid_at) : new Date(),
      paymentChannel: transaction.channel,
      paymentRaw: JSON.stringify(transaction),
    },
  });

  if (claim.count === 0) {
    // The other caller got there first; it owns the follow-up work.
    return { ok: true as const, order, alreadyPaid: true };
  }

  await commitOrderStock(order.id);

  if (order.couponCode) {
    await prisma.coupon
      .update({
        where: { code: order.couponCode },
        data: { usedCount: { increment: 1 } },
      })
      .catch(() => undefined);
  }

  await prisma.orderEvent.create({
    data: {
      orderId: order.id,
      type: "PAYMENT_PAID",
      message: `Payment confirmed via ${transaction.channel ?? "Paystack"} (${source}). Stock allocated.`,
    },
  });

  return { ok: true as const, order, alreadyPaid: false };
}

export async function getOrderByReference(reference: string) {
  return prisma.order.findUnique({
    where: { reference },
    include: {
      items: { include: { product: { select: { slug: true } } } },
      events: { orderBy: { createdAt: "asc" } },
    },
  });
}
