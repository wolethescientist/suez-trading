import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Your cart" };
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const settings = await getSettings();
  return (
    <section className="container-page py-12 lg:py-16">
      <p className="eyebrow text-cargo">Basket</p>
      <h1 className="mt-4 text-3xl font-extrabold text-ink sm:text-[2.5rem]">Your cart</h1>
      <CartView
        shippingFlatRate={settings.shippingFlatRate}
        freeShippingThreshold={settings.freeShippingThreshold}
      />
    </section>
  );
}
