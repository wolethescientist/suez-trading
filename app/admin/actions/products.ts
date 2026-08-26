"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import type { ProductStatus } from "@/lib/generated/prisma/client";
import { requireAdmin, requirePermission } from "@/lib/auth";
import { adjustStock } from "@/lib/inventory";
import { nairaToKobo } from "@/lib/money";
import { slugify } from "@/lib/utils";
import { removeImage } from "@/lib/storage";
import { STOCK_REASONS } from "@/lib/constants";

export type ActionState = { status: "idle" | "success" | "error"; message?: string };

const money = (v: FormDataEntryValue | null) =>
  v === null || v === "" ? null : nairaToKobo(String(v));

const productSchema = z.object({
  name: z.string().trim().min(2, "Product name is required.").max(160),
  slug: z.string().trim().max(80).optional().or(z.literal("")),
  sku: z.string().trim().min(2, "A SKU is required.").max(48),
  categoryId: z.string().min(1, "Choose a category."),
  brand: z.string().trim().max(80).optional().or(z.literal("")),
  shortDescription: z.string().trim().max(400).optional().or(z.literal("")),
  description: z.string().trim().max(8000).optional().or(z.literal("")),
  price: z.number().int().nonnegative("Price cannot be negative."),
  compareAtPrice: z.number().int().nonnegative().nullable(),
  costPrice: z.number().int().nonnegative().nullable(),
  unit: z.string().trim().min(1).max(40),
  minOrderQty: z.number().int().positive().max(100000),
  stock: z.number().int(),
  lowStockThreshold: z.number().int().nonnegative(),
  trackInventory: z.boolean(),
  allowBackorder: z.boolean(),
  featured: z.boolean(),
  requiresQuote: z.boolean(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  weightKg: z.number().nonnegative().nullable(),
  warehouse: z.string().trim().max(80).optional().or(z.literal("")),
  imageUrl: z.string().trim().max(600).optional().or(z.literal("")),
  imageUrlStorageId: z.string().trim().max(300).optional().or(z.literal("")),
});

function parseProductForm(formData: FormData) {
  const num = (key: string) => {
    const raw = formData.get(key);
    if (raw === null || raw === "") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  };

  return productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    sku: formData.get("sku"),
    categoryId: formData.get("categoryId"),
    brand: formData.get("brand"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    price: money(formData.get("price")) ?? 0,
    compareAtPrice: money(formData.get("compareAtPrice")),
    costPrice: money(formData.get("costPrice")),
    unit: formData.get("unit"),
    minOrderQty: num("minOrderQty") ?? 1,
    stock: num("stock") ?? 0,
    lowStockThreshold: num("lowStockThreshold") ?? 10,
    trackInventory: formData.get("trackInventory") === "on",
    allowBackorder: formData.get("allowBackorder") === "on",
    featured: formData.get("featured") === "on",
    requiresQuote: formData.get("requiresQuote") === "on",
    status: formData.get("status"),
    weightKg: num("weightKg"),
    warehouse: formData.get("warehouse"),
    imageUrl: formData.get("imageUrl"),
    imageUrlStorageId: formData.get("imageUrlStorageId"),
  });
}

export async function createProduct(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requirePermission("manageProducts");
  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the form." };
  }
  const data = parsed.data;
  const slug = slugify(data.slug || data.name);

  const clash = await prisma.product.findFirst({
    where: { OR: [{ slug }, { sku: data.sku }] },
    select: { slug: true, sku: true },
  });
  if (clash) {
    return {
      status: "error",
      message:
        clash.sku === data.sku
          ? `SKU ${data.sku} is already used by another product.`
          : `The URL slug "${slug}" is already taken.`,
    };
  }

  let productId: string;
  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        sku: data.sku,
        categoryId: data.categoryId,
        brand: data.brand || null,
        shortDescription: data.shortDescription || null,
        description: data.description || null,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        costPrice: data.costPrice,
        unit: data.unit,
        minOrderQty: data.minOrderQty,
        stock: Math.max(0, data.stock),
        lowStockThreshold: data.lowStockThreshold,
        trackInventory: data.trackInventory,
        allowBackorder: data.allowBackorder,
        featured: data.featured,
        requiresQuote: data.requiresQuote,
        status: data.status,
        weightKg: data.weightKg,
        warehouse: data.warehouse || null,
        ...(data.imageUrl
          ? {
              images: {
                create: {
                  url: data.imageUrl,
                  alt: data.name,
                  sortOrder: 0,
                  storageId: data.imageUrlStorageId || null,
                },
              },
            }
          : {}),
      },
    });
    productId = product.id;

    if (data.stock > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          delta: data.stock,
          balance: data.stock,
          reason: "RESTOCK",
          note: "Opening stock on product creation",
          actorId: user.id,
        },
      });
    }
  } catch {
    return { status: "error", message: "Could not save the product. Check the SKU and slug are unique." };
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect(`/admin/products/${productId}?created=1`);
}

export async function updateProduct(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requirePermission("manageProducts");
  const id = String(formData.get("id") ?? "");
  if (!id) return { status: "error", message: "Missing product id." };

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the form." };
  }
  const data = parsed.data;
  const slug = slugify(data.slug || data.name);

  const existing = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  if (!existing) return { status: "error", message: "Product not found." };

  const clash = await prisma.product.findFirst({
    where: { id: { not: id }, OR: [{ slug }, { sku: data.sku }] },
    select: { slug: true, sku: true },
  });
  if (clash) {
    return {
      status: "error",
      message:
        clash.sku === data.sku
          ? `SKU ${data.sku} is already used by another product.`
          : `The URL slug "${slug}" is already taken.`,
    };
  }

  try {
    await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        sku: data.sku,
        categoryId: data.categoryId,
        brand: data.brand || null,
        shortDescription: data.shortDescription || null,
        description: data.description || null,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        costPrice: data.costPrice,
        unit: data.unit,
        minOrderQty: data.minOrderQty,
        lowStockThreshold: data.lowStockThreshold,
        trackInventory: data.trackInventory,
        allowBackorder: data.allowBackorder,
        featured: data.featured,
        requiresQuote: data.requiresQuote,
        status: data.status,
        weightKg: data.weightKg,
        warehouse: data.warehouse || null,
      },
    });

    // Stock is never set blind here — it goes through the ledger so the change
    // is attributable and reversible.
    if (data.stock !== existing.stock) {
      await adjustStock({
        productId: id,
        delta: 0,
        setTo: data.stock,
        reason: "ADJUSTMENT",
        note: "Adjusted from the product editor",
        actorId: user.id,
      });
    }

    const previous = existing.images[0];
    if (data.imageUrl && data.imageUrl !== previous?.url) {
      if (previous) {
        await prisma.productImage.update({
          where: { id: previous.id },
          data: {
            url: data.imageUrl,
            alt: data.name,
            storageId: data.imageUrlStorageId || null,
          },
        });
        // Best effort — a storage failure must not block the catalogue edit.
        await removeImage(previous.storageId);
      } else {
        await prisma.productImage.create({
          data: {
            productId: id,
            url: data.imageUrl,
            alt: data.name,
            sortOrder: 0,
            storageId: data.imageUrlStorageId || null,
          },
        });
      }
    } else if (!data.imageUrl && previous) {
      await prisma.productImage.delete({ where: { id: previous.id } });
      await removeImage(previous.storageId);
    }
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Could not save the product.",
    };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/shop");
  revalidatePath(`/shop/${slug}`);
  return { status: "success", message: "Product saved." };
}

export async function deleteProduct(formData: FormData) {
  await requirePermission("deleteProducts");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const soldCount = await prisma.orderItem.count({ where: { productId: id } });

  if (soldCount > 0) {
    // Archiving preserves order history; a hard delete would orphan receipts.
    await prisma.product.update({ where: { id }, data: { status: "ARCHIVED", featured: false } });
  } else {
    const images = await prisma.productImage.findMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });
    await Promise.all(images.map((image) => removeImage(image.storageId)));
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/products?deleted=1");
}

export async function duplicateProduct(formData: FormData) {
  await requirePermission("manageProducts");
  const id = String(formData.get("id") ?? "");
  const source = await prisma.product.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!source) return;

  const suffix = Date.now().toString(36).slice(-4).toUpperCase();
  const copy = await prisma.product.create({
    data: {
      name: `${source.name} (copy)`,
      slug: slugify(`${source.name}-copy-${suffix}`),
      sku: `${source.sku}-${suffix}`,
      categoryId: source.categoryId,
      brand: source.brand,
      shortDescription: source.shortDescription,
      description: source.description,
      price: source.price,
      compareAtPrice: source.compareAtPrice,
      costPrice: source.costPrice,
      unit: source.unit,
      minOrderQty: source.minOrderQty,
      stock: 0,
      lowStockThreshold: source.lowStockThreshold,
      trackInventory: source.trackInventory,
      allowBackorder: source.allowBackorder,
      status: "DRAFT",
      weightKg: source.weightKg,
      warehouse: source.warehouse,
      images: {
        create: source.images.map((img) => ({
          url: img.url,
          alt: img.alt,
          sortOrder: img.sortOrder,
        })),
      },
    },
  });

  revalidatePath("/admin/products");
  redirect(`/admin/products/${copy.id}`);
}

const stockSchema = z.object({
  productId: z.string().min(1),
  mode: z.enum(["delta", "set"]),
  amount: z.number().int(),
  reason: z.enum(STOCK_REASONS),
  note: z.string().trim().max(300).optional().or(z.literal("")),
});

export async function adjustStockAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requirePermission("manageProducts");

  const parsed = stockSchema.safeParse({
    productId: formData.get("productId"),
    mode: formData.get("mode"),
    amount: Number(formData.get("amount")),
    reason: formData.get("reason"),
    note: formData.get("note"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Enter a whole number and choose a reason." };
  }
  const { productId, mode, amount, reason, note } = parsed.data;

  try {
    const balance = await adjustStock({
      productId,
      delta: mode === "delta" ? amount : 0,
      setTo: mode === "set" ? amount : undefined,
      reason,
      note: note || undefined,
      actorId: user.id,
    });
    revalidatePath("/admin/inventory");
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/shop");
    return { status: "success", message: `Stock updated. New level: ${balance}.` };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Could not adjust stock.",
    };
  }
}

export async function toggleFeatured(formData: FormData) {
  await requirePermission("manageProducts");
  const id = String(formData.get("id") ?? "");
  const product = await prisma.product.findUnique({ where: { id }, select: { featured: true } });
  if (!product) return;
  await prisma.product.update({ where: { id }, data: { featured: !product.featured } });
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function setProductStatus(formData: FormData) {
  await requirePermission("manageProducts");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["DRAFT", "ACTIVE", "ARCHIVED"].includes(status)) return;
  await prisma.product.update({
    where: { id },
    data: { status: status as ProductStatus },
  });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

/** Used by the "who am I" check in client components that need the role. */
export async function currentUser() {
  return requireAdmin();
}
