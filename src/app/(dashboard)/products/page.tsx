import Link from "next/link";
import { getProducts, getCategories } from "@/actions/products";
import { Plus, Package } from "lucide-react";
import { ProductsTable } from "@/components/products/ProductsTable";
import { ProductSearch } from "@/components/products/ProductSearch";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.q || "";
  const categoryId = params.category || "";
  const page = Number(params.page) || 1;

  let productsData: any = { products: [], total: 0, page: 1, totalPages: 0 };
  let categories: any[] = [];

  try {
    [productsData, categories] = await Promise.all([
      getProducts({ search, categoryId: categoryId || undefined, page }),
      getCategories(),
    ]);
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Маҳсулот</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {productsData.total} маҳсулот
          </p>
        </div>
        <Link
          href="/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Илова кардани маҳсулот
        </Link>
      </div>

      <ProductSearch categories={categories} />

      {productsData.products.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <Package className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
            Ҳоло ягон маҳсулот нест
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Аввалин маҳсулотро илова кунед
          </p>
          <Link
            href="/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Илова кардани маҳсулот
          </Link>
        </div>
      ) : (
        <ProductsTable
          products={productsData.products}
          page={productsData.page}
          totalPages={productsData.totalPages}
        />
      )}
    </div>
  );
}
