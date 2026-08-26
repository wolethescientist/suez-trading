"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";
import {
  createProduct,
  updateProduct,
  type ActionState,
} from "@/app/admin/actions/products";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/admin/page-header";
import { Field, inputClass } from "@/components/ui/field";
import { ImagePicker } from "@/components/admin/image-picker";
import { UNITS } from "@/lib/constants";
import { koboToNaira } from "@/lib/money";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string };

export type ProductFormValues = {
  id?: string;
  name?: string;
  slug?: string;
  sku?: string;
  categoryId?: string;
  brand?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  price?: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  unit?: string;
  minOrderQty?: number;
  stock?: number;
  lowStockThreshold?: number;
  trackInventory?: boolean;
  allowBackorder?: boolean;
  featured?: boolean;
  requiresQuote?: boolean;
  status?: string;
  weightKg?: number | null;
  warehouse?: string | null;
  imageUrl?: string;
  imageStorageId?: string | null;
};

const initial: ActionState = { status: "idle" };

export function ProductForm({
  categories,
  product,
  mode,
}: {
  categories: Category[];
  product?: ProductFormValues;
  mode: "create" | "edit";
}) {
  const [state, action] = useActionState<ActionState, FormData>(
    mode === "create" ? createProduct : updateProduct,
    initial,
  );

  const naira = (kobo: number | null | undefined) =>
    kobo === null || kobo === undefined ? "" : String(koboToNaira(kobo));

  return (
    <form action={action} className="space-y-6">
      {product?.id && <input type="hidden" name="id" value={product.id} />}

      {state.status !== "idle" && state.message && (
        <div
          role="alert"
          className={cn(
            "flex gap-2.5 rounded-sm border p-4 text-[0.875rem]",
            state.status === "error"
              ? "border-alert/25 bg-alert-soft text-alert"
              : "border-signal/25 bg-signal-soft text-signal",
          )}
        >
          {state.status === "error" ? (
            <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" />
          )}
          <span>{state.message}</span>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card title="Basics">
            <div className="space-y-5 p-5">
              <Field label="Product name" htmlFor="name" required>
                <input
                  id="name"
                  name="name"
                  required
                  defaultValue={product?.name}
                  placeholder="Automotive Gas Oil (AGO / Diesel)"
                  className={inputClass}
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="SKU"
                  htmlFor="sku"
                  required
                  hint="Your internal stock code. Must be unique."
                >
                  <input
                    id="sku"
                    name="sku"
                    required
                    defaultValue={product?.sku}
                    placeholder="SUEZ-PET-AGO"
                    className={cn(inputClass, "font-mono")}
                  />
                </Field>
                <Field
                  label="URL slug"
                  htmlFor="slug"
                  hint="Leave blank to generate from the name."
                >
                  <input
                    id="slug"
                    name="slug"
                    defaultValue={product?.slug}
                    placeholder="ago-diesel"
                    className={cn(inputClass, "font-mono")}
                  />
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Category" htmlFor="categoryId" required>
                  <select
                    id="categoryId"
                    name="categoryId"
                    required
                    defaultValue={product?.categoryId ?? ""}
                    className={inputClass}
                  >
                    <option value="" disabled>
                      Choose a category
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Brand" htmlFor="brand">
                  <input
                    id="brand"
                    name="brand"
                    defaultValue={product?.brand ?? ""}
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field
                label="Short description"
                htmlFor="shortDescription"
                hint="One line shown on cards and listings."
              >
                <textarea
                  id="shortDescription"
                  name="shortDescription"
                  rows={2}
                  defaultValue={product?.shortDescription ?? ""}
                  className={cn(inputClass, "h-auto py-2.5")}
                />
              </Field>

              <Field
                label="Full description"
                htmlFor="description"
                hint="Shown on the product page. Specifications, packaging, lead times."
              >
                <textarea
                  id="description"
                  name="description"
                  rows={7}
                  defaultValue={product?.description ?? ""}
                  className={cn(inputClass, "h-auto py-2.5")}
                />
              </Field>
            </div>
          </Card>

          <Card title="Pricing" description="Enter amounts in Naira — stored internally in kobo.">
            <div className="grid gap-5 p-5 sm:grid-cols-3">
              <Field label="Selling price (₦)" htmlFor="price" required>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  defaultValue={naira(product?.price)}
                  className={cn(inputClass, "tnum")}
                />
              </Field>
              <Field
                label="Compare-at price (₦)"
                htmlFor="compareAtPrice"
                hint="Shows a saving on the storefront."
              >
                <input
                  id="compareAtPrice"
                  name="compareAtPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={naira(product?.compareAtPrice)}
                  className={cn(inputClass, "tnum")}
                />
              </Field>
              <Field
                label="Cost price (₦)"
                htmlFor="costPrice"
                hint="Internal only. Never shown publicly."
              >
                <input
                  id="costPrice"
                  name="costPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={naira(product?.costPrice)}
                  className={cn(inputClass, "tnum")}
                />
              </Field>
            </div>
          </Card>

          <Card title="Inventory">
            <div className="grid gap-5 p-5 sm:grid-cols-2">
              <Field
                label="Stock on hand"
                htmlFor="stock"
                hint="Changing this writes a stock movement to the ledger."
              >
                <input
                  id="stock"
                  name="stock"
                  type="number"
                  step="1"
                  defaultValue={product?.stock ?? 0}
                  className={cn(inputClass, "tnum")}
                />
              </Field>
              <Field
                label="Low stock threshold"
                htmlFor="lowStockThreshold"
                hint="Alerts appear at or below this level."
              >
                <input
                  id="lowStockThreshold"
                  name="lowStockThreshold"
                  type="number"
                  step="1"
                  min="0"
                  defaultValue={product?.lowStockThreshold ?? 10}
                  className={cn(inputClass, "tnum")}
                />
              </Field>
              <Field label="Unit of sale" htmlFor="unit">
                <select
                  id="unit"
                  name="unit"
                  defaultValue={product?.unit ?? "each"}
                  className={inputClass}
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Minimum order quantity" htmlFor="minOrderQty">
                <input
                  id="minOrderQty"
                  name="minOrderQty"
                  type="number"
                  step="1"
                  min="1"
                  defaultValue={product?.minOrderQty ?? 1}
                  className={cn(inputClass, "tnum")}
                />
              </Field>
              <Field label="Weight (kg)" htmlFor="weightKg">
                <input
                  id="weightKg"
                  name="weightKg"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={product?.weightKg ?? ""}
                  className={cn(inputClass, "tnum")}
                />
              </Field>
              <Field label="Warehouse / location" htmlFor="warehouse">
                <input
                  id="warehouse"
                  name="warehouse"
                  defaultValue={product?.warehouse ?? ""}
                  placeholder="Wuse II depot"
                  className={inputClass}
                />
              </Field>

              <div className="space-y-3 sm:col-span-2">
                <Toggle
                  name="trackInventory"
                  label="Track inventory for this product"
                  hint="Turn off for services or made-to-order lines with no stock count."
                  defaultChecked={product?.trackInventory ?? true}
                />
                <Toggle
                  name="allowBackorder"
                  label="Allow orders when out of stock"
                  hint="Customers can order beyond the level on hand."
                  defaultChecked={product?.allowBackorder ?? false}
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Visibility">
            <div className="space-y-5 p-5">
              <Field label="Status" htmlFor="status">
                <select
                  id="status"
                  name="status"
                  defaultValue={product?.status ?? "ACTIVE"}
                  className={inputClass}
                >
                  <option value="ACTIVE">Active — visible and sellable</option>
                  <option value="DRAFT">Draft — hidden from the shop</option>
                  <option value="ARCHIVED">Archived — retired</option>
                </select>
              </Field>

              <Toggle
                name="featured"
                label="Feature on the homepage"
                defaultChecked={product?.featured ?? false}
              />
              <Toggle
                name="requiresQuote"
                label="Quote only — not sold online"
                hint="Shown in the catalogue but cannot be added to a cart."
                defaultChecked={product?.requiresQuote ?? false}
              />
            </div>
          </Card>

          <Card title="Image">
            <div className="p-5">
              <ImagePicker
                name="imageUrl"
                defaultValue={product?.imageUrl}
                defaultStorageId={product?.imageStorageId}
              />
            </div>
          </Card>

          <div className="sticky top-6 space-y-3 rounded-sm border border-bone-line bg-white p-5">
            <SubmitButton mode={mode} />
            {product?.slug && (
              <Link
                href={`/shop/${product.slug}`}
                target="_blank"
                className="block text-center text-[0.8125rem] font-semibold text-fg-bone-muted hover:text-ink"
              >
                View on storefront →
              </Link>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Saving…
        </>
      ) : (
        <>
          <Save className="h-4 w-4" /> {mode === "create" ? "Create product" : "Save changes"}
        </>
      )}
    </Button>
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
