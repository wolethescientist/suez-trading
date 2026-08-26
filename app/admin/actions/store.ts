"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import type { EnquiryStatus } from "@/lib/generated/prisma/client";
import { requirePermission } from "@/lib/auth";
import { saveSettings } from "@/lib/settings";
import { hashPassword } from "@/lib/auth";
import { nairaToKobo } from "@/lib/money";
import { slugify } from "@/lib/utils";

export type StoreActionState = { status: "idle" | "success" | "error"; message?: string };

/* ----------------------------------------------------------------- categories */

export async function saveCategory(
  _prev: StoreActionState,
  formData: FormData,
): Promise<StoreActionState> {
  await requirePermission("manageProducts");

  const parsed = z
    .object({
      id: z.string().optional().or(z.literal("")),
      name: z.string().trim().min(2, "Give the category a name.").max(80),
      slug: z.string().trim().max(80).optional().or(z.literal("")),
      description: z.string().trim().max(600).optional().or(z.literal("")),
      image: z.string().trim().max(400).optional().or(z.literal("")),
      sortOrder: z.coerce.number().int().min(0).max(999),
      active: z.boolean(),
    })
    .safeParse({
      id: formData.get("id"),
      name: formData.get("name"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      image: formData.get("image"),
      sortOrder: formData.get("sortOrder") ?? 0,
      active: formData.get("active") === "on",
    });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  const { id, name, description, image, sortOrder, active } = parsed.data;
  const slug = slugify(parsed.data.slug || name);

  try {
    if (id) {
      await prisma.category.update({
        where: { id },
        data: { name, slug, description: description || null, image: image || null, sortOrder, active },
      });
    } else {
      await prisma.category.create({
        data: { name, slug, description: description || null, image: image || null, sortOrder, active },
      });
    }
  } catch {
    return { status: "error", message: `A category with the slug "${slug}" already exists.` };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  revalidatePath("/");
  return { status: "success", message: id ? "Category updated." : "Category created." };
}

export async function deleteCategory(formData: FormData) {
  await requirePermission("deleteProducts");
  const id = String(formData.get("id") ?? "");
  const count = await prisma.product.count({ where: { categoryId: id } });

  if (count > 0) {
    // Categories holding products are hidden rather than removed, so no
    // product is ever left pointing at a missing parent.
    await prisma.category.update({ where: { id }, data: { active: false } });
  } else {
    await prisma.category.delete({ where: { id } });
  }

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
}

/* ------------------------------------------------------------------- settings */

export async function saveStoreSettings(
  _prev: StoreActionState,
  formData: FormData,
): Promise<StoreActionState> {
  await requirePermission("manageSettings");

  const num = (key: string) => Number(formData.get(key) ?? 0);

  try {
    await saveSettings({
      shippingFlatRate: nairaToKobo(num("shippingFlatRate")),
      freeShippingThreshold: nairaToKobo(num("freeShippingThreshold")),
      pickupAddress: String(formData.get("pickupAddress") ?? ""),
      announcement: String(formData.get("announcement") ?? ""),
      announcementActive: formData.get("announcementActive") === "on",
      contactEmail: String(formData.get("contactEmail") ?? ""),
      contactPhone: String(formData.get("contactPhone") ?? ""),
      lowStockAlerts: formData.get("lowStockAlerts") === "on",
      ordersOpen: formData.get("ordersOpen") === "on",
    });
  } catch {
    return { status: "error", message: "Could not save settings." };
  }

  revalidatePath("/", "layout");
  return { status: "success", message: "Store settings saved." };
}

/* --------------------------------------------------------------------- staff */

export async function saveStaff(
  _prev: StoreActionState,
  formData: FormData,
): Promise<StoreActionState> {
  const actor = await requirePermission("manageStaff");

  const parsed = z
    .object({
      id: z.string().optional().or(z.literal("")),
      name: z.string().trim().min(2, "Enter the person's name.").max(120),
      email: z.string().trim().toLowerCase().email("Enter a valid email address."),
      role: z.enum(["OWNER", "MANAGER", "STAFF"]),
      password: z.string().optional().or(z.literal("")),
      active: z.boolean(),
    })
    .safeParse({
      id: formData.get("id"),
      name: formData.get("name"),
      email: formData.get("email"),
      role: formData.get("role"),
      password: formData.get("password"),
      active: formData.get("active") === "on",
    });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the form." };
  }
  const { id, name, email, role, password, active } = parsed.data;

  if (!id && (!password || password.length < 10)) {
    return { status: "error", message: "Set a password of at least 10 characters." };
  }
  if (password && password.length > 0 && password.length < 10) {
    return { status: "error", message: "Passwords must be at least 10 characters." };
  }
  if (id === actor.id && !active) {
    return { status: "error", message: "You cannot deactivate your own account." };
  }

  try {
    if (id) {
      await prisma.adminUser.update({
        where: { id },
        data: {
          name,
          email,
          role,
          active,
          ...(password ? { passwordHash: await hashPassword(password) } : {}),
        },
      });
    } else {
      await prisma.adminUser.create({
        data: { name, email, role, active, passwordHash: await hashPassword(password!) },
      });
    }
  } catch {
    return { status: "error", message: "That email address is already in use." };
  }

  revalidatePath("/admin/staff");
  return { status: "success", message: id ? "Staff member updated." : "Staff member added." };
}

export async function deleteStaff(formData: FormData) {
  const actor = await requirePermission("manageStaff");
  const id = String(formData.get("id") ?? "");
  if (id === actor.id) return;

  // Deactivate rather than delete so their stock movements and order events
  // keep their attribution.
  await prisma.adminUser.update({ where: { id }, data: { active: false } });
  revalidatePath("/admin/staff");
}

/* ------------------------------------------------------------------- coupons */

export async function saveCoupon(
  _prev: StoreActionState,
  formData: FormData,
): Promise<StoreActionState> {
  await requirePermission("manageCoupons");

  const parsed = z
    .object({
      code: z
        .string()
        .trim()
        .toUpperCase()
        .min(3, "Codes need at least 3 characters.")
        .max(24)
        .regex(/^[A-Z0-9-]+$/, "Use letters, numbers and hyphens only."),
      type: z.enum(["PERCENT", "FIXED"]),
      value: z.coerce.number().positive("Enter a value above zero."),
      minSubtotal: z.coerce.number().min(0),
      maxUses: z.string().optional().or(z.literal("")),
      expiresAt: z.string().optional().or(z.literal("")),
      active: z.boolean(),
    })
    .safeParse({
      code: formData.get("code"),
      type: formData.get("type"),
      value: formData.get("value"),
      minSubtotal: formData.get("minSubtotal") ?? 0,
      maxUses: formData.get("maxUses"),
      expiresAt: formData.get("expiresAt"),
      active: formData.get("active") === "on",
    });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the form." };
  }
  const { code, type, value, minSubtotal, maxUses, expiresAt, active } = parsed.data;

  if (type === "PERCENT" && value > 100) {
    return { status: "error", message: "A percentage discount cannot exceed 100." };
  }

  const data = {
    type,
    value: type === "PERCENT" ? Math.round(value) : nairaToKobo(value),
    minSubtotal: nairaToKobo(minSubtotal),
    maxUses: maxUses ? Number(maxUses) : null,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    active,
  };

  await prisma.coupon.upsert({ where: { code }, create: { code, ...data }, update: data });

  revalidatePath("/admin/coupons");
  return { status: "success", message: `Discount code ${code} saved.` };
}

export async function deleteCoupon(formData: FormData) {
  await requirePermission("manageCoupons");
  const code = String(formData.get("code") ?? "");
  await prisma.coupon.delete({ where: { code } }).catch(() => undefined);
  revalidatePath("/admin/coupons");
}

/* ----------------------------------------------------------------- enquiries */

export async function updateEnquiry(formData: FormData) {
  await requirePermission("manageOrders");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const handledNote = String(formData.get("handledNote") ?? "").trim();

  if (!["NEW", "IN_PROGRESS", "CLOSED"].includes(status)) return;

  await prisma.enquiry.update({
    where: { id },
    data: { status: status as EnquiryStatus, ...(handledNote ? { handledNote } : {}) },
  });

  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
  redirect("/admin/enquiries");
}
