import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { getSettings } from "@/lib/settings";
import { formatNaira } from "@/lib/money";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Help & FAQ",
  description:
    "Answers to common questions about ordering, payment, delivery, bulk supply and returns at Suez Trading Internationale Limited.",
};
export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const settings = await getSettings();

  const groups = [
    {
      title: "Ordering",
      items: [
        {
          q: "Do I need an account to order?",
          a: "No. Add what you need to the cart, enter your contact and delivery details at checkout, and pay. Your order reference is your record — keep the confirmation email.",
        },
        {
          q: "Is the stock quantity shown accurate?",
          a: "Yes. The figure on each product page is read live from our inventory system and reflects what we are physically holding. It reduces the moment another customer's payment is confirmed.",
        },
        {
          q: "Can I order something that is not listed?",
          a: "Often, yes — we are a general merchant and we source to order. Send the specification and quantity through the contact form and we will come back with a price and lead time.",
        },
        {
          q: "What is the minimum order?",
          a: "It varies by line. Fuel sold by the litre has a minimum of 50 to 100 litres; most packaged goods have no minimum. Any minimum is shown on the product page.",
        },
      ],
    },
    {
      title: "Payment",
      items: [
        {
          q: "How do I pay?",
          a: "Through Paystack, which accepts debit and credit cards, bank transfer, USSD and mobile money. You are taken to Paystack's secure page to pay and returned here afterwards.",
        },
        {
          q: "Do you store my card details?",
          a: "No. Card details are entered on Paystack's own pages and never reach our servers. We only see the amount, the channel used and whether the payment succeeded.",
        },
        {
          q: "Can I pay on delivery or on account?",
          a: "Not for online orders. Corporate customers on a supply contract can be invoiced on agreed terms — contact us to set that up.",
        },
        {
          q: "My payment failed but I was debited.",
          a: "Failed transactions are reversed automatically by the bank, usually within 24 hours. Send us your order reference and we will confirm what Paystack recorded.",
        },
      ],
    },
    {
      title: "Delivery",
      items: [
        {
          q: "What does delivery cost?",
          a: `A flat ${formatNaira(settings.shippingFlatRate)} per order, free above ${formatNaira(settings.freeShippingThreshold)}. Bulk fuel and full trailer loads are quoted separately.`,
        },
        {
          q: "How long does delivery take?",
          a: "Within Abuja and the FCT, usually 24 hours from payment confirmation. Elsewhere in Nigeria, typically 48 to 72 hours.",
        },
        {
          q: "Can I collect instead?",
          a: `Yes, collection is free from ${settings.pickupAddress}. Choose depot pickup at checkout and we will call when your order is ready.`,
        },
      ],
    },
    {
      title: "Bulk & contract supply",
      items: [
        {
          q: "Do you supply fuel on contract?",
          a: "Yes. Scheduled AGO, PMS and DPK replenishment with agreed lifting windows and volume-based pricing. Minimum bulk load is 5,000 litres.",
        },
        {
          q: "Do you handle haulage for third parties?",
          a: "Yes — tanker haulage, general cargo and heavy goods movement by road anywhere in Nigeria, whether or not we supplied the goods.",
        },
        {
          q: "Can you quote for a construction project?",
          a: "Yes. We deliver roads, bridges, waterway and building works, and can supply the materials for them from our own stock.",
        },
      ],
    },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="container-page relative py-16 lg:py-20">
          <p className="eyebrow text-cargo">Help centre</p>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.04] sm:text-[3.25rem]">
            Questions, answered
          </h1>
          <p className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-fg-ink-muted">
            If your question is not here, call {site.phone} or{" "}
            <Link href="/contact" className="text-cargo underline underline-offset-4">
              send us a message
            </Link>
            .
          </p>
        </div>
        <div className="h-px bg-cargo" />
      </section>

      <section className="container-page py-16 lg:py-24">
        <div className="space-y-16">
          {groups.map((group) => (
            <div key={group.title} className="grid gap-8 lg:grid-cols-12 lg:gap-14">
              <h2 className="font-display text-2xl font-extrabold text-ink lg:col-span-4">
                {group.title}
              </h2>
              <div className="divide-y divide-bone-line border-y border-bone-line lg:col-span-8">
                {group.items.map((item) => (
                  <details key={item.q} className="group py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-[1.0625rem] font-bold text-ink marker:hidden">
                      {item.q}
                      <span className="relative grid h-6 w-6 flex-none place-items-center rounded-full border border-bone-line transition-colors group-open:border-ink group-open:bg-ink">
                        <span className="h-px w-2.5 bg-ink-3 transition-colors group-open:bg-white" />
                        <span className="absolute h-2.5 w-px bg-ink-3 transition-all group-open:scale-y-0 group-open:bg-white" />
                      </span>
                    </summary>
                    <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-fg-bone-muted">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 rounded-sm border border-bone-line bg-bone px-8 py-14 text-center">
          <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">
            Still need a hand?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[0.9375rem] leading-relaxed text-fg-bone-muted">
            Our sales desk is open {site.hours}.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/contact" size="lg">
              Contact us
            </ButtonLink>
            <ButtonLink href="/track" size="lg" variant="outline">
              Track an order
            </ButtonLink>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: groups.flatMap((g) =>
              g.items.map((i) => ({
                "@type": "Question",
                name: i.q,
                acceptedAnswer: { "@type": "Answer", text: i.a },
              })),
            ),
          }),
        }}
      />
    </>
  );
}
