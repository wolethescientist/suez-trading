import { Database } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

/**
 * The storefront runs with no database; the back office cannot. Rather than
 * crash on a missing connection string, the admin routes say what is needed
 * and how to switch it on.
 */
export function AdminNeedsDatabase() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-5 py-16">
      <div className="w-full max-w-md rounded-sm border border-white/10 bg-white p-8">
        <div className="grid h-11 w-11 place-items-center rounded-sm bg-ink">
          <Database className="h-5 w-5 text-cargo" />
        </div>
        <h1 className="mt-6 font-display text-xl font-extrabold text-ink">
          The back office needs a database
        </h1>
        <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-fg-bone-muted">
          The storefront runs off the catalogue in the repository, so no database is
          connected. To use the admin: set <code className="font-mono">DATABASE_URL</code>{" "}
          and <code className="font-mono">AUTH_SECRET</code>, flip{" "}
          <code className="font-mono">DATABASE_ENABLED</code> in{" "}
          <code className="font-mono">lib/commerce.ts</code>, restore the Prisma block in{" "}
          <code className="font-mono">lib/catalogue.ts</code>, then run the migrations and
          the seed.
        </p>
        <ButtonLink href="/" variant="subtle" size="md" className="mt-6">
          Back to the site
        </ButtonLink>
      </div>
    </div>
  );
}
