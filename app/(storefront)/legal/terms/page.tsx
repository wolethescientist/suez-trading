import type { Metadata } from "next";
import { Clause, LegalPage } from "@/components/site/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of sale" };

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Legal" title="Terms of sale" updated="26 August 2026">
      <p className="text-[1.0625rem] leading-relaxed text-ink-3">
        These terms govern goods and services sold by {site.legalName}
        (&ldquo;Suez Trading&rdquo;, &ldquo;we&rdquo;) through this website. Placing an order means
        you accept them. They do not affect your statutory rights as a consumer
        under Nigerian law.
      </p>

      <Clause heading="1. Orders and acceptance">
        <p>
          An order placed on this site is an offer to buy. A contract forms only
          when we confirm payment and issue an order reference. We may decline
          an order — for example where stock has sold out, pricing was
          published in error, or we cannot deliver to the address given — and
          will refund any payment taken in full.
        </p>
      </Clause>

      <Clause heading="2. Prices and payment">
        <p>
          Prices are shown in Nigerian Naira and, unless stated otherwise, are
          inclusive of applicable taxes but exclusive of delivery. Petroleum
          product pricing moves with the market; the price binding on an order
          is the price displayed at the moment payment is completed.
        </p>
        <p>
          Payments are processed by Paystack. We do not receive or store your
          card details. Where a payment is authorised but the amount does not
          match the order total, we hold the order for review before
          fulfilment.
        </p>
      </Clause>

      <Clause heading="3. Stock and availability">
        <p>
          Quantities shown on product pages reflect stock recorded in our
          inventory system at the time of viewing. Stock is allocated to your
          order when payment is confirmed, not when an item is added to the
          cart. Where an item becomes unavailable after payment we will offer a
          substitution, a revised delivery date, or a refund of that line.
        </p>
      </Clause>

      <Clause heading="4. Delivery and collection">
        <p>
          Delivery windows quoted are estimates in good faith and are not
          guaranteed times of arrival. Risk in the goods passes to you on
          delivery, or on collection from our depot. You must inspect goods on
          receipt and note any shortage or damage on the delivery note.
        </p>
        <p>
          Bulk petroleum deliveries require safe, legal vehicle access and a
          receiving representative at the address. Where a delivery fails for
          reasons within your control, a re-delivery charge may apply.
        </p>
      </Clause>

      <Clause heading="5. Returns and refunds">
        <p>
          Goods that arrive damaged, short or not as described may be rejected
          on delivery or reported within 48 hours. We will replace, redeliver
          or refund at our discretion. For reasons of safety and product
          integrity, petroleum products, lubricants and gas refills cannot be
          returned once decanted or the seal is broken, except where the
          product is defective.
        </p>
      </Clause>

      <Clause heading="6. Bulk and contract supply">
        <p>
          Bulk fuel, framework supply, haulage, construction and facility
          services are supplied under a separate written quotation or contract.
          Where such a contract exists, its terms take precedence over these
          terms to the extent of any conflict.
        </p>
      </Clause>

      <Clause heading="7. Liability">
        <p>
          Nothing in these terms excludes liability for death or personal
          injury caused by our negligence, or for fraud. Subject to that, our
          total liability for any order is limited to the amount you paid for
          it, and we are not liable for indirect or consequential loss
          including loss of profit or production.
        </p>
      </Clause>

      <Clause heading="8. Governing law">
        <p>
          These terms are governed by the laws of the Federal Republic of
          Nigeria, and disputes are subject to the exclusive jurisdiction of
          the Nigerian courts.
        </p>
      </Clause>

      <Clause heading="9. Contact">
        <p>
          {site.legalName}, {site.address.line1}, {site.address.line2},{" "}
          {site.address.city}, {site.address.state}. Email {site.email}, telephone{" "}
          {site.phone}.
        </p>
      </Clause>
    </LegalPage>
  );
}
