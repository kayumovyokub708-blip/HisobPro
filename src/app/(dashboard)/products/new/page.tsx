import { getCategories, getSuppliers } from "@/actions/products";
import { ProductForm } from "@/components/products/ProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewProductPage() {
  let categories: any[] = [];
  let suppliers: any[] = [];

  try {
    [categories, suppliers] = await Promise.all([
      getCategories(),
      getSuppliers(),
    ]);
  } catch {}

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/products"
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Илова кардани маҳсулот</h1>
      </div>
      <ProductForm categories={categories} suppliers={suppliers} />
    </div>
  );
}
