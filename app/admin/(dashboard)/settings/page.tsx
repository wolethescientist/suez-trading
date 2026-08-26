import { CheckCircle2, CreditCard, XCircle } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { paystackConfigured } from "@/lib/paystack";
import { storageStatus } from "@/lib/storage";
import { koboToNaira } from "@/lib/money";
import { Card, PageHeader } from "@/components/admin/page-header";
import { ActionForm } from "@/components/admin/entity-form";
import { Field, inputClass } from "@/components/ui/field";
import { saveStoreSettings } from "@/app/admin/actions/store";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requirePermission("manageSettings");
  const settings = await getSettings();
  const paystackReady = paystackConfigured();
  const storage = storageStatus();

  return (
    <>
      <PageHeader
        title="Store settings"
        description="Delivery charges, the storefront announcement, and whether online ordering is open."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card title="Storefront">
            <div className="p-5">
              <ActionForm action={saveStoreSettings} submitLabel="Save settings">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Delivery flat rate (₦)"
                    htmlFor="shippingFlatRate"
                    hint="Charged on every delivery order below the free threshold."
                  >
                    <input
                      id="shippingFlatRate"
                      name="shippingFlatRate"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={koboToNaira(settings.shippingFlatRate)}
                      className={cn(inputClass, "tnum")}
                    />
                  </Field>
                  <Field
                    label="Free delivery above (₦)"
                    htmlFor="freeShippingThreshold"
                    hint="Set to 0 to never give free delivery."
                  >
                    <input
                      id="freeShippingThreshold"
                      name="freeShippingThreshold"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={koboToNaira(settings.freeShippingThreshold)}
                      className={cn(inputClass, "tnum")}
                    />
                  </Field>
                </div>

                <Field
                  label="Pickup address"
                  htmlFor="pickupAddress"
                  hint="Shown at checkout when a customer chooses depot collection."
                >
                  <input
                    id="pickupAddress"
                    name="pickupAddress"
                    defaultValue={settings.pickupAddress}
                    className={inputClass}
                  />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Contact email" htmlFor="contactEmail">
                    <input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      defaultValue={settings.contactEmail}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Contact phone" htmlFor="contactPhone">
                    <input
                      id="contactPhone"
                      name="contactPhone"
                      defaultValue={settings.contactPhone}
                      className={inputClass}
                    />
                  </Field>
                </div>

                <Field
                  label="Announcement bar"
                  htmlFor="announcement"
                  hint="The strip above the header on every storefront page."
                >
                  <input
                    id="announcement"
                    name="announcement"
                    defaultValue={settings.announcement}
                    className={inputClass}
                  />
                </Field>

                <div className="space-y-3 border-t border-bone-line pt-5">
                  <Toggle
                    name="announcementActive"
                    label="Show the announcement bar"
                    defaultChecked={settings.announcementActive}
                  />
                  <Toggle
                    name="lowStockAlerts"
                    label="Flag low stock in the dashboard"
                    defaultChecked={settings.lowStockAlerts}
                  />
                  <Toggle
                    name="ordersOpen"
                    label="Online ordering is open"
                    hint="Turning this off hides add-to-cart and blocks checkout, without unpublishing the catalogue."
                    defaultChecked={settings.ordersOpen}
                  />
                </div>
              </ActionForm>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Payments">
            <div className="space-y-4 p-5">
              <div
                className={cn(
                  "flex items-start gap-3 rounded-sm border p-4",
                  paystackReady
                    ? "border-signal/25 bg-signal-soft"
                    : "border-cargo/30 bg-cargo/10",
                )}
              >
                {paystackReady ? (
                  <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 flex-none text-signal" />
                ) : (
                  <XCircle className="mt-0.5 h-4.5 w-4.5 flex-none text-cargo" />
                )}
                <div>
                  <p
                    className={cn(
                      "font-display text-[0.875rem] font-bold",
                      paystackReady ? "text-signal" : "text-cargo-ink",
                    )}
                  >
                    {paystackReady ? "Paystack is connected" : "Paystack is not configured"}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-[0.8125rem] leading-relaxed",
                      paystackReady ? "text-signal" : "text-cargo-ink",
                    )}
                  >
                    {paystackReady
                      ? "Checkout is live. Keys are read from the server environment and never shown here."
                      : "Add PAYSTACK_SECRET_KEY to the environment and restart the app to accept payments."}
                  </p>
                </div>
              </div>

              <div className="rounded-sm border border-bone-line p-4 text-[0.8125rem] leading-relaxed text-fg-bone-muted">
                <p className="flex items-center gap-2 font-display font-bold text-ink">
                  <CreditCard className="h-4 w-4 text-cargo" />
                  Webhook URL
                </p>
                <p className="mt-2">
                  Set this in the Paystack dashboard under Settings → API Keys &amp;
                  Webhooks so payments confirm even if the customer closes the tab:
                </p>
                <code className="mt-2 block break-all rounded-[2px] bg-bone px-2 py-1.5 font-mono text-[0.75rem] text-ink">
                  {process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-domain"}/api/paystack/webhook
                </code>
              </div>
            </div>
          </Card>

          <Card title="Image storage">
            <div className="p-5">
              <div
                className={cn(
                  "flex items-start gap-3 rounded-sm border p-4",
                  storage.ok
                    ? "border-signal/30 bg-signal-soft"
                    : "border-alert/30 bg-alert-soft",
                )}
              >
                {storage.ok ? (
                  <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 flex-none text-signal" />
                ) : (
                  <XCircle className="mt-0.5 h-4.5 w-4.5 flex-none text-alert" />
                )}
                <div>
                  <p
                    className={cn(
                      "font-label text-[0.625rem] tracking-[0.11em]",
                      storage.ok ? "text-signal" : "text-alert",
                    )}
                  >
                    {storage.provider === "cloudinary" ? "Cloudinary" : "Local disk"}
                  </p>
                  <p
                    className={cn(
                      "mt-1.5 text-[0.8125rem] leading-relaxed",
                      storage.ok ? "text-signal" : "text-alert",
                    )}
                  >
                    {storage.message}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Company record" description="Edit in lib/site.ts.">
            <dl className="space-y-3 p-5 text-[0.8125rem]">
              <Row label="Registered name" value={site.legalName} />
              <Row label="Incorporated" value={site.incorporated} />
              <Row
                label="Registered office"
                value={`${site.address.line1}, ${site.address.line2}, ${site.address.city}`}
              />
              <Row label="Currency" value="Nigerian Naira (NGN)" />
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}

function Toggle({
  name,
  label,
  hint,
  defaultChecked,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 flex-none rounded-[2px] border-fg-bone-muted accent-ink"
      />
      <span>
        <span className="block font-display text-[0.8125rem] font-semibold text-ink-2">
          {label}
        </span>
        {hint && <span className="mt-0.5 block text-[0.75rem] text-fg-bone-muted">{hint}</span>}
      </span>
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="flex-none text-fg-bone-muted">{label}</dt>
      <dd className="text-right font-semibold text-ink">{value}</dd>
    </div>
  );
}
