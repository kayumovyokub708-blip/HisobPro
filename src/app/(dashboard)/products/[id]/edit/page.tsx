import { getProduct, getCategories, getSuppliers } from "@/actions/products";
import { ProductForm } from "@/components/products/ProductForm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let product;
  let categories: any[] = [];
  let suppliers: any[] = [];

  try {
    [product, categories, suppliers] = await Promise.all([
      getProduct(id),
      getCategories(),
      getSuppliers(),
    ]);
  } catch {
    notFound();
  }

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/products/${id}`}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Таҳрири маҳсулот</h1>
      </div>
      <ProductForm
        product={product}
        categories={categories}
        suppliers={suppliers}
      />
    </div>
  );
}
