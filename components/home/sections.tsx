import { ProductImage } from "@/components/shop/product-image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CreditCard,
  Fuel,
  HardHat,
  Leaf,
  PackageSearch,
  Truck,
  Warehouse,
  Waves,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { services } from "@/lib/site";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  Fuel,
  Waves,
  Truck,
  HardHat,
  PackageSearch,
  Leaf,
};

/** Small reusable section heading so rhythm stays identical page to page. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  tone = "light",
  align = "left",
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  action?: { href: string; label: string };
  tone?: "light" | "dark";
  align?: "left" | "center";
}) {
  const dark = tone === "dark";
  return (
    <div
      className={`flex flex-col gap-6 ${
        align === "center"
          ? "items-center text-center"
          : "md:flex-row md:items-end md:justify-between"
      }`}
    >
      <div className="max-w-2xl">
        <p className={`eyebrow ${dark ? "text-cargo-lit" : "text-cargo"}`}>{eyebrow}</p>
        <h2
          className={`mt-5 text-[2rem] leading-[1.1] sm:text-[2.5rem] ${
            dark ? "text-fg-ink" : "text-fg-bone"
          }`}
        >
          {title}
        </h2>
        {description && (
          <p
            className={`mt-5 text-[1.0625rem] leading-relaxed ${
              dark ? "text-fg-ink-muted" : "text-fg-bone-muted"
            }`}
          >
            {description}
          </p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className={`link-slide inline-flex flex-none items-center gap-2 font-label text-[0.6875rem] tracking-[0.11em] ${
            dark ? "text-fg-ink hover:text-cargo-lit" : "text-fg-bone hover:text-cargo"
          }`}
        >
          {action.label}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ trust */

export function TrustStrip() {
  const items = [
    { icon: Warehouse, title: "Own depot & fleet", copy: "Stock we hold, moved by trucks we control." },
    { icon: CreditCard, title: "Pay online securely", copy: "Card, bank transfer and USSD via Paystack." },
    { icon: Truck, title: "Nationwide delivery", copy: "From Abuja to every state, 24–72 hours." },
    { icon: HardHat, title: "Contract supply", copy: "Scheduled replenishment for sites and plants." },
  ];

  return (
    <section className="border-y border-bone-line bg-bone">
      <div className="container-page grid gap-px overflow-hidden sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.title} className="group flex gap-4 border-bone-line py-9 sm:odd:border-r sm:odd:pr-6 lg:border-r lg:px-7 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0">
            <item.icon className="h-5 w-5 flex-none text-cargo transition-transform duration-300 group-hover:-translate-y-0.5" />
            <div>
              <h3 className="font-display text-[0.9375rem] font-bold text-ink">{item.title}</h3>
              <p className="mt-1 text-[0.8125rem] leading-relaxed text-fg-bone-muted">{item.copy}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- divisions */

export function Divisions() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="What we do"
          title={
            <>
              Six divisions, one <span className="text-cargo">supply chain</span>
            </>
          }
          description="From lifting fuel at the depot to laying the road it travels on, our six divisions cover the whole chain — so one supplier answers for the lot."
          action={{ href: "/services", label: "All divisions" }}
        />

        <div className="mt-14 grid border-t border-l border-bone-line sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = icons[service.icon] ?? PackageSearch;
            return (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group relative flex flex-col border-b border-r border-bone-line bg-bone p-7 transition-colors duration-300 hover:bg-ink lg:p-9"
              >
                <div className="flex items-start justify-between">
                  <Icon className="h-6 w-6 text-cargo transition-transform duration-500 group-hover:scale-110" />
                  <span className="font-mono text-[0.6875rem] text-fg-bone-muted transition-colors group-hover:text-cargo-lit">
                    {service.index}
                  </span>
                </div>

                <h3 className="mt-7 font-display text-lg font-bold leading-tight text-ink transition-colors group-hover:text-white">
                  {service.name}
                </h3>
                <p className="mt-3 flex-1 text-[0.875rem] leading-relaxed text-fg-bone-muted transition-colors group-hover:text-fg-bone-muted">
                  {service.summary}
                </p>

                <span className="mt-7 inline-flex items-center gap-2 font-display text-[0.8125rem] font-bold text-ink transition-colors group-hover:text-cargo">
                  Explore
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- categories */

export function CategoryGrid({
  categories,
}: {
  categories: { id: string; name: string; slug: string; description: string | null; image: string | null; _count: { products: number } }[];
}) {
  return (
    <section className="border-y border-bone-line bg-bone py-20 lg:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Shop online"
          title="Order online, pay on the spot"
          description="Everything below is held in stock and priced live. Add to cart, pay with card, transfer or USSD, and we dispatch."
          action={{ href: "/shop", label: "Browse all products" }}
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className="group relative flex min-h-60 flex-col justify-end overflow-hidden rounded-sm border border-bone-line bg-ink p-6 text-white"
            >
              {category.image && (
                <ProductImage
                  src={category.image}
                  alt=""
                  width={600}
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover opacity-[0.18] mix-blend-luminosity transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] group-hover:opacity-30"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/40" />

              <div className="relative">
                <span className="tnum font-label text-[0.625rem] tracking-[0.13em] text-cargo-lit">
                  {category._count.products} product{category._count.products === 1 ? "" : "s"}
                </span>
                <h3 className="mt-2.5 font-display text-2xl leading-tight">
                  {category.name}
                </h3>
                <p className="mt-2 line-clamp-2 max-w-md text-[0.8125rem] leading-relaxed text-fg-bone-muted">
                  {category.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 font-label text-[0.625rem] tracking-[0.12em] text-cargo-lit">
                  Shop {category.name.toLowerCase()}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ how it works */

export function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Choose your lines",
      copy: "Browse live stock by category. Every item shows the real quantity we are holding right now.",
    },
    {
      n: "02",
      title: "Pay securely",
      copy: "Checkout with Paystack — card, bank transfer, USSD or mobile money. You get a reference immediately.",
    },
    {
      n: "03",
      title: "We pick and dispatch",
      copy: "Payment confirms the order on our floor. Stock is allocated to you and loaded for delivery or pickup.",
    },
    {
      n: "04",
      title: "Track to your door",
      copy: "Follow the order with your reference number until it is signed for at the delivery address.",
    },
  ];

  return (
    <section className="py-20 lg:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="How ordering works"
          title="Four steps from cart to delivery"
          align="center"
        />

        <ol className="mt-20 grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.n} className="relative">
              {/* Connector line between steps on wide screens. */}
              {i < steps.length - 1 && (
                <span className="absolute left-0 right-8 top-[-1.75rem] hidden h-px bg-bone-line lg:block" />
              )}
              <span className="relative inline-block font-mono text-[0.8125rem] text-cargo">
                {step.n}
              </span>
              <h3 className="mt-5 font-display text-base font-bold text-ink">{step.title}</h3>
              <p className="mt-2.5 text-[0.875rem] leading-relaxed text-fg-bone-muted">{step.copy}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- bulk cta */

export function BulkSupplyBand() {
  return (
    <section className="relative overflow-hidden bg-ink text-white">

      <div className="container-page relative grid gap-12 py-20 lg:grid-cols-2 lg:items-center lg:py-24">
        <div>
          <p className="eyebrow text-cargo">Contract & bulk supply</p>
          <h2 className="mt-6 text-[2rem] leading-[1.08] sm:text-[2.75rem]">
            Buying by the tanker,
            <br />
            not by the drum?
          </h2>
          <p className="mt-5 max-w-lg text-[1.0625rem] leading-relaxed text-fg-bone-muted">
            Bulk AGO, trailer-load cement, site consumables on a monthly
            schedule, or a full haulage contract — priced against volume and
            committed to in writing.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/contact" size="lg">
              Request a quotation
            </ButtonLink>
            <ButtonLink
              href="/services"
              size="lg"
              variant="outline"
              className="border-white/25 text-white hover:border-white hover:bg-white hover:text-ink"
            >
              See our capabilities
            </ButtonLink>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-white/10 bg-white/10">
          {[
            { v: "5,000 L", l: "Minimum bulk fuel load" },
            { v: "24–72 hr", l: "Typical delivery window" },
            { v: "36", l: "States covered" },
            { v: "2018", l: "Incorporated in Nigeria" },
          ].map((s) => (
            <div key={s.l} className="border-b border-r border-ink-line p-8">
              <dt className="tnum font-display text-3xl text-cargo-lit">{s.v}</dt>
              <dd className="mt-2 text-[0.8125rem] leading-snug text-fg-bone-muted">{s.l}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ closer */

export function ClosingCta() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container-page">
        <div className="border-y border-bone-line px-8 py-20 text-center lg:py-24">
          <p className="eyebrow text-cargo">Get started</p>
          <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-extrabold leading-[1.08] text-ink sm:text-[2.5rem]">
            Tell us what you need supplied, and where.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-fg-bone-muted">
            Order the standard lines online in minutes, or talk to us about a
            supply contract that fits your operation.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/shop" size="lg">
              Shop the catalogue
            </ButtonLink>
            <ButtonLink href="/contact" size="lg" variant="outline">
              Speak to our team
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
