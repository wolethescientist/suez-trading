/**
 * Simulates the money path without touching Paystack: prices a real cart,
 * creates the order, then applies a fake "success" transaction the way the
 * webhook and the browser callback do — firing both at once to prove the
 * pipeline is idempotent. Cleans up after itself.
 *
 *   npx tsx --conditions=react-server scripts/verify-payment.mts
 */
import "dotenv/config";
import { prisma } from "@/lib/db";
import { priceCart } from "@/lib/checkout";
import { applyPaystackResult } from "@/lib/orders";
import { releaseOrderStock } from "@/lib/inventory";
import { orderReference } from "@/lib/utils";

const pass: string[] = [];
const fail: string[] = [];
const check = (label: string, actual: unknown, expected: unknown) => {
  const ok = String(actual) === String(expected);
  (ok ? pass : fail).push(`${ok ? "PASS" : "FAIL"}  ${label} — got ${actual}, expected ${expected}`);
};

const helmet = await prisma.product.findUniqueOrThrow({ where: { slug: "safety-helmet" } });
const before = helmet.stock;
console.log(`Safety Helmet opening stock: ${before}\n`);

const pricing = await priceCart({
  items: [{ productId: helmet.id, quantity: 10 }],
  deliveryMethod: "PICKUP",
  couponCode: "SUEZ10",
});
if (!pricing.ok) throw new Error(pricing.error);

const expectedSubtotal = helmet.price * 10;
check("subtotal priced from the database", pricing.subtotal, expectedSubtotal);
check("10% coupon applied", pricing.discount, Math.floor(expectedSubtotal * 0.1));
check("pickup is free", pricing.shipping, 0);
check("total = subtotal − discount", pricing.total, expectedSubtotal - Math.floor(expectedSubtotal * 0.1));

const reference = orderReference();
const order = await prisma.order.create({
  data: {
    reference,
    customerName: "Verification Run",
    customerEmail: "verify@example.com",
    customerPhone: "+2348000000000",
    deliveryMethod: "PICKUP",
    subtotal: pricing.subtotal,
    shipping: pricing.shipping,
    discount: pricing.discount,
    total: pricing.total,
    couponCode: pricing.couponCode,
    items: { create: pricing.lines },
  },
});

const transaction = {
  id: 1,
  status: "success",
  reference,
  amount: pricing.total,
  currency: "NGN",
  paid_at: new Date().toISOString(),
  channel: "card",
  gateway_response: "Successful",
  customer: { email: "verify@example.com" },
};

// The callback and the webhook routinely race each other in production.
await Promise.all([
  applyPaystackResult(transaction as never, "callback"),
  applyPaystackResult(transaction as never, "webhook"),
]);

const paid = await prisma.order.findUniqueOrThrow({ where: { reference } });
check("order marked paid", paid.paymentStatus, "PAID");
check("fulfilment moved to processing", paid.status, "PROCESSING");
check("stock flagged as committed", paid.stockCommitted, true);

const afterPaid = await prisma.product.findUniqueOrThrow({ where: { id: helmet.id } });
check("stock decremented exactly once", afterPaid.stock, before - 10);

const movements = await prisma.stockMovement.count({ where: { orderId: order.id } });
check("one stock movement written, not two", movements, 1);

const coupon = await prisma.coupon.findUniqueOrThrow({ where: { code: "SUEZ10" } });
check("coupon counted once despite the race", coupon.usedCount, 1);

// An underpayment must never mark an order paid.
const short = await prisma.order.create({
  data: {
    reference: orderReference(),
    customerName: "Underpay Test",
    customerEmail: "underpay@example.com",
    customerPhone: "+2348000000001",
    deliveryMethod: "PICKUP",
    subtotal: 100_000,
    shipping: 0,
    total: 100_000,
    items: { create: [{ name: "X", sku: "X", unitPrice: 100_000, quantity: 1, lineTotal: 100_000 }] },
  },
});
const underpaid = await applyPaystackResult(
  { ...transaction, reference: short.reference, amount: 1_000 } as never,
  "webhook",
);
const shortAfter = await prisma.order.findUniqueOrThrow({ where: { id: short.id } });
check("underpayment rejected", "reason" in underpaid ? underpaid.reason : "-", "amount-mismatch");
check("underpaid order stays pending", shortAfter.paymentStatus, "PENDING");

// A failed transaction should record, not crash.
const failedRef = orderReference();
await prisma.order.create({
  data: {
    reference: failedRef,
    customerName: "Failed Test",
    customerEmail: "failed@example.com",
    customerPhone: "+2348000000002",
    deliveryMethod: "PICKUP",
    subtotal: 5_000, shipping: 0, total: 5_000,
    items: { create: [{ name: "Y", sku: "Y", unitPrice: 5_000, quantity: 1, lineTotal: 5_000 }] },
  },
});
await applyPaystackResult(
  { ...transaction, reference: failedRef, status: "failed", amount: 5_000 } as never,
  "webhook",
);
const failedOrder = await prisma.order.findUniqueOrThrow({ where: { reference: failedRef } });
check("failed payment recorded", failedOrder.paymentStatus, "FAILED");

// Cancelling a paid order returns its stock to the shelf.
await releaseOrderStock(order.id);
const afterRelease = await prisma.product.findUniqueOrThrow({ where: { id: helmet.id } });
check("stock restored on cancellation", afterRelease.stock, before);

// ---- clean up -------------------------------------------------------------
await prisma.order.deleteMany({
  where: { customerEmail: { in: ["verify@example.com", "underpay@example.com", "failed@example.com"] } },
});
await prisma.stockMovement.deleteMany({ where: { orderId: null, note: { contains: "SUEZ-" } } });
await prisma.coupon.update({ where: { code: "SUEZ10" }, data: { usedCount: 0 } });

const final = await prisma.product.findUniqueOrThrow({ where: { id: helmet.id } });
check("stock left exactly as found", final.stock, before);

// ---- concurrency: many buyers racing for the last few units ---------------
{
  const race = await prisma.product.findUniqueOrThrow({ where: { slug: "diesel-generator-15kva" } });
  const opening = race.stock;
  const buyers = 8;
  const each = 1;

  const orders = await Promise.all(
    Array.from({ length: buyers }, async (_, i) => {
      const ref = orderReference() + i;
      return prisma.order.create({
        data: {
          reference: ref,
          customerName: `Racer ${i}`,
          customerEmail: "race@example.com",
          customerPhone: "+2348000000009",
          deliveryMethod: "PICKUP",
          subtotal: race.price * each,
          shipping: 0,
          total: race.price * each,
          items: {
            create: [
              {
                productId: race.id,
                name: race.name,
                sku: race.sku,
                unit: race.unit,
                unitPrice: race.price,
                quantity: each,
                lineTotal: race.price * each,
              },
            ],
          },
        },
      });
    }),
  );

  // All eight "pay" at the same instant.
  await Promise.all(
    orders.map((o) =>
      applyPaystackResult(
        {
          ...transaction,
          reference: o.reference,
          amount: o.total,
        } as never,
        "webhook",
      ),
    ),
  );

  const afterRace = await prisma.product.findUniqueOrThrow({ where: { id: race.id } });
  const sold = opening - afterRace.stock;
  check(`${buyers} concurrent payments each decremented exactly once`, sold, buyers * each);

  const raceMovements = await prisma.stockMovement.count({
    where: { productId: race.id, orderId: { in: orders.map((o) => o.id) } },
  });
  check("one ledger row per concurrent order", raceMovements, buyers);

  const flagged = await prisma.orderEvent.count({
    where: { orderId: { in: orders.map((o) => o.id) }, type: "NOTE" },
  });
  console.log(
    `      (opening stock ${opening}, ${buyers} sold, closing ${afterRace.stock}, ${flagged} oversell flag(s) raised)`,
  );

  // Roll the race back.
  for (const o of orders) await releaseOrderStock(o.id);
  await prisma.order.deleteMany({ where: { customerEmail: "race@example.com" } });
  const restored = await prisma.product.findUniqueOrThrow({ where: { id: race.id } });
  check("race stock fully restored", restored.stock, opening);
}

console.log([...pass, ...fail].join("\n"));
console.log(`\n${pass.length} passed, ${fail.length} failed.`);
await prisma.$disconnect();
process.exit(fail.length > 0 ? 1 : 0);
