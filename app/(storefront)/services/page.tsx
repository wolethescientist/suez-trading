import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Flame, Ship, ShieldCheck, Warehouse } from "lucide-react";
import { services, site } from "@/lib/site";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Services & divisions",
  description:
    "Petroleum supply, oil and gas field services, haulage, construction, general supplies, FMCG distribution and facility services from Suez Trading Internationale Limited.",
};

/**
 * The four energy capabilities as published on the previous sueztrading.com,
 * kept word for word. They cut across divisions 01 and 02 rather than sitting
 * inside either, which is why they get their own band instead of a card.
 */
const energyCapabilities = [
  {
    icon: Flame,
    title: "LNG Solutions",
    copy: "Supporting industrial clients with LNG infrastructure and supply, from terminal design to last-mile delivery, we ensure seamless integration.",
  },
  {
    icon: Ship,
    title: "Import & Export of LPG",
    copy: "Supporting cross-border trade with expertise in regulatory compliance, customs clearance, and marine transport coordination.",
  },
  {
    icon: Warehouse,
    title: "Storage & Haulage",
    copy: "Modern, monitored storage facilities and certified haulage fleets that comply with international safety standards, minimizing risk, maximizing uptime.",
  },
  {
    icon: ShieldCheck,
    title: "Safety Technologies",
    copy: "Through our partnership with SRG, we offer proprietary gas regulators equipped with leak detection and pressure monitoring features.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="container-page relative py-16 lg:py-24">
          <p className="eyebrow text-cargo">Capabilities</p>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.03] sm:text-[3.25rem]">
            Seven divisions built on one memorandum
          </h1>
          <p className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-fg-ink-muted">
            {site.legalName} was incorporated to trade, transport, build and
            service — and that breadth is deliberate. When one supplier holds
            the fuel, the materials and the trucks, fewer things fall between
            the gaps.
          </p>
        </div>
        <div className="h-px bg-cargo" />
      </section>

      <section className="container-page py-16 lg:py-24">
        <div className="space-y-px overflow-hidden rounded-sm border border-bone-line bg-bone-line">
          {services.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="group grid gap-6 bg-white p-7 transition-colors hover:bg-bone lg:grid-cols-12 lg:items-center lg:gap-10 lg:p-10"
            >
              <div className="lg:col-span-1">
                <span className="font-mono text-sm font-bold text-cargo">
                  {service.index}
                </span>
              </div>
              <div className="lg:col-span-4">
                <h2 className="font-display text-xl font-extrabold leading-tight text-ink">
                  {service.name}
                </h2>
              </div>
              <div className="lg:col-span-5">
                <p className="text-[0.9375rem] leading-relaxed text-fg-bone-muted">
                  {service.summary}
                </p>
              </div>
              <div className="lg:col-span-2 lg:text-right">
                <span className="inline-flex items-center gap-2 font-display text-[0.8125rem] font-bold text-ink transition-colors group-hover:text-cargo">
                  Details
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-20 border-t border-bone-line pt-16">
          <p className="eyebrow text-cargo">Energy capabilities</p>
          <h2 className="mt-4 max-w-2xl text-3xl font-extrabold leading-[1.08] text-ink sm:text-[2.5rem]">
            Energizing Tomorrow, Safely and Seamlessly
          </h2>
          <p className="mt-5 max-w-3xl text-[1.0625rem] leading-relaxed text-fg-bone-muted">
            We go beyond traditional energy distribution. We have evolved into a
            diversified energy and infrastructure powerhouse, specializing in the
            importation, retail, storage, and safe delivery of energy products.
            We have also embedded performance, compliance, and innovation into
            our processes. Our vision is clear: to build infrastructure capacity
            that brings energy solutions closer to the people who need them most.
          </p>

          <div className="mt-12 grid gap-px overflow-hidden rounded-sm border border-bone-line bg-bone-line sm:grid-cols-2">
            {energyCapabilities.map((item) => (
              <div key={item.title} className="bg-white p-8 lg:p-10">
                <item.icon className="h-6 w-6 text-cargo" />
                <h3 className="mt-6 font-display text-lg font-extrabold leading-tight text-ink">
                  {item.title}
                </h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-fg-bone-muted">
                  {item.copy}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 rounded-sm border border-bone-line bg-bone p-10 text-center lg:p-14">
          <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">
            Not sure which division you need?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-fg-bone-muted">
            Describe the job and we will route it to the right team — or tell
            you honestly if it is not something we should be doing.
          </p>
          <ButtonLink href="/contact" size="lg" className="mt-8">
            Talk to us
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
