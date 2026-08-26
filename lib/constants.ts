export const ORDER_STATUS = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
} as const;
export type OrderStatus = keyof typeof ORDER_STATUS;

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
  ABANDONED: "ABANDONED",
  REFUNDED: "REFUNDED",
} as const;
export type PaymentStatus = keyof typeof PAYMENT_STATUS;

export const PRODUCT_STATUS = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  ARCHIVED: "ARCHIVED",
} as const;
export type ProductStatus = keyof typeof PRODUCT_STATUS;

export const STOCK_REASONS = [
  "RESTOCK",
  "ADJUSTMENT",
  "RETURN",
  "DAMAGE",
  "SALE",
  "CANCELLED_ORDER",
] as const;
export type StockReason = (typeof STOCK_REASONS)[number];

export const ROLES = {
  OWNER: "OWNER",
  MANAGER: "MANAGER",
  STAFF: "STAFF",
} as const;
export type Role = keyof typeof ROLES;

/** Who may do what. Staff can run the shop floor; only owners touch people & money settings. */
export const CAN = {
  manageProducts: ["OWNER", "MANAGER", "STAFF"] as Role[],
  deleteProducts: ["OWNER", "MANAGER"] as Role[],
  manageOrders: ["OWNER", "MANAGER", "STAFF"] as Role[],
  refundOrders: ["OWNER", "MANAGER"] as Role[],
  manageStaff: ["OWNER"] as Role[],
  manageSettings: ["OWNER", "MANAGER"] as Role[],
  manageCoupons: ["OWNER", "MANAGER"] as Role[],
};

export function can(role: string | undefined, action: keyof typeof CAN) {
  if (!role) return false;
  return CAN[action].includes(role as Role);
}

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "Federal Capital Territory", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano",
  "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun",
  "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe",
  "Zamfara",
];

export const UNITS = [
  "each", "per litre", "per bag", "per crate", "per carton", "per tonne",
  "per roll", "per length", "per drum", "per pack", "per cylinder", "per set",
];
