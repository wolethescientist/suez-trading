import "dotenv/config";
import crypto from "node:crypto";
import { readFile } from "node:fs/promises";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { DEFAULT_SETTINGS } from "../lib/store-config";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const N = (naira: number) => Math.round(naira * 100);

function cloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;
  return {
    cloudName,
    apiKey,
    apiSecret,
    folder: process.env.CLOUDINARY_FOLDER || "suez-trading",
  };
}

/**
 * `source` is either a remote URL, which Cloudinary fetches for itself, or a
 * repo-relative path, whose bytes we post directly. Product photography we own
 * lives in the repo; only the placeholder artwork still comes from a stock host.
 */
async function uploadToCloudinary(
  source: string,
  subFolder: string,
  publicId: string
): Promise<{ url: string; storageId: string | null }> {
  const local = !/^https?:\/\//.test(source);
  const config = cloudinaryConfig();
  if (!config) {
    // Without credentials a remote URL at least still renders; a local path
    // would resolve to nothing, so fall back to the public/ URL for it.
    return { url: local ? `/${source.replace(/^public\//, "")}` : source, storageId: null };
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const folder = `${config.folder}/${subFolder}`;
    const params: Record<string, string> = {
      folder,
      overwrite: "true",
      public_id: publicId,
      timestamp,
      transformation: "c_limit,w_1600,h_1600,q_auto,f_auto",
    };

    const toSign = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join("&");
    const signature = crypto.createHash("sha1").update(toSign + config.apiSecret).digest("hex");

    const form = new FormData();
    if (local) {
      const bytes = await readFile(source);
      form.append("file", new Blob([new Uint8Array(bytes)]), source.split("/").pop());
    } else {
      form.append("file", source);
    }
    form.append("api_key", config.apiKey);
    form.append("timestamp", timestamp);
    form.append("folder", folder);
    form.append("public_id", publicId);
    form.append("overwrite", "true");
    form.append("transformation", "c_limit,w_1600,h_1600,q_auto,f_auto");
    form.append("signature", signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
      { method: "POST", body: form }
    );

    const body = (await response.json().catch(() => null)) as
      | { secure_url?: string; public_id?: string; error?: { message?: string } }
      | null;

    if (!response.ok || !body?.secure_url || !body.public_id) {
      console.warn(
        `[Cloudinary] Upload fallback for ${publicId}: ${body?.error?.message ?? response.status}`
      );
      return { url: source, storageId: null };
    }

    return { url: body.secure_url, storageId: body.public_id };
  } catch (err) {
    console.warn(`[Cloudinary] Exception for ${publicId}:`, err);
    return { url: source, storageId: null };
  }
}

// ---------------------------------------------------------------- categories

const categories = [
  {
    slug: "safety-and-industrial",
    name: "Safety & Industrial",
    sortOrder: 1,
    imageUrl: "https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=1200&auto=format&fit=crop&q=80",
    description:
      "Certified safety equipment for homes, kitchens and sites — including the SRG smart gas regulator with leak detection and pressure monitoring.",
  },
];

// ---------------------------------------------------------------- products

type Seed = {
  slug: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  unit: string;
  stock: number;
  lowStockThreshold?: number;
  minOrderQty?: number;
  brand?: string;
  featured?: boolean;
  requiresQuote?: boolean;
  warehouse?: string;
  weightKg?: number;
  imageUrl: string;
  shortDescription: string;
  description: string;
};

const products: Seed[] = [
  {
    slug: "suez-srg-smart-gas-regulator",
    name: "SUEZ SRG Smart Gas Regulator",
    sku: "SUEZ-SRG-REG",
    category: "safety-and-industrial",
    price: N(10000),
    unit: "each",
    stock: 250,
    lowStockThreshold: 40,
    brand: "SRG",
    featured: true,
    warehouse: "Abuja Safety Store",
    // Photographed in-house; the file lives in the repo rather than on a
    // stock-photo host, so the uploader reads it off disk.
    imageUrl: "public/products/SRG-547-1_c.jpg",
    shortDescription:
      "Proprietary SRG gas regulator with built-in leak detection and pressure monitoring.",
    description:
      "Through our partnership with SRG, we supply proprietary gas regulators equipped with leak detection and pressure monitoring features. The regulator shuts off automatically on a detected leak or pressure fault, making cylinder gas materially safer for households, kitchens and site canteens. Fits standard LPG cylinders and is supplied with fitting instructions.",
  },
];

async function main() {
  console.log("Seeding Suez Trading database with rich product catalogue & Cloudinary assets…\n");

  // ---- staff ----------------------------------------------------------------
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@sueztrading.com").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "SuezAdmin2026!";
  const owner = await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Casmir Onuchukwu",
      role: "OWNER",
      passwordHash: await bcrypt.hash(password, 12),
    },
  });

  await prisma.adminUser.upsert({
    where: { email: "manager@sueztrading.com" },
    update: {},
    create: {
      email: "manager@sueztrading.com",
      name: "Ebuka Onuchukwu",
      role: "MANAGER",
      passwordHash: await bcrypt.hash("SuezManager2026!", 12),
    },
  });

  // ---- settings -------------------------------------------------------------
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await prisma.setting.upsert({
      where: { key },
      update: {},
      create: { key, value: String(value) },
    });
  }

  // ---- categories -----------------------------------------------------------
  console.log("Processing Categories & Cloudinary artwork…");
  const categoryIds = new Map<string, string>();

  for (const c of categories) {
    const { imageUrl, ...catData } = c;
    const uploaded = await uploadToCloudinary(
      imageUrl,
      "categories",
      `cat-${c.slug}`
    );

    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {
        name: catData.name,
        description: catData.description,
        sortOrder: catData.sortOrder,
        image: uploaded.url,
      },
      create: {
        ...catData,
        image: uploaded.url,
      },
    });
    categoryIds.set(c.slug, row.id);
    console.log(`  ✓ Category [${c.name}] -> ${uploaded.url}`);
  }

  // ---- products & images ----------------------------------------------------
  console.log("\nProcessing Products & Cloudinary imagery…");

  for (const p of products) {
    const categoryId = categoryIds.get(p.category);
    if (!categoryId) throw new Error(`Unknown category ${p.category}`);

    const {
      category: _category,
      imageUrl,
      ...productData
    } = p;

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: { ...productData, categoryId },
      create: { ...productData, categoryId },
    });

    // Main image
    const mainUpload = await uploadToCloudinary(
      imageUrl,
      "products",
      `prod-${p.slug}-0`
    );

    const existingImage = await prisma.productImage.findFirst({
      where: { productId: product.id, sortOrder: 0 },
    });

    if (existingImage) {
      await prisma.productImage.update({
        where: { id: existingImage.id },
        data: {
          url: mainUpload.url,
          storageId: mainUpload.storageId,
          alt: p.name,
        },
      });
    } else {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: mainUpload.url,
          storageId: mainUpload.storageId,
          alt: p.name,
          sortOrder: 0,
        },
      });
    }

    // Opening inventory stock movement
    const hasMovement = await prisma.stockMovement.findFirst({
      where: { productId: product.id },
    });
    if (!hasMovement) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          delta: p.stock,
          balance: p.stock,
          reason: "RESTOCK",
          note: "Opening stock balance",
          actorId: owner.id,
        },
      });
    }

    console.log(`  ✓ Product [${p.sku}] ${p.name}`);
  }

  // ---- coupons --------------------------------------------------------------
  console.log("\nCreating Promotional Coupons…");
  const coupons = [
    { code: "SUEZ10", type: "PERCENT" as const, value: 10, minSubtotal: N(50000), maxUses: 200 },
    { code: "WELCOME5", type: "PERCENT" as const, value: 5, minSubtotal: N(20000), maxUses: 500 },
    { code: "BULK15", type: "PERCENT" as const, value: 15, minSubtotal: N(500000), maxUses: 50 },
  ];

  for (const cp of coupons) {
    await prisma.coupon.upsert({
      where: { code: cp.code },
      update: cp,
      create: { ...cp, active: true },
    });
  }

  // ---- demo orders ----------------------------------------------------------
  // Demo orders were tied to a broad catalogue that no longer exists. The
  // sample enquiries stand on their own, so only those are seeded — and only
  // into an empty table, so real enquiries are never joined by fake ones.
  console.log("\nChecking Sample Enquiries…");
  if ((await prisma.enquiry.count()) === 0) {
    await prisma.enquiry.createMany({
      data: [
        {
          name: "Ibrahim Sani",
          email: "ibrahim.sani@example.com",
          phone: "+2348023334444",
          company: "Northgate Construction Ltd",
          service: "Petroleum Products & Supply",
          subject: "Monthly AGO supply contract",
          message:
            "We run three sites in Kaduna and need roughly 12,000 litres of AGO monthly. Please advise on contract pricing and delivery scheduling.",
          status: "NEW",
        },
        {
          name: "Grace Eze",
          email: "grace.eze@example.com",
          phone: "+2348101112222",
          company: "Riverbend Estates",
          service: "FMCG Distribution & Trade",
          subject: "Household lines for estate handover packs",
          message:
            "Requesting a quotation for detergent, tissue and bar soap in carton quantities for a 24-unit estate in Lugbe.",
          status: "IN_PROGRESS",
        },
      ],
    });
  }

  const counts = {
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    images: await prisma.productImage.count(),
    orders: await prisma.order.count(),
    staff: await prisma.adminUser.count(),
  };

  console.log("\n=================================================");
  console.log("✅ Seed & Cloudinary upload successfully completed!");
  console.log("=================================================");
  console.log(counts);
  console.log(`\nAdmin sign-in:  ${email}  /  ${password}\n`);
}

main()
  .catch((e) => {
    console.error("Seed execution failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
