import { getInventoryStats, getInventoryMovements, getLowStockProducts } from "@/actions/inventory";
import { formatCurrency } from "@/lib/utils";
import { Package, AlertTriangle, Archive, DollarSign } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const unitLabels: Record<string, string> = {
  PIECE: "дона", KG: "кг", GRAM: "г", LITER: "л", METER: "м", BOX: "қуттӣ",
};

const opLabels: Record<string, string> = {
  SALE: "Фурӯш", RECEIVE: "Қабули мол", RETURN: "Баргардонидан",
  ADJUSTMENT: "Ислоҳ", DESTROYED: "Нобудшуда",
};

export default async function InventoryPage() {
  let stats = { productCount: 0, totalValue: 0, lowStock: 0, outOfStock: 0, products: [] as any[] };
  let movements: any = { movements: [], total: 0 };
  let lowStockList: any[] = [];

  try {
    [stats, movements, lowStockList] = await Promise.all([
      getInventoryStats(),
      getInventoryMovements({ limit: 20 }),
      getLowStockProducts(),
    ]);
  } catch (e) {
    console.error(e);
  }

  const cards = [
    { title: "Миқдори маҳсулот", value: String(stats.productCount), icon: Package, color: "bg-violet-500" },
    { title: "Арзиши умумии анбор", value: formatCurrency(stats.totalValue), icon: DollarSign, color: "bg-blue-500" },
    { title: "Маҳсулоти камшуда", value: String(stats.lowStock), icon: AlertTriangle, color: "bg-amber-500" },
    { title: "Маҳсулоти тамомшуда", value: String(stats.outOfStock), icon: Archive, color: "bg-rose-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Анбор</h1>
        <p className="text-sm text-slate-500">Ҳолат ва ҳаракати мол</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{c.title}</p>
                  <p className="text-xl font-bold mt-1">{c.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${c.color} text-white flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {lowStockList.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5">
          <h2 className="font-semibold text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Маҳсулоти камшуда
          </h2>
          <ul className="space-y-2">
            {lowStockList.map((p) => (
              <li key={p.id} className="flex justify-between text-sm">
                <Link href={`/products/${p.id}`} className="text-amber-800 dark:text-amber-200 hover:underline">{p.name}</Link>
                <span>{Number(p.quantity)} {unitLabels[p.unit] || p.unit} (мин: {Number(p.minStock)})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-semibold">Таърихи ҳаракат</h2>
        </div>
        {movements.movements.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">Ҳоло ягон ҳаракат нест</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Сана</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Маҳсулот</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Амалиёт</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-500">Миқдор</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-500 hidden sm:table-cell">Пеш → Нав</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 hidden md:table-cell">Корбар</th>
                </tr>
              </thead>
              <tbody>
                {movements.movements.map((m: any) => (
                  <tr key={m.id} className="border-b border-slate-100 dark:border-slate-700/50">
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(m.createdAt).toLocaleString("tg-TJ", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-3 font-medium">{m.product?.name}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700">{opLabels[m.operation] || m.operation}</span>
                    </td>
                    <td className="px-4 py-3 text-right">{Number(m.quantity)}</td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell text-slate-500">{Number(m.previousStock)} → {Number(m.newStock)}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-500">{m.user?.name || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
