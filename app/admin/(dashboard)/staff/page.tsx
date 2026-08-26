import Link from "next/link";
import { UserMinus, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, EmptyState, PageHeader } from "@/components/admin/page-header";
import { ActionForm } from "@/components/admin/entity-form";
import { Field, inputClass } from "@/components/ui/field";
import { deleteStaff, saveStaff } from "@/app/admin/actions/store";

export const dynamic = "force-dynamic";

const roleNotes: Record<string, string> = {
  OWNER: "Full access, including staff accounts and store settings.",
  MANAGER: "Everything except staff accounts. Can delete products and refund.",
  STAFF: "Day-to-day: products, stock, orders and enquiries.",
};

export default async function StaffPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const actor = await requirePermission("manageStaff");
  const { edit } = await searchParams;

  const staff = await prisma.adminUser.findMany({
    orderBy: [{ active: "desc" }, { createdAt: "asc" }],
  });
  const editing = edit ? staff.find((s) => s.id === edit) : undefined;

  return (
    <>
      <PageHeader
        title="Staff accounts"
        description="Who can sign in to this management area, and what they are allowed to do."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <Card title="Team" className="xl:col-span-2">
          {staff.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No staff accounts"
              description="Add your first team member to give them access."
            />
          ) : (
            <ul className="divide-y divide-bone-line">
              {staff.map((member) => (
                <li key={member.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="grid h-10 w-10 flex-none place-items-center rounded-full bg-ink font-display text-[0.8125rem] font-extrabold text-cargo">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-[0.9375rem] font-bold text-ink">
                        {member.name}
                      </p>
                      <Badge tone={member.role === "OWNER" ? "amber" : "neutral"}>
                        {member.role}
                      </Badge>
                      {!member.active && <Badge tone="danger">Deactivated</Badge>}
                      {member.id === actor.id && <Badge tone="dark">You</Badge>}
                    </div>
                    <p className="mt-0.5 truncate text-[0.75rem] text-fg-bone-muted">
                      {member.email} ·{" "}
                      {member.lastLoginAt
                        ? `last signed in ${formatDate(member.lastLoginAt, true)}`
                        : "never signed in"}
                    </p>
                  </div>

                  <div className="flex flex-none items-center gap-1.5">
                    <Link
                      href={`/admin/staff?edit=${member.id}`}
                      className="rounded-sm border border-bone-line px-2.5 py-1.5 font-display text-[0.75rem] font-semibold text-ink transition-colors hover:bg-bone"
                    >
                      Edit
                    </Link>
                    {member.id !== actor.id && member.active && (
                      <form action={deleteStaff}>
                        <input type="hidden" name="id" value={member.id} />
                        <button
                          type="submit"
                          aria-label={`Deactivate ${member.name}`}
                          title="Deactivate this account"
                          className="grid h-8 w-8 place-items-center rounded-sm border border-bone-line text-fg-bone-muted transition-colors hover:border-alert/30 hover:bg-alert-soft hover:text-alert"
                        >
                          <UserMinus className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title={editing ? `Edit ${editing.name}` : "Add a staff member"}
          actions={
            editing && (
              <Link
                href="/admin/staff"
                className="text-[0.8125rem] font-semibold text-fg-bone-muted hover:text-ink"
              >
                Cancel
              </Link>
            )
          }
        >
          <div className="p-5">
            <ActionForm
              key={editing?.id ?? "new"}
              action={saveStaff}
              submitLabel={editing ? "Save account" : "Create account"}
            >
              {editing && <input type="hidden" name="id" value={editing.id} />}

              <Field label="Full name" htmlFor="name" required>
                <input
                  id="name"
                  name="name"
                  required
                  defaultValue={editing?.name}
                  className={inputClass}
                />
              </Field>

              <Field label="Email address" htmlFor="email" required>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  defaultValue={editing?.email}
                  className={inputClass}
                />
              </Field>

              <Field label="Role" htmlFor="role">
                <select
                  id="role"
                  name="role"
                  defaultValue={editing?.role ?? "STAFF"}
                  className={inputClass}
                >
                  <option value="STAFF">Staff</option>
                  <option value="MANAGER">Manager</option>
                  <option value="OWNER">Owner</option>
                </select>
              </Field>

              <div className="rounded-sm bg-bone p-3 text-[0.75rem] leading-relaxed text-fg-bone-muted">
                <p>
                  <strong className="text-ink-2">Staff</strong> — {roleNotes.STAFF}
                </p>
                <p className="mt-1.5">
                  <strong className="text-ink-2">Manager</strong> — {roleNotes.MANAGER}
                </p>
                <p className="mt-1.5">
                  <strong className="text-ink-2">Owner</strong> — {roleNotes.OWNER}
                </p>
              </div>

              <Field
                label={editing ? "New password" : "Password"}
                htmlFor="password"
                required={!editing}
                hint={
                  editing
                    ? "Leave blank to keep the current password."
                    : "At least 10 characters. Share it securely."
                }
              >
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={editing ? undefined : 10}
                  required={!editing}
                  className={inputClass}
                />
              </Field>

              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked={editing?.active ?? true}
                  className="h-4 w-4 rounded-[2px] border-fg-bone-muted accent-ink"
                />
                <span className="font-display text-[0.8125rem] font-semibold text-ink-2">
                  Account can sign in
                </span>
              </label>
            </ActionForm>
          </div>
        </Card>
      </div>
    </>
  );
}
