import { ProductImage } from "@/components/shop/product-image";
import Link from "next/link";
import { EyeOff, Tag, Trash2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Card, EmptyState, PageHeader } from "@/components/admin/page-header";
import { ActionForm } from "@/components/admin/entity-form";
import { Field, inputClass } from "@/components/ui/field";
import { deleteCategory, saveCategory } from "@/app/admin/actions/store";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  await requireAdmin();
  const { edit } = await searchParams;

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  const editing = edit ? categories.find((c) => c.id === edit) : undefined;

  return (
    <>
      <PageHeader
        title="Categories"
        description="How the shop is organised. Order here controls the order shoppers see."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <Card title="All categories" className="xl:col-span-2">
          {categories.length === 0 ? (
            <EmptyState
              icon={Tag}
              title="No categories yet"
              description="Add your first category to start organising the catalogue."
            />
          ) : (
            <ul className="divide-y divide-bone-line">
              {categories.map((category) => (
                <li key={category.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="relative h-11 w-11 flex-none overflow-hidden rounded-sm border border-bone-line bg-ink">
                    {category.image && (
                      <ProductImage
                        src={category.image}
                        alt=""
                        width={44}
                        className="object-cover opacity-70"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-[0.9375rem] font-bold text-ink">
                        {category.name}
                      </p>
                      {!category.active && <Badge tone="neutral">Hidden</Badge>}
                    </div>
                    <p className="mt-0.5 truncate text-[0.75rem] text-fg-bone-muted">
                      <span className="font-mono">/{category.slug}</span> ·{" "}
                      {category._count.products} product
                      {category._count.products === 1 ? "" : "s"} · position{" "}
                      {category.sortOrder}
                    </p>
                  </div>

                  <div className="flex flex-none items-center gap-1.5">
                    <Link
                      href={`/admin/categories?edit=${category.id}`}
                      className="rounded-sm border border-bone-line px-2.5 py-1.5 font-display text-[0.75rem] font-semibold text-ink transition-colors hover:bg-bone"
                    >
                      Edit
                    </Link>
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={category.id} />
                      <button
                        type="submit"
                        aria-label={
                          category._count.products > 0
                            ? `Hide ${category.name}`
                            : `Delete ${category.name}`
                        }
                        title={
                          category._count.products > 0
                            ? "This category holds products, so it will be hidden instead of deleted."
                            : "Delete category"
                        }
                        className="grid h-8 w-8 place-items-center rounded-sm border border-bone-line text-fg-bone-muted transition-colors hover:border-alert/30 hover:bg-alert-soft hover:text-alert"
                      >
                        {category._count.products > 0 ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title={editing ? `Edit ${editing.name}` : "Add a category"}
          actions={
            editing && (
              <Link
                href="/admin/categories"
                className="text-[0.8125rem] font-semibold text-fg-bone-muted hover:text-ink"
              >
                Cancel
              </Link>
            )
          }
        >
          <div className="p-5">
            {/* key forces a fresh form (and fresh defaults) when switching rows */}
            <ActionForm
              key={editing?.id ?? "new"}
              action={saveCategory}
              submitLabel={editing ? "Save category" : "Create category"}
            >
              {editing && <input type="hidden" name="id" value={editing.id} />}

              <Field label="Name" htmlFor="name" required>
                <input
                  id="name"
                  name="name"
                  required
                  defaultValue={editing?.name}
                  className={inputClass}
                />
              </Field>

              <Field label="URL slug" htmlFor="slug" hint="Leave blank to generate from the name.">
                <input
                  id="slug"
                  name="slug"
                  defaultValue={editing?.slug}
                  className={cn(inputClass, "font-mono")}
                />
              </Field>

              <Field label="Description" htmlFor="description">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={editing?.description ?? ""}
                  className={cn(inputClass, "h-auto py-2.5")}
                />
              </Field>

              <Field label="Image path" htmlFor="image" hint="Shown on the homepage tile.">
                <input
                  id="image"
                  name="image"
                  defaultValue={editing?.image ?? ""}
                  placeholder="/categories/example.svg"
                  className={inputClass}
                />
              </Field>

              <Field label="Sort position" htmlFor="sortOrder" hint="Lower numbers come first.">
                <input
                  id="sortOrder"
                  name="sortOrder"
                  type="number"
                  min="0"
                  defaultValue={editing?.sortOrder ?? categories.length + 1}
                  className={cn(inputClass, "tnum")}
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
                  Visible in the shop
                </span>
              </label>
            </ActionForm>
          </div>
        </Card>
      </div>
    </>
  );
}
