"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Package,
  Users,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const periods = [
  { id: "today", label: "Имрӯз" },
  { id: "yesterday", label: "Дирӯз" },
  { id: "week", label: "Ин ҳафта" },
  { id: "month", label: "Ин моҳ" },
];

export function ReportsClient({
  period,
  sales,
  expenses,
  inventory,
  customers,
}: {
  period: string;
  sales: any;
  expenses: any;
  inventory: any;
  customers: any;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setPeriod(p: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", p);
    router.push(`/reports?${params.toString()}`);
  }

  if (!sales) {
    return (
      <div className="text-center text-slate-400 py-12">
        Маълумот бор нашуд. Базаро санҷед.
      </div>
    );
  }

  const cards = [
    {
      title: "Фурӯши умумӣ",
      value: formatCurrency(sales.revenue),
      sub: `${sales.salesCount} чек · ${sales.changePercent >= 0 ? "+" : ""}${sales.changePercent.toFixed(1)}%`,
      icon: ShoppingCart,
      color: "bg-blue-500",
    },
    {
      title: "Фоида (тахминӣ)",
      value: formatCurrency(sales.profit),
      sub: `Арзиш: ${formatCurrency(sales.cost)}`,
      icon: TrendingUp,
      color: "bg-emerald-500",
    },
    {
      title: "Миёнаи як чек",
      value: formatCurrency(sales.avgCheck),
      sub: `Скидка: ${formatCurrency(sales.discount)}`,
      icon: DollarSign,
      color: "bg-violet-500",
    },
    {
      title: "Хароҷот",
      value: formatCurrency(expenses?.total || 0),
      sub: `${expenses?.count || 0} сабт`,
      icon: DollarSign,
      color: "bg-orange-500",
    },
  ];

  const chartData = (sales.chartData || []).map((d: any) => ({
    ...d,
    label: d.date.slice(5),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {periods.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              period === p.id
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
            }`}
          >
            {p.label}
          </button>
        ))}
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
                  <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${c.color} text-white flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
        <h2 className="font-semibold mb-4">Фурӯш дар 14 рӯзи охир</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={50} />
              <Tooltip
                formatter={(v: number) => [formatCurrency(v), "Фурӯш"]}
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
              />
              <Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Package className="w-4 h-4" /> Маҳсулоти бештар фурӯхташуда
          </h2>
          {sales.topProducts?.length === 0 ? (
            <p className="text-sm text-slate-400">Маълумот нест</p>
          ) : (
            <ul className="space-y-2">
              {sales.topProducts.map((p: any, i: number) => (
                <li key={i} className="flex justify-between text-sm">
                  <span className="truncate mr-2">{i + 1}. {p.name}</span>
                  <span className="text-slate-500 whitespace-nowrap">{p.qty} · {formatCurrency(p.revenue)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <h2 className="font-semibold mb-3">Хароҷот аз рӯи категория</h2>
          {!expenses?.categories?.length ? (
            <p className="text-sm text-slate-400">Маълумот нест</p>
          ) : (
            <ul className="space-y-2">
              {expenses.categories.map((c: any) => (
                <li key={c.name} className="flex justify-between text-sm">
                  <span>{c.name}</span>
                  <span className="font-medium text-rose-600">{formatCurrency(c.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Package className="w-4 h-4" /> Анбор
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-slate-500">Арзиши умумӣ</p><p className="font-bold">{formatCurrency(inventory?.totalValue || 0)}</p></div>
            <div><p className="text-slate-500">Намудҳо</p><p className="font-bold">{inventory?.productCount || 0}</p></div>
            <div><p className="text-slate-500">Камшуда</p><p className="font-bold text-amber-600">{inventory?.lowStock || 0}</p></div>
            <div><p className="text-slate-500">Тамомшуда</p><p className="font-bold text-rose-600">{inventory?.outOfStock || 0}</p></div>
          </div>
          {inventory?.lowStockProducts?.length > 0 && (
            <ul className="mt-4 space-y-1 text-sm">
              {inventory.lowStockProducts.slice(0, 5).map((p: any) => (
                <li key={p.id} className="flex justify-between text-amber-700 dark:text-amber-300">
                  <span className="truncate">{p.name}</span>
                  <span>{Number(p.quantity)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" /> Мизоҷон
          </h2>
          <div className="mb-3 text-sm">
            <span className="text-slate-500">Қарзи умумӣ: </span>
            <span className="font-bold text-rose-600">{formatCurrency(customers?.totalDebt || 0)}</span>
            <span className="text-slate-400 text-xs ml-2">({customers?.debtorCount || 0} нафар)</span>
          </div>
          <p className="text-xs text-slate-500 mb-2">Беҳтарин мизоҷон</p>
          <ul className="space-y-1 text-sm">
            {(customers?.topCustomers || []).slice(0, 5).map((c: any) => (
              <li key={c.id} className="flex justify-between">
                <span className="truncate">{c.name}</span>
                <span className="text-slate-500">{formatCurrency(Number(c.totalPurchases))}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {sales.recentSales?.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="font-semibold">Фурӯшҳои охирин</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 dark:bg-slate-900/50">
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Чек</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Вақт</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 hidden sm:table-cell">Кассир</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-500">Ҳамагӣ</th>
                </tr>
              </thead>
              <tbody>
                {sales.recentSales.map((s: any) => (
                  <tr key={s.id} className="border-b border-slate-100 dark:border-slate-700/50">
                    <td className="px-4 py-3 font-medium">{s.receiptNumber}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(s.createdAt).toLocaleString("tg-TJ", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-slate-500">{s.user?.name || "—"}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(Number(s.total))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
