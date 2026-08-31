import Link from "next/link";
import { getPurchases } from "@/actions/purchases";
import { Plus, PackagePlus } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PurchasesPage() {
  let data = { purchases: [] as any[], total: 0 };
  try { data = await getPurchases(); } catch {}

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Қабули мол</h1>
          <p className="text-sm text-slate-500">{data.total} сабт</p>
        </div>
        <Link href="/purchases/new" className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm">
          <Plus className="w-4 h-4" /> Қабули нави мол
        </Link>
      </div>

      {data.purchases.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border p-12 text-center">
          <PackagePlus className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 mb-4">Ҳоло ягон қабули мол нест</p>
          <Link href="/purchases/new" className="text-blue-600 text-sm font-medium">+ Қабули нав</Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 dark:bg-slate-900/50">
                <th className="text-left px-4 py-3 font-medium text-slate-500">Сана</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Таъминкунанда</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500">Маҳсулот</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500">Ҳамагӣ</th>
              </tr>
            </thead>
            <tbody>
              {data.purchases.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 dark:border-slate-700/50">
                  <td className="px-4 py-3 text-slate-500">{formatDate(p.createdAt)}</td>
                  <td className="px-4 py-3 font-medium">{p.supplier?.name}</td>
                  <td className="px-4 py-3 text-right text-slate-500">{p.items.length}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(Number(p.total))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
