import { CartProvider } from "@/components/cart/cart-provider";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { getSettings } from "@/lib/settings";

// The announcement bar is editable in the admin and appears on every page, so
// settings are read per request rather than frozen at build time.
export const dynamic = "force-dynamic";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <CartProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-100 focus:rounded-sm focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>
      <div className="flex min-h-screen flex-col">
        <Header
          announcement={settings.announcementActive ? settings.announcement : null}
        />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
      <CartDrawer />
    </CartProvider>
  );
}
