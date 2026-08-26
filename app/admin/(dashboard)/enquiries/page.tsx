import Link from "next/link";
import { Mail } from "lucide-react";
import { prisma } from "@/lib/db";
import type { EnquiryStatus } from "@/lib/generated/prisma/client";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, EmptyState, PageHeader } from "@/components/admin/page-header";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { updateEnquiry } from "@/app/admin/actions/store";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const tabs = [
  { value: "NEW", label: "New" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "CLOSED", label: "Closed" },
  { value: "ALL", label: "All" },
];

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; open?: string }>;
}) {
  await requireAdmin();
  const { status = "NEW", open } = await searchParams;

  const [enquiries, counts] = await Promise.all([
    prisma.enquiry.findMany({
      where: status === "ALL" ? {} : { status: status as EnquiryStatus },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.enquiry.groupBy({ by: ["status"], _count: true }),
  ]);

  const countBy = Object.fromEntries(counts.map((c) => [c.status, c._count]));
  const opened = open ? enquiries.find((e) => e.id === open) : undefined;

  return (
    <>
      <PageHeader
        title="Enquiries"
        description="Quotation requests and messages from the contact form."
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/enquiries?status=${tab.value}`}
            className={cn(
              "rounded-sm border px-3 py-1.5 font-display text-[0.75rem] font-semibold transition-colors",
              status === tab.value
                ? "border-ink bg-ink text-white"
                : "border-bone-line bg-white text-ink-3 hover:bg-bone",
            )}
          >
            {tab.label}
            {tab.value !== "ALL" && countBy[tab.value] ? ` (${countBy[tab.value]})` : ""}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card title={`${enquiries.length} enquir${enquiries.length === 1 ? "y" : "ies"}`} className="xl:col-span-2">
          {enquiries.length === 0 ? (
            <EmptyState
              icon={Mail}
              title="Nothing here"
              description="Messages sent through the contact form land in this queue."
            />
          ) : (
            <ul className="divide-y divide-bone-line">
              {enquiries.map((enquiry) => (
                <li key={enquiry.id}>
                  <Link
                    href={`/admin/enquiries?status=${status}&open=${enquiry.id}`}
                    className={cn(
                      "block px-5 py-4 transition-colors hover:bg-bone",
                      opened?.id === enquiry.id && "bg-bone",
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-display text-[0.9375rem] font-bold text-ink">
                        {enquiry.subject || enquiry.service || "General enquiry"}
                      </p>
                      <Badge
                        tone={
                          enquiry.status === "NEW"
                            ? "warning"
                            : enquiry.status === "IN_PROGRESS"
                              ? "dark"
                              : "success"
                        }
                      >
                        {enquiry.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="mt-1 text-[0.8125rem] text-fg-bone-muted">
                      {enquiry.name}
                      {enquiry.company && ` · ${enquiry.company}`} · {enquiry.email}
                    </p>
                    <p className="mt-2 line-clamp-2 text-[0.8125rem] leading-relaxed text-ink-3">
                      {enquiry.message}
                    </p>
                    <p className="mt-2 text-[0.6875rem] text-fg-bone-muted">
                      {formatDate(enquiry.createdAt, true)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div>
          {opened ? (
            <Card
              title={opened.subject || "Enquiry"}
              actions={
                <Link
                  href={`/admin/enquiries?status=${status}`}
                  className="text-[0.8125rem] font-semibold text-fg-bone-muted hover:text-ink"
                >
                  Close
                </Link>
              }
            >
              <div className="space-y-5 p-5">
                <dl className="space-y-2.5 text-[0.8125rem]">
                  <Row label="From" value={opened.name} />
                  {opened.company && <Row label="Company" value={opened.company} />}
                  <div className="flex justify-between gap-3">
                    <dt className="text-fg-bone-muted">Email</dt>
                    <dd>
                      <a
                        href={`mailto:${opened.email}?subject=Re: ${encodeURIComponent(opened.subject ?? "Your enquiry")}`}
                        className="font-semibold text-ink hover:text-cargo"
                      >
                        {opened.email}
                      </a>
                    </dd>
                  </div>
                  {opened.phone && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-fg-bone-muted">Phone</dt>
                      <dd>
                        <a
                          href={`tel:${opened.phone}`}
                          className="font-semibold text-ink hover:text-cargo"
                        >
                          {opened.phone}
                        </a>
                      </dd>
                    </div>
                  )}
                  {opened.service && <Row label="Division" value={opened.service} />}
                  <Row label="Received" value={formatDate(opened.createdAt, true)} />
                </dl>

                <div className="rounded-sm bg-bone p-4">
                  <p className="whitespace-pre-wrap text-[0.875rem] leading-relaxed text-ink-3">
                    {opened.message}
                  </p>
                </div>

                {opened.handledNote && (
                  <div className="rounded-sm border border-bone-line p-4">
                    <p className="text-[0.6875rem] uppercase tracking-wider text-fg-bone-muted">
                      Internal note
                    </p>
                    <p className="mt-1 text-[0.875rem] leading-relaxed text-ink-3">
                      {opened.handledNote}
                    </p>
                  </div>
                )}

                <form action={updateEnquiry} className="space-y-4 border-t border-bone-line pt-5">
                  <input type="hidden" name="id" value={opened.id} />
                  <Field label="Status" htmlFor="status">
                    <select
                      id="status"
                      name="status"
                      defaultValue={opened.status}
                      className={inputClass}
                    >
                      <option value="NEW">New</option>
                      <option value="IN_PROGRESS">In progress</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </Field>
                  <Field label="Internal note" htmlFor="handledNote">
                    <textarea
                      id="handledNote"
                      name="handledNote"
                      rows={3}
                      defaultValue={opened.handledNote ?? ""}
                      placeholder="Quoted ₦2.4m on 26 Aug, awaiting their PO…"
                      className={cn(inputClass, "h-auto py-2.5")}
                    />
                  </Field>
                  <Button type="submit" variant="dark" className="w-full">
                    Save
                  </Button>
                </form>

                <a
                  href={`mailto:${opened.email}?subject=Re: ${encodeURIComponent(opened.subject ?? "Your enquiry")}`}
                  className="block text-center text-[0.8125rem] font-semibold text-ink hover:text-cargo"
                >
                  Reply by email →
                </a>
              </div>
            </Card>
          ) : (
            <Card>
              <EmptyState
                icon={Mail}
                title="Select an enquiry"
                description="Open one from the list to read it in full and update its status."
              />
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-fg-bone-muted">{label}</dt>
      <dd className="text-right font-semibold text-ink">{value}</dd>
    </div>
  );
}
