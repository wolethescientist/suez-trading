import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, ChevronRight } from "lucide-react";
import { getService, services } from "@/lib/site";
import { ButtonLink } from "@/components/ui/button";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return { title: "Service not found" };
  return { title: service.name, description: service.summary };
}

export default async function ServicePage({ params }: { params: Params }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const others = services.filter((s) => s.slug !== slug);

  return (
    <>
      <nav aria-label="Breadcrumb" className="border-b border-ink-line bg-ink">
        <ol className="container-page flex flex-wrap items-center gap-1.5 py-3.5 font-label text-[0.625rem] tracking-[0.1em] text-fg-ink-muted">
          <li><Link href="/" className="hover:text-ink">Home</Link></li>
          <ChevronRight className="h-3.5 w-3.5" />
          <li><Link href="/services" className="hover:text-ink">Services</Link></li>
          <ChevronRight className="h-3.5 w-3.5" />
          <li className="font-semibold text-ink">{service.short}</li>
        </ol>
      </nav>

      <section className="relative overflow-hidden bg-ink text-white">
        <div className="container-page relative grid gap-10 py-16 lg:grid-cols-12 lg:py-24">
          <div className="lg:col-span-7">
            <p className="eyebrow text-cargo">Division {service.index}</p>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.04] sm:text-[3.25rem]">
              {service.name}
            </h1>
            <p className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-fg-ink-muted">
              {service.intro}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/contact" size="lg">
                Request a quote
              </ButtonLink>
              <ButtonLink
                href="/shop"
                size="lg"
                variant="outline"
                className="border-white/25 text-white hover:border-white hover:bg-white hover:text-ink"
              >
                Shop related products
              </ButtonLink>
            </div>
          </div>

          <dl className="grid content-start gap-px overflow-hidden rounded-sm border border-white/10 bg-white/10 lg:col-span-5">
            {service.outcomes.map((o) => (
              <div key={o.label} className="flex items-baseline justify-between border-b border-r border-ink-line px-6 py-5">
                <dt className="font-label text-[0.625rem] tracking-[0.11em] text-fg-ink-muted">{o.label}</dt>
                <dd className="font-display text-lg text-cargo-lit">{o.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="h-px bg-cargo" />
      </section>

      <section className="container-page py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow text-cargo">Scope</p>
            <h2 className="mt-4 text-2xl font-extrabold text-ink sm:text-3xl">
              What this division covers
            </h2>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-fg-bone-muted">
              Drawn directly from our objects of incorporation — this is work we
              are constituted and equipped to do.
            </p>
          </div>

          <ul className="grid gap-px overflow-hidden rounded-sm border border-bone-line bg-bone-line sm:grid-cols-2 lg:col-span-8">
            {service.capabilities.map((capability) => (
              <li key={capability} className="flex gap-3 bg-white p-6">
                <Check className="mt-0.5 h-4 w-4 flex-none text-signal" />
                <span className="text-[0.9375rem] leading-relaxed text-ink-3">
                  {capability}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-bone-line bg-bone py-16 lg:py-20">
        <div className="container-page">
          <h2 className="font-display text-lg font-bold text-ink">Other divisions</h2>
          <div className="mt-6 grid gap-px overflow-hidden rounded-sm border border-bone-line bg-bone-line sm:grid-cols-2 lg:grid-cols-5">
            {others.map((other) => (
              <Link
                key={other.slug}
                href={`/services/${other.slug}`}
                className="group bg-white p-6 transition-colors hover:bg-ink"
              >
                <span className="font-mono text-[0.6875rem] font-bold text-cargo">
                  {other.index}
                </span>
                <span className="mt-2 block font-display text-[0.9375rem] font-bold leading-tight text-ink transition-colors group-hover:text-white">
                  {other.short}
                </span>
                <ArrowRight className="mt-4 h-4 w-4 text-fg-bone-muted transition-all duration-300 group-hover:translate-x-1 group-hover:text-cargo" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
