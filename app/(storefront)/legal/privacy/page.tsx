import type { Metadata } from "next";
import { Clause, LegalPage } from "@/components/site/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy policy" updated="26 August 2026">
      <p className="text-[1.0625rem] leading-relaxed text-ink-3">
        This policy explains what personal data {site.legalName} collects when
        you use this website, why we collect it, and what rights you have. It is
        written with the Nigeria Data Protection Act in mind.
      </p>

      <Clause heading="What we collect">
        <p>
          When you place an order we collect your name, email address, phone
          number and delivery address, together with the contents and value of
          your order. When you send an enquiry we collect the details you type
          into the form. We also keep basic technical logs such as the pages
          requested and the time of the request.
        </p>
        <p>
          We do not collect or store card numbers, CVVs or bank credentials.
          Payment details are entered on Paystack&rsquo;s own secure pages and
          never reach our servers.
        </p>
      </Clause>

      <Clause heading="Why we use it">
        <p>
          To take payment, fulfil and deliver your order, respond to enquiries
          and quotation requests, keep accurate accounting and tax records, and
          protect against fraudulent transactions. We do not sell your data,
          and we do not use it for advertising profiling.
        </p>
      </Clause>

      <Clause heading="Who we share it with">
        <p>
          Paystack, to process your payment. Delivery partners and our own
          drivers, limited to the name, address and phone number needed to make
          the delivery. Professional advisers and regulators where the law
          requires it. Nobody else.
        </p>
      </Clause>

      <Clause heading="How long we keep it">
        <p>
          Order and transaction records are retained for the period required by
          Nigerian tax and company law. Enquiries that do not become orders are
          kept for up to 24 months, then deleted.
        </p>
      </Clause>

      <Clause heading="Your rights">
        <p>
          You may ask us for a copy of the personal data we hold about you, ask
          us to correct it if it is wrong, or ask us to delete it where we are
          not legally required to keep it. Write to {site.email} and we will
          respond within 30 days.
        </p>
      </Clause>

      <Clause heading="Cookies">
        <p>
          This site uses a small number of strictly necessary storage items:
          your shopping cart, held in your own browser, and a session cookie for
          staff signing in to the management area. We do not run third-party
          advertising or analytics cookies.
        </p>
      </Clause>

      <Clause heading="Contact">
        <p>
          Data queries: {site.email}. Postal address: {site.address.line1},{" "}
          {site.address.line2}, {site.address.city}, {site.address.state},{" "}
          {site.address.country}.
        </p>
      </Clause>
    </LegalPage>
  );
}
