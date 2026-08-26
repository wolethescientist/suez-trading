import "server-only";
import { prisma } from "@/lib/db";
import type { StockReason } from "@/lib/constants";

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0] | typeof prisma;

/**
 * The single place stock levels change. Every adjustment writes a movement row
 * carrying the resulting balance, so /admin/inventory can show a real audit
 * trail rather than just a current number.
 */
export async function adjustStock(
  opts: {
    productId: string;
    delta: number;
    reason: StockReason;
    note?: string;
    orderId?: string;
    actorId?: string;
    /** Set an absolute level instead of a delta (used by stock counts). */
    setTo?: number;
  },
  client: Tx = prisma,
) {
  const product = await client.product.findUnique({
    where: { id: opts.productId },
    select: { id: true, stock: true, allowBackorder: true, trackInventory: true, name: true },
  });
  if (!product) throw new Error("Product not found.");

  const delta = opts.setTo !== undefined ? opts.setTo - product.stock : opts.delta;
  if (delta === 0) return product.stock;

  if (product.stock + delta < 0 && !product.allowBackorder) {
    throw new Error(
      `Not enough stock for ${product.name}: ${product.stock} available, ${Math.abs(delta)} requested.`,
    );
  }

  const updated = await client.product.update({
    where: { id: product.id },
    data: { stock: { increment: delta } },
    select: { stock: true },
  });
  const balance = updated.stock;

  await client.stockMovement.create({
    data: {
      productId: product.id,
      delta,
      balance,
      reason: opts.reason,
      note: opts.note,
      orderId: opts.orderId,
      actorId: opts.actorId,
    },
  });

  return balance;
}

/**
 * Decrements stock for every line on a paid order, exactly once. The
 * `stockCommitted` flag makes this safe to call from both the Paystack webhook
 * and the browser callback, which routinely race each other.
 */
export async function commitOrderStock(orderId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) throw new Error("Order not found.");
    if (order.stockCommitted) return { committed: false as const, oversold: [] as string[] };

    const oversold: string[] = [];

    for (const item of order.items) {
      if (!item.productId) continue;
      const product = await tx.product.findUnique({
        where: { id: item.productId },
        select: { id: true, name: true, trackInventory: true, allowBackorder: true },
      });
      if (!product || !product.trackInventory) continue;

      // Guarded decrement: Postgres evaluates `stock >= quantity` and applies
      // the subtraction in a single statement, so two payments landing at the
      // same moment cannot both claim the last unit.
      const guarded = await tx.product.updateMany({
        where: { id: product.id, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });

      if (guarded.count === 0) {
        // Not enough stock, but the customer has already paid. We never refuse
        // the order — the level goes negative and staff are told below.
        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: item.quantity } },
        });
        if (!product.allowBackorder) oversold.push(product.name);
      }

      const { stock: balance } = await tx.product.findUniqueOrThrow({
        where: { id: product.id },
        select: { stock: true },
      });

      await tx.stockMovement.create({
        data: {
          productId: product.id,
          delta: -item.quantity,
          balance,
          reason: "SALE",
          note: `Order ${order.reference}`,
          orderId: order.id,
        },
      });
    }

    await tx.order.update({
      where: { id: order.id },
      data: { stockCommitted: true },
    });

    if (oversold.length > 0) {
      await tx.orderEvent.create({
        data: {
          orderId: order.id,
          type: "NOTE",
          message: `Stock went negative on: ${oversold.join(", ")}. Payment was taken, so this order needs a restock or a conversation with the customer.`,
        },
      });
    }

    return { committed: true as const, oversold };
  });
}

/** Puts stock back when a paid order is cancelled or refunded. */
export async function releaseOrderStock(orderId: string, actorId?: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order || !order.stockCommitted) return { released: false as const };

    for (const item of order.items) {
      if (!item.productId) continue;
      const product = await tx.product.findUnique({
        where: { id: item.productId },
        select: { id: true, trackInventory: true },
      });
      if (!product || !product.trackInventory) continue;

      const restored = await tx.product.update({
        where: { id: product.id },
        data: { stock: { increment: item.quantity } },
        select: { stock: true },
      });
      const balance = restored.stock;
      await tx.stockMovement.create({
        data: {
          productId: product.id,
          delta: item.quantity,
          balance,
          reason: "CANCELLED_ORDER",
          note: `Order ${order.reference} cancelled`,
          orderId: order.id,
          actorId,
        },
      });
    }

    await tx.order.update({ where: { id: order.id }, data: { stockCommitted: false } });
    return { released: true as const };
  });
}

export async function lowStockProducts(limit = 50) {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE", trackInventory: true },
    include: { category: { select: { name: true } } },
    orderBy: { stock: "asc" },
    take: 200,
  });
  return products
    .filter((p) => p.stock <= p.lowStockThreshold)
    .slice(0, limit);
}
