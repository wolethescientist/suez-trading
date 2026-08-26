import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/site/contact-form";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact & quotes",
  description:
    "Request a quotation or speak to the Suez Trading team about petroleum supply, building materials, haulage, construction or facility services.",
};

export default function ContactPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="container-page relative py-16 lg:py-20">
          <p className="eyebrow text-cargo">Get in touch</p>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.04] sm:text-[3.25rem]">
            Tell us what you need supplied
          </h1>
          <p className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-fg-ink-muted">
            Quotation requests, contract supply, order support or a question
            about something not in the catalogue — this reaches the right desk.
          </p>
        </div>
        <div className="h-px bg-cargo" />
      </section>

      <section className="container-page grid gap-14 py-16 lg:grid-cols-12 lg:gap-20 lg:py-24">
        <div className="lg:col-span-7">
          <h2 className="font-display text-xl font-bold text-ink">Send us a message</h2>
          <p className="mt-2 text-[0.9375rem] text-fg-bone-muted">
            Fields marked with an asterisk are required.
          </p>
          <div className="mt-8">
            <ContactForm />
          </div>
        </div>

        <aside className="space-y-5 lg:col-span-5">
          <ContactCard icon={Phone} title="Call the sales desk">
            <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-cargo">
              {site.phone}
            </a>
          </ContactCard>

          <ContactCard icon={MessageCircle} title="WhatsApp">
            <a
              href={`https://wa.me/${site.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cargo"
            >
              Message us on WhatsApp
            </a>
          </ContactCard>

          <ContactCard icon={Mail} title="Email">
            <a href={`mailto:${site.email}`} className="block hover:text-cargo">
              {site.email}
            </a>
            <a href={`mailto:${site.supportEmail}`} className="block hover:text-cargo">
              {site.supportEmail}
            </a>
          </ContactCard>

          <ContactCard icon={MapPin} title="Registered office">
            {site.address.line1}
            <br />
            {site.address.line2}
            <br />
            {site.address.city}, {site.address.state}
            <br />
            {site.address.country}
          </ContactCard>

          <ContactCard icon={Clock} title="Opening hours">
            {site.hours}
          </ContactCard>

          <div className="rounded-sm bg-ink p-6 text-white">
            <h3 className="font-display text-[0.9375rem] font-bold">
              Already ordered online?
            </h3>
            <p className="mt-2 text-[0.875rem] leading-relaxed text-fg-bone-muted">
              Have your order reference to hand — it starts with{" "}
              <span className="font-mono text-cargo">SUEZ-</span> and is on your
              confirmation email.
            </p>
          </div>
        </aside>
      </section>
    </>
  );
}

function ContactCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 rounded-sm border border-bone-line p-5">
      <Icon className="mt-0.5 h-4.5 w-4.5 flex-none text-cargo" />
      <div>
        <h3 className="font-display text-[0.8125rem] font-bold uppercase tracking-wider text-fg-bone-muted">
          {title}
        </h3>
        <div className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-2">{children}</div>
      </div>
    </div>
  );
}
