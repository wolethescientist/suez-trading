/**
 * The catalogue, in the repository.
 *
 * The storefront used to read every product out of Postgres. It no longer
 * does: the shop is a single own-brand line, and a database (plus the env vars
 * and the running instance behind it) was infrastructure the site did not earn.
 * Everything a visitor sees now ships with the code and needs no connection
 * string to render — see `lib/catalogue.ts`, where the Prisma implementation is
 * preserved, commented, ready to switch back on.
 *
 * Adding a product: copy the block below, drop its photograph into
 * `public/products/`, and point `images[].url` at it. Money is integer kobo —
 * ₦10,000 is 1_000_000 — exactly as the database stored it, so nothing
 * downstream (formatters, cart, order maths) has to change.
 */

const KOBO = (naira: number) => Math.round(naira * 100);

/** A fixed timestamp: static rows have no "created" moment, and a live clock
 *  would make every render non-deterministic. */
const CATALOGUE_DATE = new Date("2024-01-01T00:00:00.000Z");

export type StaticCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type StaticProductImage = {
  id: string;
  productId: string;
  url: string;
  alt: string | null;
  sortOrder: number;
  storageId: string | null;
};

export type StaticProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string | null;
  description: string | null;
  brand: string | null;
  categoryId: string;
  price: number; // kobo
  compareAtPrice: number | null;
  costPrice: number | null;
  unit: string;
  minOrderQty: number;
  stock: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  allowBackorder: boolean;
  warehouse: string | null;
  featured: boolean;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  requiresQuote: boolean;
  weightKg: number | null;
  createdAt: Date;
  updatedAt: Date;
  images: StaticProductImage[];
};

export const CATEGORIES: StaticCategory[] = [
  {
    id: "cat-safety-and-industrial",
    name: "Safety & Industrial",
    slug: "safety-and-industrial",
    description:
      "Certified safety equipment for homes, kitchens and sites — including the SRG smart gas regulator with leak detection and pressure monitoring.",
    image: "/categories/safety-and-industrial.svg",
    sortOrder: 1,
    active: true,
    createdAt: CATALOGUE_DATE,
    updatedAt: CATALOGUE_DATE,
  },
];

export const PRODUCTS: StaticProduct[] = [
  {
    id: "prod-suez-srg-smart-gas-regulator",
    name: "SUEZ SRG Smart Gas Regulator",
    slug: "suez-srg-smart-gas-regulator",
    sku: "SUEZ-SRG-REG",
    shortDescription:
      "Proprietary SRG gas regulator with built-in leak detection and pressure monitoring.",
    description:
      "Through our partnership with SRG, we supply proprietary gas regulators equipped with leak detection and pressure monitoring features. The regulator shuts off automatically on a detected leak or pressure fault, making cylinder gas materially safer for households, kitchens and site canteens. Fits standard LPG cylinders and is supplied with fitting instructions.",
    brand: "SRG",
    categoryId: "cat-safety-and-industrial",
    price: KOBO(10_000),
    compareAtPrice: null,
    costPrice: null,
    unit: "each",
    minOrderQty: 1,
    stock: 250,
    lowStockThreshold: 40,
    trackInventory: true,
    allowBackorder: false,
    warehouse: "Abuja Safety Store",
    featured: true,
    status: "ACTIVE",
    requiresQuote: false,
    weightKg: null,
    createdAt: CATALOGUE_DATE,
    updatedAt: CATALOGUE_DATE,
    images: [
      {
        id: "img-suez-srg-1",
        productId: "prod-suez-srg-smart-gas-regulator",
        // Photographed in-house; the file ships in the repo, so the product
        // page renders with no CDN, no upload service and no database.
        url: "/products/SRG-547-1_c.jpg",
        alt: "The SUEZ SRG smart gas regulator, with its pressure gauge and leak check",
        sortOrder: 0,
        storageId: null,
      },
    ],
  },
];

/** Products joined to their category, the shape every storefront view expects. */
export function withCategory(product: StaticProduct) {
  const category = CATEGORIES.find((c) => c.id === product.categoryId);
  if (!category) throw new Error(`Product ${product.slug} has no category.`);
  return { ...product, category };
}
