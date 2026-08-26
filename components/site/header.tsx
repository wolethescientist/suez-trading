"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Phone, Search, ShoppingBag, X } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { useCart } from "@/components/cart/cart-provider";
import { ButtonLink } from "@/components/ui/button";
import { navLinks, services, site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Header({ announcement }: { announcement?: string | null }) {
  const pathname = usePathname();
  const { count, openDrawer, ready } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {announcement && (
        <div className="hidden bg-ink py-2 text-center text-[0.75rem] text-bone-line sm:block">
          <div className="container-page flex items-center justify-center gap-2">
            <span className="h-1 w-1 flex-none rounded-full bg-cargo" />
            <span className="font-label text-[0.625rem] tracking-[0.12em] text-fg-ink-muted">
              {announcement}
            </span>
          </div>
        </div>
      )}

      <header
        className={cn(
          "sticky top-0 z-60 border-b bg-ink/92 text-fg-ink backdrop-blur-md transition-colors duration-300",
          scrolled ? "border-ink-line" : "border-transparent",
        )}
      >
        <div className="container-page flex h-16 items-center gap-6 lg:h-18">
          <Logo tone="light" />

          <nav className="ml-auto hidden items-center gap-1 lg:flex">
            {navLinks.map((link) =>
              link.label === "Services" ? (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => setServicesOpen(true)}
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "flex h-9 items-center px-3 font-label text-[0.6875rem] tracking-[0.11em] transition-colors",
                      isActive(link.href)
                        ? "text-cargo-lit"
                        : "text-fg-ink-muted hover:text-fg-ink",
                    )}
                  >
                    {link.label}
                  </Link>
                  <div
                    className={cn(
                      "absolute left-1/2 top-full w-[30rem] -translate-x-1/2 pt-2 transition-all duration-200",
                      servicesOpen
                        ? "visible translate-y-0 opacity-100"
                        : "invisible -translate-y-1 opacity-0",
                    )}
                  >
                    <div className="grid grid-cols-2 border-t border-l border-ink-line bg-ink">
                      {services.map((s) => (
                        <Link
                          key={s.slug}
                          href={`/services/${s.slug}`}
                          className="group border-b border-r border-ink-line p-4 transition-colors hover:bg-ink-2"
                        >
                          <span className="font-mono text-[0.625rem] text-cargo-lit">
                            {s.index}
                          </span>
                          <span className="mt-0.5 block font-display text-[0.8125rem] font-bold leading-tight text-ink">
                            {s.short}
                          </span>
                          <span className="mt-1.5 block text-[0.6875rem] leading-relaxed text-fg-ink-muted">
                            {s.summary.slice(0, 62)}…
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex h-9 items-center px-3 font-label text-[0.6875rem] tracking-[0.11em] transition-colors",
                    isActive(link.href) ? "text-cargo-lit" : "text-fg-ink-muted hover:text-fg-ink",
                  )}
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>

          <div className="ml-auto flex items-center gap-1 lg:ml-0 lg:gap-2">
            <Link
              href="/shop"
              aria-label="Search products"
              className="hidden h-9 w-9 place-items-center text-fg-ink-muted transition-colors hover:text-fg-ink sm:grid"
            >
              <Search className="h-4.5 w-4.5" />
            </Link>

            <a
              href={`tel:${site.phone.replace(/\s/g, "")}`}
              className="hidden items-center gap-2 px-3 py-2 font-mono text-[0.75rem] text-fg-ink-muted transition-colors hover:text-cargo-lit xl:flex"
            >
              <Phone className="h-3.5 w-3.5 text-cargo" />
              {site.phone}
            </a>

            <button
              onClick={openDrawer}
              aria-label={`Open cart, ${count} items`}
              className="relative grid h-9 w-9 place-items-center text-fg-ink-muted transition-colors hover:text-fg-ink"
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              {ready && count > 0 && (
                <span className="tnum absolute -right-0.5 -top-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-cargo px-1 font-label text-[0.5625rem] text-white">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </button>

            <ButtonLink href="/contact" size="sm" className="hidden lg:inline-flex">
              Request a quote
            </ButtonLink>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              className="grid h-9 w-9 place-items-center text-fg-ink-muted transition-colors hover:text-fg-ink lg:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        <div
          className={cn(
            "overflow-hidden border-t border-ink-line bg-ink transition-[max-height,opacity] duration-300 lg:hidden",
            mobileOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <nav className="container-page flex flex-col py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "border-b border-ink-line py-3.5 font-label text-[0.75rem] tracking-[0.1em]",
                  isActive(link.href) ? "text-cargo-lit" : "text-fg-ink",
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="grid grid-cols-2 gap-1 py-3">
              {services.map((s) => (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="border border-ink-line px-3 py-2 font-label text-[0.625rem] tracking-[0.1em] text-fg-ink-muted"
                >
                  {s.short}
                </Link>
              ))}
            </div>
            <ButtonLink
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="my-2 w-full"
            >
              Request a quote
            </ButtonLink>
          </nav>
        </div>
      </header>
    </>
  );
}
