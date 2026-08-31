import { getProduct } from "@/actions/products";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, AlertTriangle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const unitLabels: Record<string, string> = {
  PIECE: "дона",
  KG: "кг",
  GRAM: "грамм",
  LITER: "литр",
  METER: "метр",
  BOX: "қуттӣ",
};

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let product;

  try {
    product = await getProduct(id);
  } catch {
    notFound();
  }

  if (!product) notFound();

  const isLow =
    Number(product.quantity) <= Number(product.minStock) &&
    Number(product.minStock) > 0;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">{product.name}</h1>
        </div>
        <Link
          href={`/products/${id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium"
        >
          <Edit className="w-4 h-4" />
          Таҳрир кардан
        </Link>
      </div>

      {isLow && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl px-4 py-3 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Маҳсулоти камшуда — танҳо {Number(product.quantity)}{" "}
          {unitLabels[product.unit] || product.unit} мондааст (ҳадди минималӣ:{" "}
          {Number(product.minStock)})
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-slate-500">SKU</dt>
            <dd className="font-medium mt-0.5">{product.sku || "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Barcode</dt>
            <dd className="font-medium mt-0.5">{product.barcode || "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Бренд</dt>
            <dd className="font-medium mt-0.5">{product.brand || "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Категория</dt>
            <dd className="font-medium mt-0.5">
              {product.category?.name || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Нархи харид</dt>
            <dd className="font-medium mt-0.5">
              {formatCurrency(Number(product.purchasePrice))}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Нархи фурӯш</dt>
            <dd className="font-medium mt-0.5 text-blue-600">
              {formatCurrency(Number(product.sellingPrice))}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Миқдор</dt>
            <dd className="font-medium mt-0.5">
              {Number(product.quantity)}{" "}
              {unitLabels[product.unit] || product.unit}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Ҳадди минималӣ</dt>
            <dd className="font-medium mt-0.5">
              {Number(product.minStock)}{" "}
              {unitLabels[product.unit] || product.unit}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Таъминкунанда</dt>
            <dd className="font-medium mt-0.5">
              {product.supplier?.name || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Санаи илова</dt>
            <dd className="font-medium mt-0.5">
              {formatDate(product.createdAt)}
            </dd>
          </div>
          {product.description && (
            <div className="sm:col-span-2">
              <dt className="text-slate-500">Тавсиф</dt>
              <dd className="font-medium mt-0.5">{product.description}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
