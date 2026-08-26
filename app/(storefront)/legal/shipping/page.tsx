import type { Metadata } from "next";
import { Clause, LegalPage } from "@/components/site/legal-page";
import { getSettings } from "@/lib/settings";
import { formatNaira } from "@/lib/money";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Delivery & returns" };
export const dynamic = "force-dynamic";

export default async function ShippingPage() {
  const settings = await getSettings();

  return (
    <LegalPage eyebrow="Help" title="Delivery & returns" updated="26 August 2026">
      <p className="text-[1.0625rem] leading-relaxed text-ink-3">
        How your order gets to you, what it costs, and what to do if something
        arrives wrong.
      </p>

      <Clause heading="Delivery charges">
        <p>
          Delivery is charged at a flat {formatNaira(settings.shippingFlatRate)}{" "}
          per order and is free on orders above{" "}
          {formatNaira(settings.freeShippingThreshold)}. Bulk petroleum loads,
          full trailer loads of building materials and out-of-state heavy goods
          are quoted individually — contact us before ordering these online.
        </p>
      </Clause>

      <Clause heading="Delivery times">
        <p>
          Abuja and the Federal Capital Territory: usually within 24 hours of
          payment confirmation. Other states: typically 48 to 72 hours,
          depending on load consolidation and route. We call ahead before every
          delivery.
        </p>
      </Clause>

      <Clause heading="Depot collection">
        <p>
          Collection is free from {settings.pickupAddress}. We will call you
          when your order is picked and ready. Bring your order reference and a
          means of identification.
        </p>
      </Clause>

      <Clause heading="Checking your delivery">
        <p>
          Inspect goods before signing. Note any shortage, breakage or wrong
          item on the delivery note at the point of receipt — this is what lets
          us resolve it quickly with the driver and the warehouse.
        </p>
      </Clause>

      <Clause heading="Returns">
        <p>
          Report damaged, short or incorrect goods within 48 hours of delivery
          with your order reference and photographs where relevant. We will
          replace, redeliver or refund. Goods must be unused and in original
          packaging where a return is agreed.
        </p>
        <p>
          Petroleum products, lubricants and gas refills cannot be returned once
          decanted or unsealed, except where the product itself is defective.
          Special-order and cut-to-size items are non-returnable unless faulty.
        </p>
      </Clause>

      <Clause heading="Refunds">
        <p>
          Approved refunds are returned to the original payment method through
          Paystack, normally within 5 to 10 working days depending on your bank.
        </p>
      </Clause>

      <Clause heading="Questions">
        <p>
          Call {settings.contactPhone} or email {settings.contactEmail}. Quote
          your order reference — it begins with {site.shortName}-.
        </p>
      </Clause>
    </LegalPage>
  );
}
