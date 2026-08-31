"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Edit, Trash2, Eye, AlertTriangle } from "lucide-react";
import { deleteProduct } from "@/actions/products";
import { formatCurrency } from "@/lib/utils";

const unitLabels: Record<string, string> = {
  PIECE: "дона",
  KG: "кг",
  GRAM: "грамм",
  LITER: "литр",
  METER: "метр",
  BOX: "қуттӣ",
};

export function ProductsTable({
  products,
  page,
  totalPages,
}: {
  products: any[];
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    startTransition(async () => {
      try {
        await deleteProduct(id);
        setConfirmId(null);
        router.refresh();
      } catch (e: any) {
        alert(e.message || "Хатогӣ рӯй дод");
      } finally {
        setDeletingId(null);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Ном</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400 hidden md:table-cell">Категория</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Нархи фурӯш</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Миқдор</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-400 hidden sm:table-cell">Нархи харид</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Амалҳо</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const isLow = Number(p.quantity) <= Number(p.minStock) && Number(p.minStock) > 0;
                return (
                  <tr key={p.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 dark:text-white">{p.name}</div>
                      <div className="text-xs text-slate-500">{p.barcode || p.sku || "—"}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-600 dark:text-slate-400">{p.category?.name || "—"}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(Number(p.sellingPrice))}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={isLow ? "text-rose-600 dark:text-rose-400 font-medium inline-flex items-center gap-1" : ""}>
                        {isLow && <AlertTriangle className="w-3.5 h-3.5" />}
                        {Number(p.quantity)} {unitLabels[p.unit] || p.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell text-slate-500">{formatCurrency(Number(p.purchasePrice))}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/products/${p.id}`} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-blue-600" title="Дидан"><Eye className="w-4 h-4" /></Link>
                        <Link href={`/products/${p.id}/edit`} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-blue-600" title="Таҳрир"><Edit className="w-4 h-4" /></Link>
                        <button onClick={() => setConfirmId(p.id)} className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-500 hover:text-rose-600" title="Нест кардан"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link key={p} href={`/products?page=${p}`} className={`px-3 py-1.5 rounded-lg text-sm ${p === page ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"}`}>{p}</Link>
          ))}
        </div>
      )}

      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold mb-2">Нест кардан?</h3>
            <p className="text-sm text-slate-500 mb-6">Шумо мутмаин ҳастед, ки ин маҳсулотро нест кардан мехоҳед? Ин амал бебозгашт аст.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmId(null)} className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">Бекор кардан</button>
              <button onClick={() => handleDelete(confirmId)} disabled={isPending || deletingId === confirmId} className="px-4 py-2 rounded-xl text-sm font-medium bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50">{deletingId === confirmId ? "..." : "Нест кардан"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
