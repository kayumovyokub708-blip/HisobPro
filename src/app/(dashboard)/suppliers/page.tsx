import Link from "next/link";
import { getSuppliers } from "@/actions/suppliers";
import { Plus, Truck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  let suppliers: any[] = [];
  try { suppliers = await getSuppliers(); } catch {}

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Таъминкунандагон</h1>
          <p className="text-sm text-slate-500">{suppliers.length} таъминкунанда</p>
        </div>
        <Link href="/suppliers/new" className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm">
          <Plus className="w-4 h-4" /> Илова кардан
        </Link>
      </div>

      {suppliers.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border p-12 text-center">
          <Truck className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 mb-4">Ҳоло ягон таъминкунанда нест</p>
          <Link href="/suppliers/new" className="text-blue-600 text-sm font-medium">+ Илова кардан</Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 dark:bg-slate-900/50">
                <th className="text-left px-4 py-3 font-medium text-slate-500">Ном</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 hidden sm:table-cell">Телефон</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500">Қарз</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500 hidden md:table-cell">Харидҳо</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-3">
                    <Link href={`/suppliers/${s.id}`} className="font-medium hover:text-blue-600">{s.name}</Link>
                    {s.contactPerson && <div className="text-xs text-slate-400">{s.contactPerson}</div>}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-slate-500">{s.phone || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={Number(s.debt) > 0 ? "text-rose-600 font-medium" : "text-slate-500"}>{formatCurrency(Number(s.debt))}</span>
                  </td>
                  <td className="px-4 py-3 text-right hidden md:table-cell text-slate-500">{s._count?.purchases || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
