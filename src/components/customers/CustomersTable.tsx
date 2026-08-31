"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Eye, Trash2 } from "lucide-react";
import { deleteCustomer } from "@/actions/customers";
import { formatCurrency } from "@/lib/utils";

export function CustomersTable({
  customers,
  page,
  totalPages,
}: {
  customers: any[];
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteCustomer(id);
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
                <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Ном</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400 hidden sm:table-cell">Телефон</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Ҳаҷми харид</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Қарз</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Амалҳо</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-slate-500">{c.phone || "—"}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(Number(c.totalPurchases))}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={Number(c.debt) > 0 ? "text-rose-600 font-medium" : "text-slate-500"}>
                      {formatCurrency(Number(c.debt))}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Link href={`/customers/${c.id}`} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-blue-600">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button onClick={() => setConfirmId(c.id)} className="p-2 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
            <Link key={p} href={`/customers?page=${p}`} className={`px-3 py-1.5 rounded-lg text-sm ${p === page ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"}`}>
              {p}
            </Link>
          ))}
        </div>
      )}

      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Нест кардан?</h3>
            <p className="text-sm text-slate-500 mb-6">Шумо мутмаин ҳастед, ки ин мизоҷро нест кардан мехоҳед?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmId(null)} className="px-4 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-600">Бекор кардан</button>
              <button onClick={() => handleDelete(confirmId)} disabled={isPending} className="px-4 py-2 rounded-xl text-sm bg-rose-600 text-white disabled:opacity-50">Нест кардан</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
