import "server-only";
import { prisma } from "@/lib/db";
import { DEFAULT_SETTINGS, type StoreSettings } from "@/lib/store-config";

export { DEFAULT_SETTINGS, calculateShipping } from "@/lib/store-config";
export type { StoreSettings } from "@/lib/store-config";

export async function getSettings(): Promise<StoreSettings> {
  // Settings decorate the storefront; they are never load-bearing. If the
  // database is unreachable — a cold Neon branch, a build with no connection
  // string — fall back to defaults rather than taking the whole site down.
  let rows: { key: string; value: string }[] = [];
  try {
    rows = await prisma.setting.findMany();
  } catch (error) {
    console.error("Could not read store settings; using defaults.", error);
    return DEFAULT_SETTINGS;
  }

  const map = new Map(rows.map((r) => [r.key, r.value]));

  const num = (k: keyof StoreSettings, d: number) => {
    const v = map.get(k);
    const n = v === undefined ? NaN : Number(v);
    return Number.isFinite(n) ? n : d;
  };
  const bool = (k: keyof StoreSettings, d: boolean) => {
    const v = map.get(k);
    return v === undefined ? d : v === "true";
  };
  const str = (k: keyof StoreSettings, d: string) => map.get(k) ?? d;

  return {
    shippingFlatRate: num("shippingFlatRate", DEFAULT_SETTINGS.shippingFlatRate),
    freeShippingThreshold: num("freeShippingThreshold", DEFAULT_SETTINGS.freeShippingThreshold),
    pickupAddress: str("pickupAddress", DEFAULT_SETTINGS.pickupAddress),
    announcement: str("announcement", DEFAULT_SETTINGS.announcement),
    announcementActive: bool("announcementActive", DEFAULT_SETTINGS.announcementActive),
    contactEmail: str("contactEmail", DEFAULT_SETTINGS.contactEmail),
    contactPhone: str("contactPhone", DEFAULT_SETTINGS.contactPhone),
    lowStockAlerts: bool("lowStockAlerts", DEFAULT_SETTINGS.lowStockAlerts),
    ordersOpen: bool("ordersOpen", DEFAULT_SETTINGS.ordersOpen),
  };
}

export async function saveSettings(patch: Partial<StoreSettings>) {
  const entries = Object.entries(patch).filter(([, v]) => v !== undefined);
  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        create: { key, value: String(value) },
        update: { value: String(value) },
      }),
    ),
  );
}
