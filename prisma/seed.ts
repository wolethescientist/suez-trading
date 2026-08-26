import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import type { OrderStatus, PaymentStatus } from "../lib/generated/prisma/client";
import { DEFAULT_SETTINGS } from "../lib/store-config";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const N = (naira: number) => Math.round(naira * 100);

const categories = [
  {
    slug: "petroleum-products",
    name: "Petroleum Products",
    sortOrder: 1,
    description:
      "Refined petroleum products supplied in bulk or part-load, delivered by our own tanker fleet.",
  },
  {
    slug: "lubricants-and-oils",
    name: "Lubricants & Oils",
    sortOrder: 2,
    description:
      "Engine, hydraulic and gear oils plus greases for automotive, marine and industrial plant.",
  },
  {
    slug: "building-materials",
    name: "Building Materials",
    sortOrder: 3,
    description:
      "Cement, reinforcement, roofing, finishes and plumbing supplied to site anywhere in Nigeria.",
  },
  {
    slug: "beverages-and-consumables",
    name: "Beverages & Consumables",
    sortOrder: 4,
    description: "Wholesale beverage distribution for retailers, events, camps and corporate accounts.",
  },
  {
    slug: "appliances-and-power",
    name: "Appliances & Power",
    sortOrder: 5,
    description: "Generating sets, pumps and household appliances, supplied with warranty and installation support.",
  },
  {
    slug: "safety-and-industrial",
    name: "Safety & Industrial",
    sortOrder: 6,
    description: "Personal protective equipment, fire safety and site consumables for compliant operations.",
  },
];

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
  shortDescription: string;
  description: string;
};

const products: Seed[] = [
  {
    slug: "ago-diesel", name: "Automotive Gas Oil (AGO / Diesel)", sku: "SUEZ-PET-AGO",
    category: "petroleum-products", price: N(1150), costPrice: N(1010), unit: "per litre",
    stock: 48000, lowStockThreshold: 10000, minOrderQty: 100, brand: "Suez Trading", featured: true,
    shortDescription: "Low-sulphur automotive gas oil for generators, plant and haulage fleets.",
    description:
      "Clean, filtered AGO supplied direct from depot. Every load is metered and accompanied by a delivery certificate showing volume and density. Minimum order 100 litres; bulk loads from 5,000 litres attract contract pricing — request a quote for scheduled replenishment.",
  },
  {
    slug: "pms-petrol", name: "Premium Motor Spirit (PMS / Petrol)", sku: "SUEZ-PET-PMS",
    category: "petroleum-products", price: N(950), costPrice: N(880), unit: "per litre",
    stock: 32000, lowStockThreshold: 8000, minOrderQty: 100, brand: "Suez Trading", featured: true,
    shortDescription: "Retail and bulk petrol supply for stations, fleets and standby plant.",
    description:
      "PMS lifted from licensed depots and delivered by our tanker fleet. Suitable for filling station replenishment, fleet fuelling and standby generators. Minimum order 100 litres.",
  },
  {
    slug: "dpk-kerosene", name: "Dual Purpose Kerosene (DPK)", sku: "SUEZ-PET-DPK",
    category: "petroleum-products", price: N(1300), costPrice: N(1190), unit: "per litre",
    stock: 14500, lowStockThreshold: 4000, minOrderQty: 50,
    shortDescription: "Household and industrial kerosene, filtered and depot-certified.",
    description:
      "DPK for domestic heating, lighting and industrial burner applications. Delivered in drums or by tanker depending on volume. Minimum order 50 litres.",
  },
  {
    slug: "lpg-cylinder-12-5kg", name: "LPG Cooking Gas — 12.5kg Refill", sku: "SUEZ-PET-LPG125",
    category: "petroleum-products", price: N(16500), costPrice: N(14200), unit: "per cylinder",
    stock: 240, lowStockThreshold: 40, featured: true,
    shortDescription: "12.5kg cooking gas refill with cylinder inspection included.",
    description:
      "Full 12.5kg LPG refill, weighed at decanting and delivered to your door within Abuja. Cylinders are visually inspected for valve integrity and corrosion before filling; unsafe cylinders are replaced at cost rather than refilled.",
  },
  {
    slug: "lpg-cylinder-50kg", name: "LPG Cooking Gas — 50kg Refill", sku: "SUEZ-PET-LPG50",
    category: "petroleum-products", price: N(62000), costPrice: N(55000), unit: "per cylinder",
    stock: 46, lowStockThreshold: 10,
    shortDescription: "50kg bulk LPG refill for restaurants, bakeries and hostels.",
    description:
      "Commercial-scale LPG refill for kitchens and small industry. Includes hose and regulator inspection. Scheduled refill contracts available for multi-cylinder sites.",
  },

  {
    slug: "engine-oil-sae-40", name: "Engine Oil SAE 40 — 25 Litre", sku: "SUEZ-LUB-SAE40",
    category: "lubricants-and-oils", price: N(48000), compareAtPrice: N(52000), costPrice: N(41000),
    unit: "per drum", stock: 130, lowStockThreshold: 20, featured: true, brand: "Suez Trading",
    shortDescription: "Monograde diesel engine oil for trucks, generators and heavy plant.",
    description:
      "High-detergent SAE 40 mineral engine oil formulated for naturally aspirated and turbocharged diesel engines running in hot climates. Supplied in sealed 25 litre drums with batch numbers.",
  },
  {
    slug: "hydraulic-oil-iso-68", name: "Hydraulic Oil ISO 68 — 20 Litre", sku: "SUEZ-LUB-ISO68",
    category: "lubricants-and-oils", price: N(52000), costPrice: N(45500), unit: "per drum",
    stock: 84, lowStockThreshold: 15,
    shortDescription: "Anti-wear hydraulic fluid for excavators, loaders and press systems.",
    description:
      "ISO VG 68 anti-wear hydraulic oil with strong oxidation stability and water separation. Suits mobile plant hydraulics and industrial power packs operating at high ambient temperature.",
  },
  {
    slug: "gear-oil-ep-90", name: "Gear Oil EP 90 — 20 Litre", sku: "SUEZ-LUB-EP90",
    category: "lubricants-and-oils", price: N(46000), costPrice: N(40000), unit: "per drum",
    stock: 62, lowStockThreshold: 15,
    shortDescription: "Extreme-pressure gear oil for differentials and manual transmissions.",
    description:
      "API GL-4/GL-5 extreme pressure gear lubricant for heavily loaded hypoid and spiral bevel gears. Standard fill for truck and bus differentials.",
  },
  {
    slug: "multipurpose-grease", name: "Multipurpose Lithium Grease — 5kg", sku: "SUEZ-LUB-GRS5",
    category: "lubricants-and-oils", price: N(18500), costPrice: N(15200), unit: "per pack",
    stock: 96, lowStockThreshold: 20,
    shortDescription: "Lithium complex grease for bearings, chassis points and site plant.",
    description:
      "NLGI 2 lithium complex grease with good water resistance and mechanical stability. Suitable for wheel bearings, chassis lubrication and general plant greasing.",
  },

  {
    slug: "dangote-cement", name: "Dangote Cement — 50kg Bag", sku: "SUEZ-BLD-CEMD",
    category: "building-materials", price: N(9800), compareAtPrice: N(10500), costPrice: N(9100),
    unit: "per bag", stock: 1850, lowStockThreshold: 300, featured: true, brand: "Dangote",
    shortDescription: "42.5R grade Portland cement, direct from depot in full pallets or singles.",
    description:
      "Dangote 3X 42.5R Portland cement in 50kg bags. Stored on pallets under cover and rotated so you receive recent production, not hardened stock. Truckload pricing available on request.",
  },
  {
    slug: "bua-cement", name: "BUA Cement — 50kg Bag", sku: "SUEZ-BLD-CEMB",
    category: "building-materials", price: N(9400), costPrice: N(8700), unit: "per bag",
    stock: 920, lowStockThreshold: 300, brand: "BUA",
    shortDescription: "BUA 42.5N Portland cement for blockwork, screeds and general concrete.",
    description:
      "BUA 42.5N cement in 50kg bags — a well-priced general purpose cement for blockwork, plastering and non-structural concrete. Full trailer loads delivered to site.",
  },
  {
    slug: "iron-rods-12mm", name: "Reinforcement Iron Rod — 12mm", sku: "SUEZ-BLD-ROD12",
    category: "building-materials", price: N(12500), costPrice: N(11300), unit: "per length",
    stock: 640, lowStockThreshold: 120,
    shortDescription: "12mm high-yield deformed reinforcement bar, 12 metre length.",
    description:
      "High-yield ribbed reinforcement bar to BS 4449 grade 460, supplied in standard 12 metre lengths. Mill certificates available on request for structural works.",
  },
  {
    slug: "iron-rods-16mm", name: "Reinforcement Iron Rod — 16mm", sku: "SUEZ-BLD-ROD16",
    category: "building-materials", price: N(21000), costPrice: N(19200), unit: "per length",
    stock: 310, lowStockThreshold: 80,
    shortDescription: "16mm high-yield deformed reinforcement bar, 12 metre length.",
    description:
      "16mm ribbed high-yield bar for columns, beams and raft foundations. Supplied in 12 metre lengths, cut and bent to schedule on request.",
  },
  {
    slug: "aluminium-roofing-sheet", name: "Aluminium Roofing Sheet — 0.55mm", sku: "SUEZ-BLD-ALU055",
    category: "building-materials", price: N(8900), costPrice: N(7900), unit: "per length",
    stock: 420, lowStockThreshold: 80, featured: true,
    shortDescription: "0.55mm long-span aluminium roofing, rolled to your rafter length.",
    description:
      "Long-span aluminium roofing sheet in 0.55mm gauge, roll-formed to the exact length of your rafters so there are no end laps. Available in step-tile, corrugated and klip-lok profiles.",
  },
  {
    slug: "stepped-roofing-tile", name: "Stone-Coated Stepped Roofing Tile", sku: "SUEZ-BLD-STC",
    category: "building-materials", price: N(11500), costPrice: N(10100), unit: "per length",
    stock: 180, lowStockThreshold: 40,
    shortDescription: "Stone-coated steel roofing tile with a 30-year finish warranty.",
    description:
      "Aluzinc steel base with an acrylic-bonded stone chip finish. Quiet in heavy rain, resistant to fade and corrosion, and supplied with matching ridge caps and valley gutters.",
  },
  {
    slug: "floor-tiles-60x60", name: "Porcelain Floor Tile 60×60 — Carton", sku: "SUEZ-BLD-TIL60",
    category: "building-materials", price: N(12800), costPrice: N(11000), unit: "per carton",
    stock: 260, lowStockThreshold: 50,
    shortDescription: "Rectified porcelain floor tile, 4 pieces per carton covering 1.44m².",
    description:
      "Rectified 600×600mm porcelain floor tile with low water absorption, suitable for high-traffic residential and light commercial floors. Four pieces per carton covering 1.44m².",
  },
  {
    slug: "emulsion-paint-20l", name: "Emulsion Paint — 20 Litre", sku: "SUEZ-BLD-EMU20",
    category: "building-materials", price: N(34000), costPrice: N(29000), unit: "per bucket",
    stock: 140, lowStockThreshold: 30,
    shortDescription: "Washable interior emulsion, tinted to your colour on request.",
    description:
      "Vinyl matt emulsion with good opacity and a washable finish. Supplied white as standard, or tinted to a specified colour reference at no extra cost on orders above four buckets.",
  },
  {
    slug: "gloss-paint-4l", name: "Oil Gloss Paint — 4 Litre", sku: "SUEZ-BLD-GLS4",
    category: "building-materials", price: N(12500), costPrice: N(10400), unit: "per bucket",
    stock: 210, lowStockThreshold: 40,
    shortDescription: "High-sheen oil-based gloss for joinery, metalwork and trim.",
    description:
      "Durable alkyd gloss finish for interior and exterior woodwork and metal. Recoat in 16 hours; thin with white spirit where spray application is required.",
  },
  {
    slug: "pvc-pipe-4-inch", name: "PVC Pressure Pipe — 4 inch", sku: "SUEZ-BLD-PVC4",
    category: "building-materials", price: N(7200), costPrice: N(6300), unit: "per length",
    stock: 340, lowStockThreshold: 60,
    shortDescription: "4 inch uPVC pipe for soil, waste and low-pressure water lines.",
    description:
      "uPVC pipe in standard 5.8 metre lengths with solvent-weld sockets. Rated for buried soil and waste applications and low-pressure cold water distribution.",
  },
  {
    slug: "galvanised-pipe-2-inch", name: "Galvanised Steel Pipe — 2 inch", sku: "SUEZ-BLD-GAL2",
    category: "building-materials", price: N(18000), costPrice: N(16000), unit: "per length",
    stock: 120, lowStockThreshold: 30,
    shortDescription: "Hot-dip galvanised steel pipe for water mains and structural use.",
    description:
      "Hot-dip galvanised medium-gauge steel pipe, threaded both ends, in 6 metre lengths. Used for borehole risers, water mains and light structural frames.",
  },

  {
    slug: "bottled-water-carton", name: "Bottled Water 75cl — Carton of 12", sku: "SUEZ-BEV-WTR75",
    category: "beverages-and-consumables", price: N(2400), costPrice: N(1950), unit: "per carton",
    stock: 1400, lowStockThreshold: 200, featured: true,
    shortDescription: "NAFDAC-registered table water, twelve 75cl bottles per carton.",
    description:
      "Treated and bottled table water carrying full NAFDAC registration. Supplied by the carton for offices and events, or by the pallet for camps and site canteens.",
  },
  {
    slug: "soft-drinks-crate", name: "Soft Drinks — Crate of 12 (50cl)", sku: "SUEZ-BEV-SFT12",
    category: "beverages-and-consumables", price: N(4800), costPrice: N(4200), unit: "per crate",
    stock: 620, lowStockThreshold: 100,
    shortDescription: "Assorted carbonated soft drinks, twelve 50cl returnable bottles.",
    description:
      "Mixed crate of carbonated soft drinks in returnable glass. Crate deposit is refundable on return of empties in good condition. Assortment can be specified in your order notes.",
  },
  {
    slug: "malt-drink-carton", name: "Malt Drink — Carton of 24", sku: "SUEZ-BEV-MLT24",
    category: "beverages-and-consumables", price: N(8500), costPrice: N(7400), unit: "per carton",
    stock: 380, lowStockThreshold: 80,
    shortDescription: "Non-alcoholic malt, twenty-four cans per carton.",
    description:
      "Non-alcoholic malt beverage in 33cl cans, twenty-four to a carton. A standard line for corporate events, hospitality and staff welfare packs.",
  },
  {
    slug: "table-water-sachet-bag", name: "Sachet Water — Bag of 20", sku: "SUEZ-BEV-SCH20",
    category: "beverages-and-consumables", price: N(450), costPrice: N(340), unit: "per pack",
    stock: 2600, lowStockThreshold: 400, minOrderQty: 10,
    shortDescription: "Twenty 50cl sachets per bag — site and event supply.",
    description:
      "Registered sachet water supplied by the bag. The standard hydration line for construction sites, transport crews and large gatherings. Minimum order ten bags.",
  },

  {
    slug: "petrol-generator-6-5kva", name: "Petrol Generator — 6.5kVA", sku: "SUEZ-APP-GEN65",
    category: "appliances-and-power", price: N(985000), compareAtPrice: N(1050000), costPrice: N(860000),
    unit: "each", stock: 18, lowStockThreshold: 4, featured: true,
    shortDescription: "Key-start 6.5kVA petrol generator with AVR and 25 litre tank.",
    description:
      "Single-phase 6.5kVA petrol generating set with automatic voltage regulation, electric start and a 25 litre tank giving roughly eight hours at half load. Supplied with battery, starter cable and a twelve month warranty on the engine and alternator.",
  },
  {
    slug: "diesel-generator-15kva", name: "Diesel Generator — 15kVA Soundproof", sku: "SUEZ-APP-GEN15D",
    category: "appliances-and-power", price: N(4850000), costPrice: N(4200000), unit: "each",
    stock: 4, lowStockThreshold: 2, requiresQuote: false,
    shortDescription: "Soundproof 15kVA diesel set with ATS-ready control panel.",
    description:
      "Canopied 15kVA three-phase diesel generating set on a base fuel tank, with a control panel ready for automatic transfer switch integration. Installation, cabling and commissioning quoted separately — contact us for a site survey.",
  },
  {
    slug: "gas-cooker-4-burner", name: "Gas Cooker — 4 Burner with Oven", sku: "SUEZ-APP-CKR4",
    category: "appliances-and-power", price: N(185000), costPrice: N(158000), unit: "each",
    stock: 26, lowStockThreshold: 6,
    shortDescription: "Four-burner gas cooker with oven, grill and flame-failure device.",
    description:
      "Free-standing four-burner gas cooker with a full oven and grill, cast iron pan supports and flame-failure cut-off on every burner. Supplied with hose, regulator and a twelve month warranty.",
  },
  {
    slug: "surface-water-pump", name: "Surface Water Pump — 1.5HP", sku: "SUEZ-APP-PMP15",
    category: "appliances-and-power", price: N(78000), costPrice: N(66000), unit: "each",
    stock: 34, lowStockThreshold: 8,
    shortDescription: "1.5HP self-priming surface pump for tanks and boosting.",
    description:
      "Self-priming cast iron surface pump rated 1.5HP, suitable for drawing from surface tanks and boosting building distribution. Includes thermal overload protection.",
  },

  {
    slug: "safety-helmet", name: "Safety Helmet — Industrial", sku: "SUEZ-SAF-HLM",
    category: "safety-and-industrial", price: N(6500), costPrice: N(4800), unit: "each",
    stock: 320, lowStockThreshold: 60,
    shortDescription: "Vented industrial hard hat with 6-point ratchet harness.",
    description:
      "HDPE shell hard hat with a six-point ratchet harness and sweatband, meeting EN 397. Available in white, yellow, blue and red; company branding can be printed on orders above fifty units.",
  },
  {
    slug: "safety-boots", name: "Safety Boots — Steel Toe", sku: "SUEZ-SAF-BOOT",
    category: "safety-and-industrial", price: N(22000), costPrice: N(17500), unit: "per set",
    stock: 145, lowStockThreshold: 30,
    shortDescription: "Steel toe-cap and midsole boots, sizes 39–46.",
    description:
      "Leather safety boot with a 200 joule steel toe cap, penetration-resistant midsole and oil-resistant sole. Sizes 39 to 46 — state your size in the order notes.",
  },
  {
    slug: "fire-extinguisher-9kg", name: "Fire Extinguisher — 9kg DCP", sku: "SUEZ-SAF-EXT9",
    category: "safety-and-industrial", price: N(42000), costPrice: N(35000), unit: "each",
    stock: 58, lowStockThreshold: 12,
    shortDescription: "9kg dry chemical powder extinguisher with wall bracket.",
    description:
      "9kg ABC dry chemical powder extinguisher with pressure gauge, wall bracket and a service tag. Annual servicing and refilling available on contract for multi-site portfolios.",
  },
  {
    slug: "jerry-can-25l", name: "Jerry Can — 25 Litre", sku: "SUEZ-SAF-JC25",
    category: "safety-and-industrial", price: N(8500), costPrice: N(6800), unit: "each",
    stock: 190, lowStockThreshold: 40,
    shortDescription: "Food-grade HDPE jerry can with tamper-evident cap.",
    description:
      "25 litre HDPE jerry can with a moulded handle and tamper-evident screw cap. Rated for fuel, water and chemical decanting.",
  },
];

async function main() {
  console.log("Seeding Suez Trading…");

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

  // ---- catalogue ------------------------------------------------------------
  const categoryIds = new Map<string, string>();
  for (const c of categories) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, sortOrder: c.sortOrder },
      create: { ...c, image: `/categories/${c.slug}.svg` },
    });
    categoryIds.set(c.slug, row.id);
  }

  for (const p of products) {
    const categoryId = categoryIds.get(p.category);
    if (!categoryId) throw new Error(`Unknown category ${p.category}`);
    const { category: _category, ...rest } = p;

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: { ...rest, categoryId },
      create: { ...rest, categoryId },
    });

    const existingImage = await prisma.productImage.findFirst({
      where: { productId: product.id },
    });
    if (!existingImage) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: `/products/${p.slug}.svg`,
          alt: p.name,
          sortOrder: 0,
        },
      });
    }

    const hasMovement = await prisma.stockMovement.findFirst({ where: { productId: product.id } });
    if (!hasMovement) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          delta: p.stock,
          balance: p.stock,
          reason: "RESTOCK",
          note: "Opening stock",
          actorId: owner.id,
        },
      });
    }
  }

  // ---- coupon ---------------------------------------------------------------
  await prisma.coupon.upsert({
    where: { code: "SUEZ10" },
    update: {},
    create: {
      code: "SUEZ10",
      type: "PERCENT",
      value: 10,
      minSubtotal: N(50000),
      maxUses: 200,
      active: true,
    },
  });

  // ---- demo orders so the dashboard is not empty on first run ---------------
  const existingOrders = await prisma.order.count();
  if (existingOrders === 0) {
    const cement = await prisma.product.findUnique({ where: { slug: "dangote-cement" } });
    const rods = await prisma.product.findUnique({ where: { slug: "iron-rods-12mm" } });
    const gen = await prisma.product.findUnique({ where: { slug: "petrol-generator-6-5kva" } });
    const water = await prisma.product.findUnique({ where: { slug: "bottled-water-carton" } });

    const demo = [
      {
        reference: "SUEZ-1208-K4T7M",
        customerName: "Chidera Okafor",
        customerEmail: "chidera.okafor@example.com",
        customerPhone: "+2348031234567",
        city: "Abuja",
        state: "Federal Capital Territory",
        addressLine1: "Plot 14, Aminu Kano Crescent, Wuse II",
        status: "DELIVERED",
        paymentStatus: "PAID",
        paidAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 11),
        items: [
          { p: cement, qty: 40 },
          { p: rods, qty: 25 },
        ],
      },
      {
        reference: "SUEZ-1908-R7QX2",
        customerName: "Halima Bello",
        customerEmail: "halima.bello@example.com",
        customerPhone: "+2348059876543",
        city: "Kaduna",
        state: "Kaduna",
        addressLine1: "8 Ahmadu Bello Way",
        status: "PROCESSING",
        paymentStatus: "PAID",
        paidAt: new Date(Date.now() - 1000 * 60 * 60 * 30),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 32),
        items: [{ p: gen, qty: 1 }],
      },
      {
        reference: "SUEZ-2408-D3WPL",
        customerName: "Tunde Adeyemi",
        customerEmail: "tunde.adeyemi@example.com",
        customerPhone: "+2347012223344",
        city: "Lagos",
        state: "Lagos",
        addressLine1: "22 Adeola Odeku Street, Victoria Island",
        status: "PENDING",
        paymentStatus: "PENDING",
        paidAt: null,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
        items: [{ p: water, qty: 30 }],
      },
    ];

    for (const d of demo) {
      const items = d.items
        .filter((i) => i.p)
        .map((i) => ({
          productId: i.p!.id,
          name: i.p!.name,
          sku: i.p!.sku,
          unit: i.p!.unit,
          unitPrice: i.p!.price,
          quantity: i.qty,
          lineTotal: i.p!.price * i.qty,
        }));
      const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
      const shipping = subtotal >= DEFAULT_SETTINGS.freeShippingThreshold ? 0 : DEFAULT_SETTINGS.shippingFlatRate;

      const order = await prisma.order.create({
        data: {
          reference: d.reference,
          customerName: d.customerName,
          customerEmail: d.customerEmail,
          customerPhone: d.customerPhone,
          addressLine1: d.addressLine1,
          city: d.city,
          state: d.state,
          subtotal,
          shipping,
          total: subtotal + shipping,
          status: d.status as OrderStatus,
          paymentStatus: d.paymentStatus as PaymentStatus,
          paidAt: d.paidAt,
          createdAt: d.createdAt,
          stockCommitted: d.paymentStatus === "PAID",
          paymentChannel: d.paymentStatus === "PAID" ? "card" : null,
          items: { create: items },
          events: {
            create: [
              { type: "CREATED" as const, message: "Order placed on the storefront." },
              ...(d.paymentStatus === "PAID"
                ? [
                    {
                      type: "PAYMENT_PAID" as const,
                      message: "Payment confirmed by Paystack.",
                    },
                  ]
                : []),
            ],
          },
        },
      });

      if (d.paymentStatus === "PAID") {
        for (const item of items) {
          const product = await prisma.product.findUnique({ where: { id: item.productId } });
          if (!product) continue;
          const balance = product.stock - item.quantity;
          await prisma.product.update({ where: { id: product.id }, data: { stock: balance } });
          await prisma.stockMovement.create({
            data: {
              productId: product.id,
              delta: -item.quantity,
              balance,
              reason: "SALE",
              note: `Order ${order.reference}`,
              orderId: order.id,
            },
          });
        }
      }
    }

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
          service: "General Supplies & Distribution",
          subject: "Bulk cement and rods for estate phase 2",
          message:
            "Requesting a quotation for 1,200 bags of cement and assorted reinforcement for a 24-unit estate in Lugbe.",
          status: "IN_PROGRESS",
        },
      ],
    });
  }

  const counts = {
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    orders: await prisma.order.count(),
    staff: await prisma.adminUser.count(),
  };
  console.log("Seed complete:", counts);
  console.log(`\nAdmin sign-in:  ${email}  /  ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
