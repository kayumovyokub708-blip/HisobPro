import { getCategories } from "@/actions/products";
import { CategoriesClient } from "@/components/products/CategoriesClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  let categories: any[] = [];
  try {
    categories = await getCategories();
  } catch {}

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link
          href="/products"
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Категорияҳо</h1>
          <p className="text-sm text-slate-500">{categories.length} категория</p>
        </div>
      </div>
      <CategoriesClient categories={categories} />
    </div>
  );
}
