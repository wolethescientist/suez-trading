"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  sku: string;
  /** kobo, snapshotted at add-to-cart time and re-verified server side. */
  price: number;
  unit: string;
  image: string;
  quantity: number;
  maxStock: number;
  minOrderQty: number;
};

type CartState = {
  items: CartItem[];
  /** False until the browser store has been read, so an empty cart and a
   *  not-yet-hydrated cart can be told apart. */
  ready: boolean;
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const CartContext = createContext<CartState | null>(null);
const STORAGE_KEY = "suez.cart.v1";
const EMPTY: CartItem[] = [];

/* -------------------------------------------------------------------------
 * localStorage is the single source of truth for the cart rather than React
 * state mirrored into storage. That keeps the basket alive across reloads
 * without a hydration effect, and — because we also listen for `storage`
 * events — a product added in one tab appears in every other open tab.
 * ---------------------------------------------------------------------- */

const listeners = new Set<() => void>();

// getSnapshot must return a stable reference while nothing has changed, or
// useSyncExternalStore re-renders forever. Cache the parse against the raw
// string it came from.
let cache: { raw: string | null; parsed: CartItem[] } = { raw: null, parsed: EMPTY };

function readCart(): CartItem[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Private browsing can refuse reads; treat it as an empty cart.
    return EMPTY;
  }

  if (raw === cache.raw) return cache.parsed;

  let parsed: CartItem[] = EMPTY;
  try {
    const value = raw ? JSON.parse(raw) : [];
    parsed = Array.isArray(value) ? value.filter(isCartItem) : EMPTY;
  } catch {
    parsed = EMPTY;
  }

  cache = { raw, parsed };
  return parsed;
}

function serverCart(): CartItem[] {
  return EMPTY;
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function writeCart(next: CartItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage may be full or blocked. Fall through so the in-memory cache
    // still updates and the UI stays responsive for this page view.
  }
  cache = { raw: JSON.stringify(next), parsed: next };
  // `storage` only fires in *other* tabs, so notify this one directly.
  for (const listener of listeners) listener();
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, readCart, serverCart);
  const ready = useSyncExternalStore(subscribeNever, isHydrated, isNotHydrated);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const add: CartState["add"] = useCallback((item, quantity = 1) => {
    const current = readCart();
    const existing = current.find((i) => i.productId === item.productId);
    const step = Math.max(quantity, 1);

    writeCart(
      existing
        ? current.map((i) =>
            i.productId === item.productId
              ? { ...i, ...item, quantity: clampQty(i.quantity + step, item) }
              : i,
          )
        : [
            ...current,
            { ...item, quantity: clampQty(Math.max(step, item.minOrderQty), item) },
          ],
    );
    setDrawerOpen(true);
  }, []);

  const setQuantity: CartState["setQuantity"] = useCallback((productId, quantity) => {
    writeCart(
      readCart().flatMap((i) => {
        if (i.productId !== productId) return [i];
        // Dropping below the minimum removes the line rather than stranding it.
        if (quantity < i.minOrderQty) return [];
        return [{ ...i, quantity: clampQty(quantity, i) }];
      }),
    );
  }, []);

  const remove: CartState["remove"] = useCallback((productId) => {
    writeCart(readCart().filter((i) => i.productId !== productId));
  }, []);

  const clear = useCallback(() => writeCart([]), []);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const value = useMemo<CartState>(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return {
      items,
      ready,
      count,
      subtotal,
      add,
      setQuantity,
      remove,
      clear,
      drawerOpen,
      openDrawer,
      closeDrawer,
    };
  }, [
    items,
    ready,
    drawerOpen,
    add,
    setQuantity,
    remove,
    clear,
    openDrawer,
    closeDrawer,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>.");
  return ctx;
}

/* The standard "have we hydrated yet" idiom: the server snapshot is false and
 * the client snapshot is true, so the value flips exactly once on hydration
 * without needing an effect. */
const subscribeNever = () => () => {};
const isHydrated = () => true;
const isNotHydrated = () => false;

function clampQty(qty: number, item: { maxStock: number; minOrderQty: number }) {
  const ceiling = item.maxStock > 0 ? item.maxStock : Number.MAX_SAFE_INTEGER;
  return Math.max(item.minOrderQty, Math.min(qty, ceiling));
}

function isCartItem(value: unknown): value is CartItem {
  const v = value as CartItem;
  return (
    !!v &&
    typeof v.productId === "string" &&
    typeof v.price === "number" &&
    typeof v.quantity === "number" &&
    v.quantity > 0
  );
}
