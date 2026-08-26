import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/site/logo";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/admin");
  const { error } = await searchParams;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-5 py-16">

      <div className="relative w-full max-w-sm">
        <Logo tone="light" />

        <div className="mt-8 rounded-sm border border-white/10 bg-white p-8">
          <h1 className="font-display text-xl font-extrabold text-ink">
            Staff sign in
          </h1>
          <p className="mt-1.5 text-[0.875rem] text-fg-bone-muted">
            Manage stock, orders and the storefront.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-sm border border-alert/25 bg-alert-soft p-3 text-[0.8125rem] text-alert"
            >
              {error === "inactive"
                ? "Your account has been deactivated. Contact the store owner."
                : "Your session has ended. Please sign in again."}
            </div>
          )}

          <div className="mt-6">
            <LoginForm />
          </div>
        </div>

        <p className="mt-6 text-center text-[0.75rem] text-fg-bone-muted">
          Authorised staff only. All activity is logged.
        </p>
      </div>
    </div>
  );
}
