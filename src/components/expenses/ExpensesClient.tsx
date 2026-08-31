"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteExpense } from "@/actions/expenses";
import { formatCurrency, formatDate } from "@/lib/utils";

const methodLabels: Record<string, string> = {
  CASH: "Нақд", CARD: "Корт", QR: "QR", MIXED: "Омехта",
};

export function ExpensesClient({
  expenses, page, totalPages,
}: {
  expenses: any[]; page: number; totalPages: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteExpense(id);
        setConfirmId(null);
        router.refresh();
      } catch (e: any) {
        alert(e.message || "Хатогӣ");
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
                <th className="text-left px-4 py-3 font-medium text-slate-500">Сана</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Категория</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 hidden md:table-cell">Тавсиф</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500">Маблағ</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 hidden sm:table-cell">Пардохт</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500">Амал</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className="border-b border-slate-100 dark:border-slate-700/50">
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDate(e.date)}</td>
                  <td className="px-4 py-3 font-medium">{e.category}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-slate-500 truncate max-w-[200px]">{e.description || "—"}</td>
                  <td className="px-4 py-3 text-right font-medium text-rose-600">{formatCurrency(Number(e.amount))}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-slate-500">{methodLabels[e.paymentMethod] || e.paymentMethod}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setConfirmId(e.id)} className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link key={p} href={`/expenses?page=${p}`} className={`px-3 py-1.5 rounded-lg text-sm ${p === page ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-800 border"}`}>
              {p}
            </Link>
          ))}
        </div>
      )}

      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-semibold mb-2">Нест кардан?</h3>
            <p className="text-sm text-slate-500 mb-6">Ин хароҷотро нест мекунед?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmId(null)} className="px-4 py-2 rounded-xl text-sm border">Бекор</button>
              <button onClick={() => handleDelete(confirmId)} disabled={isPending} className="px-4 py-2 rounded-xl text-sm bg-rose-600 text-white disabled:opacity-50">Нест кардан</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
