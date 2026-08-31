"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createProduct, updateProduct } from "@/actions/products";

const units = [
  { value: "PIECE", label: "дона" },
  { value: "KG", label: "кг" },
  { value: "GRAM", label: "грамм" },
  { value: "LITER", label: "литр" },
  { value: "METER", label: "метр" },
  { value: "BOX", label: "қуттӣ" },
];

export function ProductForm({
  product,
  categories,
  suppliers,
}: {
  product?: any;
  categories: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const isEdit = !!product;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      sku: (fd.get("sku") as string) || null,
      barcode: (fd.get("barcode") as string) || null,
      brand: (fd.get("brand") as string) || null,
      purchasePrice: fd.get("purchasePrice") as string,
      sellingPrice: fd.get("sellingPrice") as string,
      quantity: fd.get("quantity") as string,
      minStock: fd.get("minStock") as string,
      unit: fd.get("unit") as any,
      categoryId: (fd.get("categoryId") as string) || null,
      supplierId: (fd.get("supplierId") as string) || null,
      description: (fd.get("description") as string) || null,
      expirationDate: (fd.get("expirationDate") as string) || null,
    };

    startTransition(async () => {
      try {
        if (isEdit) await updateProduct(product.id, data as any);
        else await createProduct(data as any);
        router.push("/products");
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Хатогӣ рӯй дод. Лутфан дубора кӯшиш кунед.");
      }
    });
  }

  const inputCls =
    "w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1.5">Номи маҳсулот *</label>
            <input name="name" required defaultValue={product?.name || ""} className={inputCls} placeholder="Масалан: Coca-Cola 0.5L" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">SKU</label>
            <input name="sku" defaultValue={product?.sku || ""} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Barcode</label>
            <input name="barcode" defaultValue={product?.barcode || ""} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Бренд</label>
            <input name="brand" defaultValue={product?.brand || ""} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Категория</label>
            <select name="categoryId" defaultValue={product?.categoryId || ""} className={inputCls}>
              <option value="">Интихоб кунед</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Нархи харид *</label>
            <input name="purchasePrice" type="number" step="0.01" min="0" required defaultValue={product ? Number(product.purchasePrice) : ""} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Нархи фурӯш *</label>
            <input name="sellingPrice" type="number" step="0.01" min="0" required defaultValue={product ? Number(product.sellingPrice) : ""} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Миқдор</label>
            <input name="quantity" type="number" step="0.001" min="0" defaultValue={product ? Number(product.quantity) : 0} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Ҳадди минималӣ</label>
            <input name="minStock" type="number" step="0.001" min="0" defaultValue={product ? Number(product.minStock) : 0} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Воҳиди ченак</label>
            <select name="unit" defaultValue={product?.unit || "PIECE"} className={inputCls}>
              {units.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Таъминкунанда</label>
            <select name="supplierId" defaultValue={product?.supplierId || ""} className={inputCls}>
              <option value="">Интихоб кунед</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Муҳлати истифода</label>
            <input name="expirationDate" type="date" defaultValue={product?.expirationDate ? new Date(product.expirationDate).toISOString().slice(0, 10) : ""} className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1.5">Тавсиф</label>
            <textarea name="description" rows={3} defaultValue={product?.description || ""} className={`${inputCls} resize-none`} />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={isPending} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition-colors">
          {isPending ? "Сабт..." : isEdit ? "Сабт кардан" : "Илова кардан"}
        </button>
        <button type="button" onClick={() => router.back()} className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800">
          Бекор кардан
        </button>
      </div>
    </form>
  );
}
