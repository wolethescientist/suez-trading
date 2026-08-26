"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { releaseOrderStock } from "@/lib/inventory";
import { verifyTransaction, paystackConfigured } from "@/lib/paystack";
import { applyPaystackResult } from "@/lib/orders";
import { ORDER_STATUS } from "@/lib/constants";

export type OrderActionState = { status: "idle" | "success" | "error"; message?: string };

export async function updateOrderStatus(
  _prev: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const user = await requirePermission("manageOrders");

  const parsed = z
    .object({
      orderId: z.string().min(1),
      status: z.enum(
        Object.keys(ORDER_STATUS) as [keyof typeof ORDER_STATUS, ...(keyof typeof ORDER_STATUS)[]],
      ),
      note: z.string().trim().max(300).optional().or(z.literal("")),
    })
    .safeParse({
      orderId: formData.get("orderId"),
      status: formData.get("status"),
      note: formData.get("note"),
    });

  if (!parsed.success) return { status: "error", message: "Choose a valid status." };
  const { orderId, status, note } = parsed.data;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { status: "error", message: "Order not found." };
  if (order.status === status) return { status: "error", message: "That is already the status." };

  // Cancelling or refunding a paid order puts the stock back on the shelf.
  if ((status === "CANCELLED" || status === "REFUNDED") && order.stockCommitted) {
    await releaseOrderStock(order.id, user.id);
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      ...(status === "REFUNDED" ? { paymentStatus: "REFUNDED" } : {}),
    },
  });

  await prisma.orderEvent.create({
    data: {
      orderId,
      type: "STATUS_CHANGED",
      message: `Status changed from ${order.status} to ${status}${note ? ` — ${note}` : ""}.`,
      actorId: user.id,
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
  return { status: "success", message: `Order marked as ${status.toLowerCase()}.` };
}

export async function addOrderNote(
  _prev: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const user = await requirePermission("manageOrders");
  const orderId = String(formData.get("orderId") ?? "");
  const message = String(formData.get("message") ?? "").trim();

  if (!orderId || message.length < 2) {
    return { status: "error", message: "Write a note before saving." };
  }

  await prisma.orderEvent.create({
    data: { orderId, type: "NOTE", message, actorId: user.id },
  });

  revalidatePath(`/admin/orders/${orderId}`);
  return { status: "success", message: "Note added." };
}

/**
 * Re-checks a pending order against Paystack. Useful when a customer says they
 * paid but the webhook never arrived.
 */
export async function reverifyPayment(
  _prev: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  await requirePermission("manageOrders");
  const orderId = String(formData.get("orderId") ?? "");

  if (!paystackConfigured()) {
    return { status: "error", message: "Paystack is not configured on this environment." };
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { status: "error", message: "Order not found." };

  try {
    const transaction = await verifyTransaction(order.reference);
    const result = await applyPaystackResult(transaction, "callback");

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");

    if (!result.ok) {
      return {
        status: "error",
        message:
          result.reason === "amount-mismatch"
            ? "Paystack reports a different amount than this order total. Held for review."
            : "Paystack did not recognise this reference.",
      };
    }
    return {
      status: "success",
      message: `Paystack reports this transaction as "${transaction.status}".`,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Could not reach Paystack.",
    };
  }
}
