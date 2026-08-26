import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PackageSearch } from "lucide-react";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/field";

export const metadata: Metadata = {
  title: "Track an order",
  description: "Look up a Suez Trading order using your reference number and email address.",
};
export const dynamic = "force-dynamic";

async function findOrder(formData: FormData) {
  "use server";

  const reference = String(formData.get("reference") ?? "").trim().toUpperCase();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!reference || !email) redirect("/track?error=missing");

  // Both fields must match, so a reference alone does not expose someone's
  // address and phone number.
  const order = await prisma.order.findFirst({
    where: { reference, customerEmail: email },
    select: { reference: true },
  });

  if (!order) redirect("/track?error=notfound");
  redirect(`/order/${order.reference}`);
}

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <section className="container-page py-16 lg:py-24">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 grid h-12 w-12 place-items-center rounded-sm bg-ink">
          <PackageSearch className="h-5 w-5 text-cargo" />
        </div>
        <p className="eyebrow text-cargo">Order lookup</p>
        <h1 className="mt-4 text-3xl font-extrabold text-ink sm:text-[2.5rem]">
          Track an order
        </h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-fg-bone-muted">
          Enter the reference from your confirmation email along with the email
          address you ordered with.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-sm border border-alert/25 bg-alert-soft p-3.5 text-[0.8125rem] text-alert"
          >
            {error === "notfound"
              ? "We could not find an order matching that reference and email."
              : "Please fill in both fields."}
          </div>
        )}

        <form action={findOrder} className="mt-8 space-y-5">
          <Field label="Order reference" htmlFor="reference" required hint="For example SUEZ-2608-K4T7M">
            <input
              id="reference"
              name="reference"
              required
              placeholder="SUEZ-0000-XXXXX"
              className={`${inputClass} font-mono uppercase`}
            />
          </Field>
          <Field label="Email address" htmlFor="email" required>
            <input id="email" name="email" type="email" required className={inputClass} />
          </Field>
          <Button type="submit" size="lg" className="w-full">
            Find my order
          </Button>
        </form>
      </div>
    </section>
  );
}
