import type { Metadata } from "next";
import {
  Gauge,
  Layers,
  MapPin,
  ScrollText,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { services, site } from "@/lib/site";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description:
    "Suez Trading Internationale Limited is a Nigerian trading and services company registered under the Companies and Allied Matters Act, operating from Jabi, Abuja.",
};

/**
 * The five guiding principles as published on the previous sueztrading.com,
 * kept word for word — this is the company's own language, not ours.
 */
const values = [
  {
    icon: Gauge,
    title: "Efficiency-Driven Culture",
    copy: "We prioritize streamlined systems and operational excellence to deliver energy through efficient, high performing value chains.",
  },
  {
    icon: Layers,
    title: "Integrated Energy Services",
    copy: "Our end-to-end capabilities from import and storage to retail, ensure quality control, cost efficiency, and timely delivery.",
  },
  {
    icon: ShieldCheck,
    title: "Safety as a Core Value",
    copy: "We champion consumer safety through innovative solutions like our SRG leak-detection regulators, reinforcing responsible energy use.",
  },
  {
    icon: Zap,
    title: "Decentralized Energy Vision",
    copy: "We invest in smart, decentralized systems that bring energy closer to users and support a low-carbon, sustainable future.",
  },
  {
    icon: ScrollText,
    title: "Compliance and Standards",
    copy: "We operate with integrity, adhering to regulatory standards and best practices to ensure long-term trust and sustainability.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="container-page relative py-16 lg:py-24">
          <p className="eyebrow text-cargo">About us</p>
          <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.03] sm:text-[3.25rem]">
            A Nigerian trading company that also moves, builds and services what it sells.
          </h1>
          <p className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-fg-ink-muted">
            {site.legalName} was incorporated in {site.incorporated} as a private
            company limited by shares, registered with the Corporate Affairs
            Commission under the Companies and Allied Matters Act. We operate
            from Jabi, Abuja, and trade nationwide.
          </p>
        </div>
        <div className="h-px bg-cargo" />
      </section>

      <section className="container-page py-16 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="eyebrow text-cargo">Our story</p>
            <h2 className="mt-4 text-3xl font-extrabold text-ink">
              Built around a simple frustration
            </h2>
            <div className="mt-6 space-y-5 text-[1.0625rem] leading-relaxed text-ink-3">
              <p>
                Anyone who has run a site in Nigeria knows the pattern: the
                cement arrives but the diesel does not, the truck is booked but
                the driver is not, and three suppliers each blame the other two.
                Every delay costs a day, and every day costs money.
              </p>
              <p>
                Suez Trading was set up to close those gaps. Our objects of
                incorporation deliberately span petroleum trading and haulage,
                oil and gas field services, construction and civil works,
                general merchandise and distribution, and facility and
                environmental services. That is not a scatter-gun — it is one
                supply chain, held end to end.
              </p>
              <p>
                Today we supply refined petroleum products in bulk and retail,
                stock building materials, FMCG and general goods for sale online
                and on contract, run haulage across the country, and deliver
                construction and facility services for public and private
                clients.
              </p>
              <p>
                At Suez Trading Internationale, we go beyond traditional LPG
                distribution. Since 2018, we&rsquo;ve evolved into a diversified
                energy and infrastructure powerhouse, specializing in the
                importation, retail, storage, and safe delivery of energy
                products. We&rsquo;ve embedded performance, compliance, and
                innovation into our DNA, and we&rsquo;re actively building the
                future of energy through decentralized systems and cutting-edge
                safety technology. Our vision is clear: to build infrastructure
                capacity that brings energy solutions closer to the people who
                need them most.
              </p>
            </div>
          </div>

          <aside className="lg:col-span-5">
            <div className="rounded-sm border border-bone-line bg-bone p-7">
              <h3 className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-fg-bone-muted">
                Company record
              </h3>
              <dl className="mt-5 space-y-4 text-sm">
                <Record label="Registered name" value={site.legalName} />
                <Record label="Company type" value="Private company limited by shares" />
                <Record label="Jurisdiction" value="Federal Republic of Nigeria" />
                <Record label="Registry" value="Corporate Affairs Commission" />
                <Record label="Incorporated" value={site.incorporated} />
                <Record label="Stamp duty certificate" value={site.stampDutyCert} mono />
                <Record
                  label="Registered office"
                  value={`${site.address.line1}, ${site.address.line2}, ${site.address.city}, ${site.address.state}`}
                />
              </dl>
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-sm border border-bone-line p-5">
              <MapPin className="mt-0.5 h-4.5 w-4.5 flex-none text-cargo" />
              <p className="text-[0.875rem] leading-relaxed text-fg-bone-muted">
                Head office in Jabi, Abuja, with delivery coverage across all
                36 states and the Federal Capital Territory.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-ink py-16 text-white lg:py-24">
        <div className="container-page grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="eyebrow text-cargo">How we work</p>
            <h2 className="mt-4 text-3xl font-extrabold leading-[1.06] sm:text-[2.5rem]">
              Our Approach
            </h2>
          </div>
          <p className="text-[1.0625rem] leading-relaxed text-fg-ink-muted lg:col-span-8">
            Our approach is anchored in innovation, efficiency, and safety. Our
            operations are guided by an integrated infrastructure strategy that
            enhances the full energy value chain, from importation and storage
            to retail and decentralized distribution. We prioritize compliance,
            stakeholder value, and cutting-edge safety systems, including
            proprietary leak-detection technology. Through continuous
            performance improvement and investment in future ready systems, we
            are shaping a resilient, accessible, and low-carbon energy future.
          </p>
        </div>
      </section>

      <section className="border-y border-bone-line bg-bone py-16 lg:py-24">
        <div className="container-page">
          <p className="eyebrow text-cargo">Our values</p>
          <h2 className="mt-4 max-w-2xl text-3xl font-extrabold text-ink">
            Guiding principles of our voyage
          </h2>

          <div className="mt-12 grid gap-px overflow-hidden rounded-sm border border-bone-line bg-bone-line sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => (
              <div key={value.title} className="bg-white p-8">
                <value.icon className="h-6 w-6 text-cargo" />
                <h3 className="mt-6 font-display text-lg font-bold leading-tight text-ink">
                  {value.title}
                </h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-fg-bone-muted">
                  {value.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16 lg:py-24">
        <p className="eyebrow text-cargo">Structure</p>
        <h2 className="mt-4 text-3xl font-extrabold text-ink">Our divisions</h2>
        <div className="mt-10 grid gap-px overflow-hidden rounded-sm border border-bone-line bg-bone-line sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div key={service.slug} className="bg-white p-7">
              <span className="font-mono text-[0.6875rem] font-bold text-cargo">
                {service.index}
              </span>
              <h3 className="mt-2 font-display text-base font-bold text-ink">
                {service.name}
              </h3>
              <p className="mt-2.5 text-[0.875rem] leading-relaxed text-fg-bone-muted">
                {service.summary}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center gap-4 rounded-sm bg-ink px-8 py-14 text-center text-white">
          <h2 className="max-w-xl text-2xl font-extrabold sm:text-3xl">
            Work with us
          </h2>
          <p className="max-w-lg text-[0.9375rem] leading-relaxed text-fg-bone-muted">
            Whether it is one crate of water or a year of scheduled fuel
            deliveries, we would like to quote for it.
          </p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/contact" size="lg">
              Get in touch
            </ButtonLink>
            <ButtonLink
              href="/shop"
              size="lg"
              variant="outline"
              className="border-white/25 text-white hover:border-white hover:bg-white hover:text-ink"
            >
              Shop online
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}

function Record({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[0.6875rem] uppercase tracking-wider text-fg-bone-muted">{label}</dt>
      <dd className={`mt-1 font-semibold text-ink ${mono ? "font-mono text-[0.8125rem]" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
