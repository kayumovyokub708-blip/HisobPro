import { getSupplier } from "@/actions/suppliers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let supplier;
  try { supplier = await getSupplier(id); } catch { notFound(); }
  if (!supplier) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/suppliers" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold">{supplier.name}</h1>
          <p className="text-sm text-slate-500">{supplier.phone || "—"}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border p-5">
          <p className="text-sm text-slate-500">Қарз</p>
          <p className={`text-xl font-bold mt-1 ${Number(supplier.debt) > 0 ? "text-rose-600" : ""}`}>{formatCurrency(Number(supplier.debt))}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border p-5">
          <p className="text-sm text-slate-500">Шумораи харидҳо</p>
          <p className="text-xl font-bold mt-1">{supplier.purchases.length}</p>
        </div>
      </div>
      {supplier.contactPerson && <p className="text-sm text-slate-500">Шахси масъул: {supplier.contactPerson}</p>}
      {supplier.address && <p className="text-sm text-slate-500">Суроға: {supplier.address}</p>}
      {supplier.purchases.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border p-5">
          <h2 className="font-semibold mb-3">Таърихи харидҳо</h2>
          <ul className="space-y-2 text-sm">
            {supplier.purchases.map((p: any) => (
              <li key={p.id} className="flex justify-between">
                <span>{formatDate(p.createdAt)} · {p.items.length} маҳсулот</span>
                <span className="font-medium">{formatCurrency(Number(p.total))}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
