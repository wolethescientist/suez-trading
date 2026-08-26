import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requirePermission("manageProducts");
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <>
      <PageHeader
        title="Add a product"
        description="New lines start as Active unless you save them as a draft."
        back={{ href: "/admin/products", label: "Back to products" }}
      />
      <ProductForm mode="create" categories={categories} />
    </>
  );
}
