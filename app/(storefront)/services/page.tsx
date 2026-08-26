import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { services, site } from "@/lib/site";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Services & divisions",
  description:
    "Petroleum supply, oil and gas field services, haulage, construction, general supplies and facility services from Suez Trading Internationale Limited.",
};

export default function ServicesPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="container-page relative py-16 lg:py-24">
          <p className="eyebrow text-cargo">Capabilities</p>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.03] sm:text-[3.25rem]">
            Six divisions built on one memorandum
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
