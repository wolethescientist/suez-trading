import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Sidebar } from "@/components/admin/sidebar";
import { lowStockProducts } from "@/lib/inventory";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  const [pendingOrders, newEnquiries, lowStock] = await Promise.all([
    prisma.order.count({ where: { paymentStatus: "PAID", status: "PROCESSING" } }),
    prisma.enquiry.count({ where: { status: "NEW" } }),
    lowStockProducts(200),
  ]);

  return (
    <div className="min-h-screen bg-bone">
      <Sidebar
        user={user}
        counts={{
          pendingOrders,
          newEnquiries,
          lowStock: lowStock.length,
        }}
      />
      <div className="lg:pl-64">
        <main className="px-5 py-8 pt-20 sm:px-8 lg:pt-10">{children}</main>
      </div>
    </div>
  );
}
