import { site } from "@/lib/site";

/**
 * Is a database wired up?
 *
 * No. The catalogue ships with the code (`lib/catalogue-data.ts`), enquiries
 * arrive by email, and orders are placed by reaching out — so the site runs
 * with no DATABASE_URL, no payment key and no env file at all. Every piece of
 * database code is still in the tree, behind these two switches.
 *
 * To bring Postgres back: set this to `true`, restore the Prisma block at the
 * bottom of `lib/catalogue.ts`, and set DATABASE_URL.
 */
export const DATABASE_ENABLED = false;

/**
 * Cart → Paystack → order record. Needs the database and a payment key, so it
 * can never be on while `DATABASE_ENABLED` is off.
 */
export const ONLINE_ORDERING = DATABASE_ENABLED && true;

/** Digits only, the shape `tel:` and `wa.me` both want. */
const digits = (value: string) => value.replace(/[^\d+]/g, "");

/**
 * The three ways to reach the trade desk about a line, pre-filled with the
 * product so the customer does not have to describe what they are looking at.
 */
export function orderLinks(product?: { name: string; sku?: string }) {
  const subject = product ? `Order — ${product.name}` : "Order enquiry";
  const message = product
    ? `Hello Suez Trading, I would like to order the ${product.name}${
        product.sku ? ` (${product.sku})` : ""
      }. Please confirm price, quantity and delivery.`
    : "Hello Suez Trading, I would like to place an order.";

  return {
    phone: site.phone,
    tel: `tel:${digits(site.phone)}`,
    whatsapp: `https://wa.me/${digits(site.whatsapp).replace(/^\+/, "")}?text=${encodeURIComponent(message)}`,
    email: `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`,
    emailAddress: site.email,
    hours: site.hours,
  };
}
