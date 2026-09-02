import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { services, site } from "@/lib/site";

const shopLinks = [
  { href: "/shop?category=petroleum-products", label: "Petroleum products" },
  { href: "/shop?category=lubricants-and-oils", label: "Lubricants & oils" },
  { href: "/shop?category=building-materials", label: "Building materials" },
  { href: "/shop?category=beverages-and-consumables", label: "Beverages" },
  { href: "/shop?category=fmcg", label: "FMCG & household" },
  { href: "/shop?category=appliances-and-power", label: "Appliances & power" },
  { href: "/shop?category=safety-and-industrial", label: "Safety & industrial" },
];

const companyLinks = [
  { href: "/about", label: "About Suez Trading" },
  { href: "/services", label: "Our divisions" },
  { href: "/contact", label: "Contact & quotes" },
  { href: "/track", label: "Track an order" },
  { href: "/faq", label: "Help & FAQ" },
];

export function Footer() {
  return (
    <footer className="mt-auto bg-ink text-fg-ink-muted">
      <div className="h-px bg-cargo" />

      <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-4">
          <Logo tone="light" />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-fg-ink-muted">
            {site.description}
          </p>

          <address className="mt-8 space-y-3 text-sm not-italic">
            <div className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 flex-none text-cargo" />
              <span className="leading-relaxed">
                {site.address.line1}, {site.address.line2}
                <br />
                {site.address.city}, {site.address.state}
                <br />
                {site.address.country}
              </span>
            </div>
            <a
              href={`tel:${site.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-3 font-mono text-[0.8125rem] transition-colors hover:text-cargo"
            >
              <Phone className="h-4 w-4 flex-none text-cargo" />
              {site.phone}
            </a>
            <a
              href={`mailto:${site.email}`}
              className="flex items-center gap-3 font-mono text-[0.8125rem] transition-colors hover:text-cargo"
            >
              <Mail className="h-4 w-4 flex-none text-cargo" />
              {site.email}
            </a>
          </address>
        </div>

        <FooterColumn title="Shop" links={shopLinks} className="lg:col-span-3" />
        <FooterColumn
          title="Divisions"
          links={services.map((s) => ({ href: `/services/${s.slug}`, label: s.short }))}
          className="lg:col-span-3"
        />
        <FooterColumn title="Company" links={companyLinks} className="lg:col-span-2" />
      </div>

      {/* The other Suez subsidiaries, so the group reads as one thing. */}
      <div className="border-t border-ink-line">
        <div className="container-page flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-label text-[0.625rem] tracking-[0.13em] text-fg-ink-muted">
            Suez Group
          </p>
          <div className="flex flex-wrap gap-x-7 gap-y-2">
            {[
              { label: "Suez Electric", href: "https://suezelectric.vercel.app" },
              { label: "Suez Gas", href: "https://suezgas.vercel.app" },
              { label: "Suez Trading", href: "/" },
            ].map((brand) => (
              <a
                key={brand.label}
                href={brand.href}
                className="link-slide font-label text-[0.625rem] tracking-[0.13em] text-fg-ink-muted transition-colors hover:text-cargo"
              >
                {brand.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-ink-line">
        <div className="container-page flex flex-col gap-4 py-6 text-xs text-fg-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.legalName}. Registered in Nigeria under the
            Companies and Allied Matters Act.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/legal/terms" className="transition-colors hover:text-cargo">
              Terms
            </Link>
            <Link href="/legal/privacy" className="transition-colors hover:text-cargo">
              Privacy
            </Link>
            <Link href="/legal/shipping" className="transition-colors hover:text-cargo">
              Delivery &amp; returns
            </Link>
            <span className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-signal" />
              Payments secured by Paystack
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
  className,
}: {
  title: string;
  links: { href: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="font-label text-[0.625rem] tracking-[0.13em] text-fg-ink">
        {title}
      </h3>
      <ul className="mt-5 space-y-3 text-sm">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link href={l.href} className="link-slide text-fg-ink-muted transition-colors hover:text-cargo">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
