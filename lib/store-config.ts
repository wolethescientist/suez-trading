/** Pure store configuration — no server-only imports, so the seed and client
 *  components can both read it. */
export type StoreSettings = {
  shippingFlatRate: number; // kobo
  freeShippingThreshold: number; // kobo, 0 disables
  pickupAddress: string;
  announcement: string;
  announcementActive: boolean;
  contactEmail: string;
  contactPhone: string;
  lowStockAlerts: boolean;
  ordersOpen: boolean;
};

export const DEFAULT_SETTINGS: StoreSettings = {
  shippingFlatRate: 500_000, // ₦5,000
  freeShippingThreshold: 25_000_000, // ₦250,000
  pickupAddress: "No. 20 Alexandra Crescent, Wuse II, Abuja, FCT",
  announcement:
    "Nationwide delivery on petroleum products, building materials and general supplies.",
  announcementActive: true,
  contactEmail: "sales@sueztrading.com",
  contactPhone: "+234 800 000 0000",
  lowStockAlerts: true,
  ordersOpen: true,
};

/** Shipping is a flat rate that falls away above the free-shipping threshold. */
export function calculateShipping(
  subtotal: number,
  settings: StoreSettings,
  method: string,
) {
  if (method === "PICKUP") return 0;
  if (settings.freeShippingThreshold > 0 && subtotal >= settings.freeShippingThreshold) {
    return 0;
  }
  return settings.shippingFlatRate;
}
