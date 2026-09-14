import { Mail, MessageCircle, Phone } from "lucide-react";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { orderLinks } from "@/lib/commerce";
import { cn } from "@/lib/utils";

/**
 * How an order is actually placed now: the trade desk's number, on the page,
 * next to the product. One call, one WhatsApp thread or one email — each
 * pre-filled with the line the customer is looking at, so the first message
 * already says what they want.
 */
export function OrderEnquiry({
  product,
  className,
}: {
  product?: { name: string; sku?: string };
  className?: string;
}) {
  const links = orderLinks(product);

  return (
    <div className={cn("rounded-sm border border-bone-line bg-white p-5 sm:p-6", className)}>
      <p className="font-label text-[0.625rem] tracking-[0.14em] text-cargo">
        To place an order, reach out
      </p>

      <a
        href={links.tel}
        className="mt-3 flex items-baseline gap-2.5 font-display text-2xl font-extrabold leading-none text-ink transition-colors hover:text-cargo sm:text-[1.75rem]"
      >
        {links.phone}
      </a>

      <p className="mt-2.5 text-[0.875rem] leading-relaxed text-fg-bone-muted">
        Reach out and we confirm price, quantity and a delivery window on the spot.{" "}
        {links.hours}.
      </p>

      <div className="mt-5 flex flex-wrap gap-2.5">
        <ButtonAnchor href={links.tel} size="md">
          <Phone className="h-4 w-4" /> Call to order
        </ButtonAnchor>
        <ButtonAnchor
          href={links.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          variant="subtle"
          size="md"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </ButtonAnchor>
        <ButtonAnchor href={links.email} variant="subtle" size="md">
          <Mail className="h-4 w-4" /> Email
        </ButtonAnchor>
      </div>
    </div>
  );
}

/** The card-sized version: one button, straight to the phone. */
export function OrderEnquiryCompact({
  product,
  className,
}: {
  product?: { name: string; sku?: string };
  className?: string;
}) {
  const links = orderLinks(product);
  return (
    <ButtonAnchor href={links.tel} size="sm" className={cn("w-full", className)}>
      <Phone className="h-3.5 w-3.5" /> Call to order
    </ButtonAnchor>
  );
}

/** The full-page version, for routes whose job is now "reach out to us". */
export function PhoneOrdersOnly({
  title = "Reach out to place your order",
  lede = "Tell us what you need and we confirm price, quantity and a delivery window in one conversation.",
}: {
  title?: string;
  lede?: string;
}) {
  return (
    <section className="container-page py-16 lg:py-24">
      <p className="eyebrow text-cargo">Ordering</p>
      <h1 className="mt-4 max-w-2xl text-3xl font-extrabold text-ink sm:text-[2.5rem]">
        {title}
      </h1>
      <p className="mt-4 max-w-xl text-[1.0625rem] leading-relaxed text-fg-bone-muted">{lede}</p>

      <div className="mt-8 max-w-xl">
        <OrderEnquiry />
      </div>

      <div className="mt-8 flex flex-wrap gap-2.5">
        <ButtonLink href="/shop" variant="subtle" size="md">
          Back to the shop
        </ButtonLink>
        <ButtonLink href="/contact" variant="subtle" size="md">
          Send an enquiry
        </ButtonLink>
      </div>
    </section>
  );
}
