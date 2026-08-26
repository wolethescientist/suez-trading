import "dotenv/config";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import type { OrderStatus, PaymentStatus } from "../lib/generated/prisma/client";
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

async function uploadToCloudinary(
  sourceUrl: string,
  subFolder: string,
  publicId: string
): Promise<{ url: string; storageId: string | null }> {
  const config = cloudinaryConfig();
  if (!config) {
    return { url: sourceUrl, storageId: null };
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
    form.append("file", sourceUrl);
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
      return { url: sourceUrl, storageId: null };
    }

    return { url: body.secure_url, storageId: body.public_id };
  } catch (err) {
    console.warn(`[Cloudinary] Exception for ${publicId}:`, err);
    return { url: sourceUrl, storageId: null };
  }
}

// ---------------------------------------------------------------- categories

const categories = [
  {
    slug: "petroleum-products",
    name: "Petroleum Products",
    sortOrder: 1,
    imageUrl: "https://images.unsplash.com/photo-1545128485-c400e7702796?w=1200&auto=format&fit=crop&q=80",
    description:
      "Refined petroleum products supplied in bulk or part-load, delivered by our own tanker fleet with calibrated metering.",
  },
  {
    slug: "lubricants-and-oils",
    name: "Lubricants & Oils",
    sortOrder: 2,
    imageUrl: "https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=1200&auto=format&fit=crop&q=80",
    description:
      "Engine, hydraulic and gear oils plus high-performance greases for automotive fleets, marine vessels and industrial plant.",
  },
  {
    slug: "building-materials",
    name: "Building Materials",
    sortOrder: 3,
    imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&auto=format&fit=crop&q=80",
    description:
      "Factory-fresh cement, high-yield rebar, long-span roofing, porcelain tiles and structural plumbing delivered to site.",
  },
  {
    slug: "beverages-and-consumables",
    name: "Beverages & Consumables",
    sortOrder: 4,
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1200&auto=format&fit=crop&q=80",
    description:
      "Wholesale beverage distribution and FMCG supplies for corporate accounts, hospitality, retail outlets and construction camps.",
  },
  {
    slug: "appliances-and-power",
    name: "Appliances & Power",
    sortOrder: 5,
    imageUrl: "https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=1200&auto=format&fit=crop&q=80",
    description:
      "Generating sets, solar hybrid power inverters, water booster pumps and commercial appliances with warranty and service support.",
  },
  {
    slug: "safety-and-industrial",
    name: "Safety & Industrial",
    sortOrder: 6,
    imageUrl: "https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=1200&auto=format&fit=crop&q=80",
    description:
      "Certified PPE, fire prevention systems, storage tanks and site consumables for safe, compliant operational environments.",
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
  // --- Petroleum Products
  {
    slug: "ago-diesel",
    name: "Automotive Gas Oil (AGO / Diesel)",
    sku: "SUEZ-PET-AGO",
    category: "petroleum-products",
    price: N(1150),
    costPrice: N(1010),
    unit: "per litre",
    stock: 48000,
    lowStockThreshold: 10000,
    minOrderQty: 100,
    brand: "Suez Petroleum",
    featured: true,
    warehouse: "Abuja Bulk Depot",
    imageUrl: "https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&auto=format&fit=crop&q=80",
    shortDescription: "Low-sulphur automotive gas oil for generators, plant and haulage fleets.",
    description:
      "Clean, filtered Automotive Gas Oil (AGO) supplied direct from licensed depots. Every delivery is metered through calibrated flow meters and accompanied by a delivery certificate indicating batch density, flash point, and net volume. Suitable for industrial generating sets, construction heavy equipment, and commercial truck fleets. Dedicated bulk discounts apply for orders above 10,000 litres.",
  },
  {
    slug: "pms-petrol",
    name: "Premium Motor Spirit (PMS / Petrol)",
    sku: "SUEZ-PET-PMS",
    category: "petroleum-products",
    price: N(950),
    costPrice: N(880),
    unit: "per litre",
    stock: 32000,
    lowStockThreshold: 8000,
    minOrderQty: 100,
    brand: "Suez Petroleum",
    featured: true,
    warehouse: "Abuja Bulk Depot",
    imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&auto=format&fit=crop&q=80",
    shortDescription: "Retail and commercial PMS supply for filling stations, corporate fleets and standby power.",
    description:
      "High-octane Premium Motor Spirit lifted from certified marine and pipeline terminals. Dispatched via modern compartmented tankers with tamper-proof seal protection. Suitable for filling station replenishment, logistics hubs, and enterprise backup power systems.",
  },
  {
    slug: "dpk-kerosene",
    name: "Dual Purpose Kerosene (DPK)",
    sku: "SUEZ-PET-DPK",
    category: "petroleum-products",
    price: N(1300),
    costPrice: N(1190),
    unit: "per litre",
    stock: 14500,
    lowStockThreshold: 4000,
    minOrderQty: 50,
    brand: "Suez Petroleum",
    warehouse: "Abuja Bulk Depot",
    imageUrl: "https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&auto=format&fit=crop&q=80",
    shortDescription: "Household and industrial kerosene, filtered and depot-certified.",
    description:
      "Treated Dual Purpose Kerosene for commercial heating, industrial furnaces, surface degreasing, and domestic utility. Supplied in standard 200L steel drums or bulk road tanker discharge.",
  },
  {
    slug: "lpg-cylinder-12-5kg",
    name: "LPG Cooking Gas — 12.5kg Refill",
    sku: "SUEZ-PET-LPG125",
    category: "petroleum-products",
    price: N(16500),
    costPrice: N(14200),
    unit: "per cylinder",
    stock: 240,
    lowStockThreshold: 40,
    brand: "Suez Gas",
    featured: true,
    warehouse: "Idu Gas Bottling Plant",
    weightKg: 12.5,
    imageUrl: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop&q=80",
    shortDescription: "12.5kg cooking gas refill with certified tare weight and valve inspection.",
    description:
      "Clean propane-butane blend cooking gas weighed on digital scales. Every cylinder undergoes mandatory valve inspection, seal replacement, and leak testing prior to delivery.",
  },
  {
    slug: "lpg-cylinder-50kg",
    name: "LPG Cooking Gas — 50kg Refill",
    sku: "SUEZ-PET-LPG50",
    category: "petroleum-products",
    price: N(62000),
    costPrice: N(55000),
    unit: "per cylinder",
    stock: 46,
    lowStockThreshold: 10,
    brand: "Suez Gas",
    warehouse: "Idu Gas Bottling Plant",
    weightKg: 50,
    imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
    shortDescription: "50kg commercial LPG cylinder refill for bakeries, hotels and restaurants.",
    description:
      "High-capacity 50kg LPG cylinder refills suited for industrial kitchens, hospitality facilities, and commercial bakeries. Scheduled route delivery available with manifold system inspections.",
  },

  // --- Lubricants & Oils
  {
    slug: "engine-oil-sae-40",
    name: "Engine Oil SAE 40 — 25 Litre",
    sku: "SUEZ-LUB-SAE40",
    category: "lubricants-and-oils",
    price: N(48000),
    compareAtPrice: N(52000),
    costPrice: N(41000),
    unit: "per drum",
    stock: 130,
    lowStockThreshold: 20,
    featured: true,
    brand: "Suez Lube",
    warehouse: "Idu Industrial Warehouse",
    weightKg: 23,
    imageUrl: "https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=800&auto=format&fit=crop&q=80",
    shortDescription: "Monograde heavy-duty diesel engine oil for trucks, tractors and stationary generators.",
    description:
      "Premium detergent SAE 40 mineral engine oil engineered for naturally aspirated and turbocharged diesel engines operating under high ambient temperatures. Delivers outstanding anti-wear protection and thermal stability.",
  },
  {
    slug: "hydraulic-oil-iso-68",
    name: "Hydraulic Oil ISO 68 — 20 Litre",
    sku: "SUEZ-LUB-ISO68",
    category: "lubricants-and-oils",
    price: N(52000),
    costPrice: N(45500),
    unit: "per drum",
    stock: 84,
    lowStockThreshold: 15,
    brand: "Suez Lube",
    warehouse: "Idu Industrial Warehouse",
    weightKg: 18.5,
    imageUrl: "https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=800&auto=format&fit=crop&q=80",
    shortDescription: "Anti-wear hydraulic fluid for excavators, loaders, forklifts and industrial presses.",
    description:
      "ISO VG 68 anti-wear hydraulic oil formulated with premium zinc additives and anti-foaming agents. Prevents pump cavitation and protects hydraulic valves and cylinders under continuous high pressures.",
  },
  {
    slug: "gear-oil-ep-90",
    name: "Gear Oil EP 90 — 20 Litre",
    sku: "SUEZ-LUB-EP90",
    category: "lubricants-and-oils",
    price: N(46000),
    costPrice: N(40000),
    unit: "per drum",
    stock: 62,
    lowStockThreshold: 15,
    brand: "Suez Lube",
    warehouse: "Idu Industrial Warehouse",
    weightKg: 18.5,
    imageUrl: "https://images.unsplash.com/photo-1508974239320-0a029497e820?w=800&auto=format&fit=crop&q=80",
    shortDescription: "Extreme-pressure gear lubricant for differentials, gearboxes and steering units.",
    description:
      "API GL-4/GL-5 extreme pressure gear lubricant designed for hypoid gears, heavy truck differentials, and transfer cases. Resists thermal breakdown and shear under high torque loads.",
  },
  {
    slug: "multipurpose-grease",
    name: "Multipurpose Lithium Grease — 5kg",
    sku: "SUEZ-LUB-GRS5",
    category: "lubricants-and-oils",
    price: N(18500),
    costPrice: N(15200),
    unit: "per pack",
    stock: 96,
    lowStockThreshold: 20,
    brand: "Suez Lube",
    warehouse: "Idu Industrial Warehouse",
    weightKg: 5,
    imageUrl: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&auto=format&fit=crop&q=80",
    shortDescription: "NLGI Grade 2 lithium complex grease for wheel bearings and chassis grease points.",
    description:
      "Heavy duty NLGI 2 lithium complex grease featuring water washout resistance, anti-rust inhibitors, and wide temperature tolerance from -20°C to 140°C. Ideal for construction plant pins and industrial conveyor bearings.",
  },
  {
    slug: "atf-dexron-3",
    name: "Automatic Transmission Fluid (Dexron III) — 4 Litre",
    sku: "SUEZ-LUB-ATF4",
    category: "lubricants-and-oils",
    price: N(14500),
    compareAtPrice: N(16000),
    costPrice: N(11800),
    unit: "per bottle",
    stock: 110,
    lowStockThreshold: 20,
    brand: "Suez Lube",
    warehouse: "Idu Industrial Warehouse",
    imageUrl: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80",
    shortDescription: "Dexron III fluid for automatic transmissions, power steering and hydrostatic drives.",
    description:
      "Smooth-shifting automatic transmission fluid with high friction durability, oxidation control, and seal compatibility. Recommended for passenger cars, SUVs, light trucks, and hydraulic steering systems.",
  },

  // --- Building Materials
  {
    slug: "dangote-cement",
    name: "Dangote Cement 3X 42.5R — 50kg Bag",
    sku: "SUEZ-BLD-CEMD",
    category: "building-materials",
    price: N(9800),
    compareAtPrice: N(10500),
    costPrice: N(9100),
    unit: "per bag",
    stock: 1850,
    lowStockThreshold: 300,
    featured: true,
    brand: "Dangote",
    warehouse: "Idu Building Depot",
    weightKg: 50,
    imageUrl: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80",
    shortDescription: "42.5R high-grade Portland limestone cement for structural concrete, decking and precast.",
    description:
      "Dangote 3X 42.5R Portland Limestone Cement. Stored under moisture-controlled covered warehousing on pallets. Fresh factory batch rotated weekly. Trailer load (600 or 900 bags) direct site delivery available across Nigeria.",
  },
  {
    slug: "bua-cement",
    name: "BUA Cement 42.5N — 50kg Bag",
    sku: "SUEZ-BLD-CEMB",
    category: "building-materials",
    price: N(9400),
    costPrice: N(8700),
    unit: "per bag",
    stock: 920,
    lowStockThreshold: 300,
    brand: "BUA",
    warehouse: "Idu Building Depot",
    weightKg: 50,
    imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80",
    shortDescription: "BUA 42.5N Portland cement for block moulding, plastering and masonry works.",
    description:
      "BUA 42.5N multi-purpose cement providing consistent workability, rapid setting, and reliable compressive strength for residential and commercial masonry construction.",
  },
  {
    slug: "iron-rods-12mm",
    name: "Reinforcement Iron Rod (TMT) — 12mm",
    sku: "SUEZ-BLD-ROD12",
    category: "building-materials",
    price: N(12500),
    costPrice: N(11300),
    unit: "per length",
    stock: 640,
    lowStockThreshold: 120,
    brand: "Tiger TMT",
    warehouse: "Idu Building Depot",
    weightKg: 10.6,
    imageUrl: "https://images.unsplash.com/photo-1535813547-99c456a41d4a?w=800&auto=format&fit=crop&q=80",
    shortDescription: "12mm thermo-mechanically treated (TMT) high-yield ribbed steel rebar, 12 metre length.",
    description:
      "High-tensile BS 4449 Grade 500 TMT deformed steel rebar in standard 12-metre lengths. Features excellent weldability, ductility, and seismic resistance for building columns, beams, and slabs. Mill test certificates provided.",
  },
  {
    slug: "iron-rods-16mm",
    name: "Reinforcement Iron Rod (TMT) — 16mm",
    sku: "SUEZ-BLD-ROD16",
    category: "building-materials",
    price: N(21000),
    costPrice: N(19200),
    unit: "per length",
    stock: 310,
    lowStockThreshold: 80,
    brand: "Tiger TMT",
    warehouse: "Idu Building Depot",
    weightKg: 18.9,
    imageUrl: "https://images.unsplash.com/photo-1535813547-99c456a41d4a?w=800&auto=format&fit=crop&q=80",
    shortDescription: "16mm heavy structural reinforcement steel rebar, 12 metre length.",
    description:
      "16mm high-yield ribbed rebar for structural foundation rafts, retaining walls, civil bridges, and high-rise load-bearing pillars. Cut and bend to bar bending schedules available on order.",
  },
  {
    slug: "aluminium-roofing-sheet",
    name: "Aluminium Roofing Sheet (Long Span) — 0.55mm",
    sku: "SUEZ-BLD-ALU055",
    category: "building-materials",
    price: N(8900),
    costPrice: N(7900),
    unit: "per length",
    stock: 420,
    lowStockThreshold: 80,
    featured: true,
    warehouse: "Idu Building Depot",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80",
    shortDescription: "0.55mm aluminium step-tile and corrugated long-span roofing, custom cut to rafter length.",
    description:
      "Industrial grade 0.55mm gauge aluminium roofing coils roll-formed to continuous seamless rafter lengths. Eliminates leak points from end overlaps. Available in Wine Red, Forest Green, Chocolate Brown, and Navy Blue.",
  },
  {
    slug: "stepped-roofing-tile",
    name: "Stone-Coated Stepped Roofing Tile",
    sku: "SUEZ-BLD-STC",
    category: "building-materials",
    price: N(11500),
    costPrice: N(10100),
    unit: "per length",
    stock: 180,
    lowStockThreshold: 40,
    warehouse: "Idu Building Depot",
    imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80",
    shortDescription: "Architectural stone-coated steel roof shingles with sound dampening and 30-year finish.",
    description:
      "Aluzinc galvanized steel substrate with bonded natural volcanic stone chips and acrylic overglaze. Resists heavy tropical downpours, wind uplift, and UV discolouration.",
  },
  {
    slug: "floor-tiles-60x60",
    name: "Porcelain Floor Tile 60×60 — Carton",
    sku: "SUEZ-BLD-TIL60",
    category: "building-materials",
    price: N(12800),
    costPrice: N(11000),
    unit: "per carton",
    stock: 260,
    lowStockThreshold: 50,
    warehouse: "Idu Building Depot",
    weightKg: 28,
    imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop&q=80",
    shortDescription: "Polished rectified porcelain floor tiles, 4 pieces per carton covering 1.44m².",
    description:
      "Ultra-low porosity, scratch-resistant rectified porcelain floor tiles in elegant polished marble finish. 4 pieces per carton (1.44m² coverage). Perfect for modern residential living rooms and commercial reception halls.",
  },
  {
    slug: "emulsion-paint-20l",
    name: "Premium Emulsion Paint — 20 Litre",
    sku: "SUEZ-BLD-EMU20",
    category: "building-materials",
    price: N(34000),
    costPrice: N(29000),
    unit: "per bucket",
    stock: 140,
    lowStockThreshold: 30,
    brand: "Dulux",
    warehouse: "Idu Building Depot",
    weightKg: 26,
    imageUrl: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&auto=format&fit=crop&q=80",
    shortDescription: "Washable high-opacity vinyl matt emulsion paint for interior and exterior walls.",
    description:
      "Superior coverage washable emulsion paint formulated with fungal inhibitors and weather-resistant pigments. White stock ready to dispatch; custom computer colour matching on bulk site orders.",
  },
  {
    slug: "gloss-paint-4l",
    name: "Oil Gloss Paint — 4 Litre",
    sku: "SUEZ-BLD-GLS4",
    category: "building-materials",
    price: N(12500),
    costPrice: N(10400),
    unit: "per bucket",
    stock: 210,
    lowStockThreshold: 40,
    brand: "Dulux",
    warehouse: "Idu Building Depot",
    imageUrl: "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=800&auto=format&fit=crop&q=80",
    shortDescription: "High-sheen alkyd enamel gloss paint for metal gates, security grilles and woodwork.",
    description:
      "Tough alkyd oil gloss paint providing mirror-like gloss and durable moisture protection on steel gates, burglary proofing, window frames, and wood trims.",
  },
  {
    slug: "pvc-pipe-4-inch",
    name: "PVC Pressure Pipe — 4 inch (5.8m)",
    sku: "SUEZ-BLD-PVC4",
    category: "building-materials",
    price: N(7200),
    costPrice: N(6300),
    unit: "per length",
    stock: 340,
    lowStockThreshold: 60,
    warehouse: "Idu Building Depot",
    imageUrl: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=80",
    shortDescription: "4 inch uPVC pipe for drainage, soil, waste lines and building plumbing.",
    description:
      "Unplasticised polyvinyl chloride (uPVC) pressure pipe in 5.8m socketed lengths. Impact resistant, non-corrosive, and ideal for soil, waste, rainwater downpipes, and drainage systems.",
  },
  {
    slug: "galvanised-pipe-2-inch",
    name: "Galvanised Steel Pipe — 2 inch (6m)",
    sku: "SUEZ-BLD-GAL2",
    category: "building-materials",
    price: N(18000),
    costPrice: N(16000),
    unit: "per length",
    stock: 120,
    lowStockThreshold: 30,
    warehouse: "Idu Building Depot",
    imageUrl: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=80",
    shortDescription: "Hot-dip galvanised medium-gauge steel pipe, threaded both ends, for water lines and framing.",
    description:
      "Heavy hot-dip galvanised steel pipe in 6m lengths with pre-threaded BSP ends and socket couplings. Suitable for borehole rising mains, fire hydrant risers, and structural frames.",
  },

  // --- Beverages & Consumables
  {
    slug: "bottled-water-carton",
    name: "Bottled Water 75cl — Carton of 12",
    sku: "SUEZ-BEV-WTR75",
    category: "beverages-and-consumables",
    price: N(2400),
    costPrice: N(1950),
    unit: "per carton",
    stock: 1400,
    lowStockThreshold: 200,
    featured: true,
    brand: "Eva",
    warehouse: "Abuja FMCG Warehouse",
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&auto=format&fit=crop&q=80",
    shortDescription: "NAFDAC-registered premium bottled table water, twelve 75cl bottles per carton.",
    description:
      "Treated, ozonated, and micro-filtered natural table water bottled under strict quality standards. Supplied shrink-wrapped by the carton or pallet for corporate offices, events, and construction site canteens.",
  },
  {
    slug: "soft-drinks-crate",
    name: "Soft Drinks — Crate of 12 (50cl)",
    sku: "SUEZ-BEV-SFT12",
    category: "beverages-and-consumables",
    price: N(4800),
    costPrice: N(4200),
    unit: "per crate",
    stock: 620,
    lowStockThreshold: 100,
    brand: "Coca-Cola",
    warehouse: "Abuja FMCG Warehouse",
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80",
    shortDescription: "Assorted carbonated soft drinks, twelve 50cl returnable glass bottles.",
    description:
      "Wholesale crate of carbonated soft drinks (Coke, Fanta, Sprite). Returnable crate deposit refundable upon return. Custom brand mix available on request.",
  },
  {
    slug: "malt-drink-carton",
    name: "Malt Drink (Cans) — Carton of 24",
    sku: "SUEZ-BEV-MLT24",
    category: "beverages-and-consumables",
    price: N(8500),
    costPrice: N(7400),
    unit: "per carton",
    stock: 380,
    lowStockThreshold: 80,
    brand: "Malta Guinness",
    warehouse: "Abuja FMCG Warehouse",
    imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&auto=format&fit=crop&q=80",
    shortDescription: "Non-alcoholic malt beverage with vitamins and minerals, twenty-four 33cl cans.",
    description:
      "Premium non-alcoholic malt beverage enriched with B vitamins. Standard pack for staff catering, hospitality suites, and retail kiosks.",
  },
  {
    slug: "table-water-sachet-bag",
    name: "Sachet Pure Water — Bag of 20",
    sku: "SUEZ-BEV-SCH20",
    category: "beverages-and-consumables",
    price: N(450),
    costPrice: N(340),
    unit: "per pack",
    stock: 2600,
    lowStockThreshold: 400,
    minOrderQty: 10,
    warehouse: "Abuja FMCG Warehouse",
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&auto=format&fit=crop&q=80",
    shortDescription: "Twenty 50cl sealed water sachets per bag — bulk site and camp hydration line.",
    description:
      "Treated and UV-sterilized drinking water packaged in food-safe sachets. The everyday hydration choice for field crews and large site operations. Minimum order 10 bags.",
  },
  {
    slug: "natural-fruit-juice-carton",
    name: "100% Natural Fruit Juice (1L) — Carton of 12",
    sku: "SUEZ-BEV-JUC12",
    category: "beverages-and-consumables",
    price: N(16500),
    compareAtPrice: N(18000),
    costPrice: N(13800),
    unit: "per carton",
    stock: 220,
    lowStockThreshold: 40,
    brand: "Chivita",
    warehouse: "Abuja FMCG Warehouse",
    imageUrl: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800&auto=format&fit=crop&q=80",
    shortDescription: "Assorted 100% natural fruit juice cartons, twelve 1-litre aseptic packs.",
    description:
      "No-added-sugar real fruit juice in 1-litre cartons (Orange, Apple, Exotic Mango). Long shelf-life aseptic packaging suitable for corporate events and retail shelves.",
  },

  // --- Appliances & Power
  {
    slug: "petrol-generator-6-5kva",
    name: "Petrol Generator — 6.5kVA Key Start",
    sku: "SUEZ-APP-GEN65",
    category: "appliances-and-power",
    price: N(985000),
    compareAtPrice: N(1050000),
    costPrice: N(860000),
    unit: "each",
    stock: 18,
    lowStockThreshold: 4,
    featured: true,
    brand: "Lutian",
    warehouse: "Idu Equipment Depot",
    weightKg: 85,
    imageUrl: "https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=800&auto=format&fit=crop&q=80",
    shortDescription: "Key-start 6.5kVA single phase petrol generator with AVR and 25 litre fuel tank.",
    description:
      "Rugged 6.5kVA 100% copper-wound alternator generator with digital voltmeter, circuit breaker, wheel kit, and electric key start. Supplies steady power for duplex homes, offices, deep freezers, and 1.5HP air conditioners.",
  },
  {
    slug: "diesel-generator-15kva",
    name: "Diesel Generator — 15kVA Soundproof Canopy",
    sku: "SUEZ-APP-GEN15D",
    category: "appliances-and-power",
    price: N(4850000),
    costPrice: N(4200000),
    unit: "each",
    stock: 4,
    lowStockThreshold: 2,
    brand: "Perkins / Suez",
    warehouse: "Idu Equipment Depot",
    weightKg: 650,
    imageUrl: "https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=800&auto=format&fit=crop&q=80",
    shortDescription: "Soundproof 15kVA water-cooled 3-phase diesel generator set with ATS automatic controller.",
    description:
      "Heavy-duty silent canopied 15kVA diesel generator with base fuel tank, digital control panel, and ATS automatic transfer switch integration. Designed for continuous prime or standby operations in commercial buildings and data hubs.",
  },
  {
    slug: "hybrid-solar-inverter-5kva",
    name: "Hybrid Solar Inverter 5kVA / 48V Pure Sine Wave",
    sku: "SUEZ-APP-SOL5K",
    category: "appliances-and-power",
    price: N(1450000),
    compareAtPrice: N(1600000),
    costPrice: N(1250000),
    unit: "each",
    stock: 12,
    lowStockThreshold: 3,
    featured: true,
    brand: "Felicity Solar",
    warehouse: "Idu Equipment Depot",
    weightKg: 14,
    imageUrl: "https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=800&auto=format&fit=crop&q=80",
    shortDescription: "5kVA 48V pure sine wave hybrid solar inverter with built-in 80A MPPT charge controller.",
    description:
      "All-in-one solar hybrid inverter with MPPT solar tracking, grid bypass, battery equalization, and LCD status display. Powers lighting, refrigerators, entertainment systems, and IT equipment seamlessly with zero changeover delay.",
  },
  {
    slug: "gas-cooker-4-burner",
    name: "Stainless Steel Gas Cooker — 4 Burner with Oven",
    sku: "SUEZ-APP-CKR4",
    category: "appliances-and-power",
    price: N(185000),
    costPrice: N(158000),
    unit: "each",
    stock: 26,
    lowStockThreshold: 6,
    brand: "Maxi",
    warehouse: "Idu Equipment Depot",
    weightKg: 32,
    imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80",
    shortDescription: "Four-burner stainless gas cooker with oven, grill, auto-ignition and flame failure device.",
    description:
      "Free-standing 60×60cm stainless steel gas cooker with double-glass oven door, rotisserie grill, cast-iron pan supports, and automatic electronic push-button ignition.",
  },
  {
    slug: "surface-water-pump",
    name: "Surface Water Booster Pump — 1.5HP",
    sku: "SUEZ-APP-PMP15",
    category: "appliances-and-power",
    price: N(78000),
    costPrice: N(66000),
    unit: "each",
    stock: 34,
    lowStockThreshold: 8,
    brand: "Pedrollo",
    warehouse: "Idu Equipment Depot",
    weightKg: 14.5,
    imageUrl: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&auto=format&fit=crop&q=80",
    shortDescription: "1.5HP self-priming centrifugal surface pump with brass impeller and thermal overload switch.",
    description:
      "Cast iron self-priming surface water pump designed for transferring water from underground storage to overhead tanks and boosting pressure throughout residential and commercial multi-storey buildings.",
  },

  // --- Safety & Industrial
  {
    slug: "safety-helmet",
    name: "Safety Helmet — Industrial Hard Hat (EN 397)",
    sku: "SUEZ-SAF-HLM",
    category: "safety-and-industrial",
    price: N(6500),
    costPrice: N(4800),
    unit: "each",
    stock: 320,
    lowStockThreshold: 60,
    brand: "Delta Plus",
    warehouse: "Abuja Safety Store",
    imageUrl: "https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80",
    shortDescription: "High-density polyethylene safety hard hat with 6-point adjustable ratchet suspension.",
    description:
      "Vented high-impact industrial safety helmet compliant with EN 397. Includes sweatband and chin strap anchor points. Available in White, Yellow, Blue, and Red. Custom corporate logo screen printing available for orders of 50+ units.",
  },
  {
    slug: "safety-boots",
    name: "Safety Boots — Steel Toe & Midsole",
    sku: "SUEZ-SAF-BOOT",
    category: "safety-and-industrial",
    price: N(22000),
    compareAtPrice: N(25000),
    costPrice: N(17500),
    unit: "per pair",
    stock: 145,
    lowStockThreshold: 30,
    featured: true,
    brand: "Rocklander",
    warehouse: "Abuja Safety Store",
    weightKg: 1.8,
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
    shortDescription: "Genuine leather safety boots with 200J steel toe cap, anti-puncture steel plate, and oil-proof sole.",
    description:
      "Full-grain water-resistant leather work boots with padded collar, breathable mesh lining, anti-static shock absorbent heel, and steel penetration-resistant midsole. Euro sizes 39–46.",
  },
  {
    slug: "fire-extinguisher-9kg",
    name: "Fire Extinguisher — 9kg ABC Dry Chemical Powder",
    sku: "SUEZ-SAF-EXT9",
    category: "safety-and-industrial",
    price: N(42000),
    costPrice: N(35000),
    unit: "each",
    stock: 58,
    lowStockThreshold: 12,
    featured: true,
    brand: "NAFFCO",
    warehouse: "Abuja Safety Store",
    weightKg: 13.5,
    imageUrl: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80",
    shortDescription: "9kg multi-purpose ABC dry chemical powder extinguisher with pressure gauge and wall bracket.",
    description:
      "High performance 9kg DCP extinguisher suitable for Class A (wood/paper), Class B (flammable liquids/petrol), and Class C (gas/electrical) fires. Certified to BS EN3 with annual maintenance tagging.",
  },
  {
    slug: "jerry-can-25l",
    name: "Heavy-Duty Jerry Can — 25 Litre HDPE",
    sku: "SUEZ-SAF-JC25",
    category: "safety-and-industrial",
    price: N(8500),
    costPrice: N(6800),
    unit: "each",
    stock: 190,
    lowStockThreshold: 40,
    warehouse: "Abuja Safety Store",
    weightKg: 1.2,
    imageUrl: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop&q=80",
    shortDescription: "Food-grade and fuel-rated 25L HDPE jerry can with tamper-evident screw cap and breather spout.",
    description:
      "Thick-walled high-density polyethylene liquid storage can with reinforced carry handle, threaded pouring spout, and tamper-resistant sealing cap. Chemical and UV resistant.",
  },
  {
    slug: "high-vis-vest-pack",
    name: "High-Visibility Reflective Vest — Pack of 10",
    sku: "SUEZ-SAF-VEST10",
    category: "safety-and-industrial",
    price: N(18000),
    costPrice: N(14000),
    unit: "per pack",
    stock: 85,
    lowStockThreshold: 20,
    warehouse: "Abuja Safety Store",
    imageUrl: "https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80",
    shortDescription: "Pack of 10 fluorescent yellow/orange safety vests with 2-inch reflective bands.",
    description:
      "Lightweight breathable mesh safety vests with front zipper closure and dual 360° reflective stripes compliant with EN ISO 20471 Class 2. Essential for road crews, traffic marshals, and site visitors.",
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
  console.log("\nChecking Demo Orders & Enquiries…");
  const existingOrders = await prisma.order.count();
  if (existingOrders === 0) {
    const cement = await prisma.product.findUnique({ where: { slug: "dangote-cement" } });
    const rods = await prisma.product.findUnique({ where: { slug: "iron-rods-12mm" } });
    const gen = await prisma.product.findUnique({ where: { slug: "petrol-generator-6-5kva" } });
    const water = await prisma.product.findUnique({ where: { slug: "bottled-water-carton" } });
    const boots = await prisma.product.findUnique({ where: { slug: "safety-boots" } });
    const lube = await prisma.product.findUnique({ where: { slug: "engine-oil-sae-40" } });

    const demo = [
      {
        reference: "SUEZ-1208-K4T7M",
        customerName: "Engr. Chidera Okafor",
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
        customerName: "Alhaji Halima Bello",
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
        customerName: "Dr. Tunde Adeyemi",
        customerEmail: "tunde.adeyemi@example.com",
        customerPhone: "+2347012223344",
        city: "Lagos",
        state: "Lagos",
        addressLine1: "22 Adeola Odeku Street, Victoria Island",
        status: "PENDING",
        paymentStatus: "PENDING",
        paidAt: null,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
        items: [
          { p: water, qty: 30 },
          { p: boots, qty: 5 },
        ],
      },
      {
        reference: "SUEZ-2608-F8M9N",
        customerName: "Chief Emeka Nwosu",
        customerEmail: "emeka.nwosu@example.com",
        customerPhone: "+2348123334455",
        city: "Port Harcourt",
        state: "Rivers",
        addressLine1: "Trans Amadi Industrial Layout",
        status: "PROCESSING",
        paymentStatus: "PAID",
        paidAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14),
        items: [{ p: lube, qty: 8 }],
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
      const shipping =
        subtotal >= DEFAULT_SETTINGS.freeShippingThreshold ? 0 : DEFAULT_SETTINGS.shippingFlatRate;

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
