import Link from "next/link";
import { getReturns } from "@/actions/returns";
import { Plus, RotateCcw } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReturnsPage() {
  let data = { returns: [] as any[], total: 0 };
  try {
    data = await getReturns();
  } catch {}

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Баргардонидан</h1>
          <p className="text-sm text-slate-500">{data.total} сабт</p>
        </div>
        <Link
          href="/returns/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Баргардонидани нав
        </Link>
      </div>

      {data.returns.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border p-12 text-center">
          <RotateCcw className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 mb-4">Ҳоло ягон баргардонидан нест</p>
          <Link href="/returns/new" className="text-blue-600 text-sm font-medium">
            + Баргардонидани нав
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 dark:bg-slate-900/50">
                <th className="text-left px-4 py-3 font-medium text-slate-500">Сана</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Чек</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 hidden sm:table-cell">Сабаб</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500">Маҳсулот</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500">Бозгашт</th>
              </tr>
            </thead>
            <tbody>
              {data.returns.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 dark:border-slate-700/50">
                  <td className="px-4 py-3 text-slate-500">{formatDate(r.createdAt)}</td>
                  <td className="px-4 py-3 font-medium">{r.sale?.receiptNumber}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-slate-500 truncate max-w-[180px]">
                    {r.reason || "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500">{r.items.length}</td>
                  <td className="px-4 py-3 text-right font-medium text-amber-600">
                    {formatCurrency(Number(r.totalRefund))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
