import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  TrendingUp,
  Package,
  AlertTriangle,
  Users,
  DollarSign,
  ShoppingCart,
  Receipt,
} from "lucide-react";

async function getDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todaySales, todayExpenses, productCount, totalCustomerDebt, lowStock] =
    await Promise.all([
      prisma.sale.aggregate({
        where: { createdAt: { gte: today } },
        _sum: { total: true },
        _count: true,
      }),
      prisma.expense.aggregate({
        where: { date: { gte: today } },
        _sum: { amount: true },
      }),
      prisma.product.count(),
      prisma.customer.aggregate({ _sum: { debt: true } }),
      prisma.product.findMany({
        where: { quantity: { lte: 10 } },
        take: 5,
        orderBy: { quantity: "asc" },
      }),
    ]);

  const salesTotal = Number(todaySales._sum.total || 0);
  const expensesTotal = Number(todayExpenses._sum.amount || 0);
  const profit = salesTotal - expensesTotal;

  return {
    salesTotal,
    salesCount: todaySales._count,
    profit,
    expensesTotal,
    productCount,
    lowStockCount: lowStock.length,
    customerDebt: Number(totalCustomerDebt._sum.debt || 0),
    lowStock,
  };
}

function formatMoney(n: number) {
  return new Intl.NumberFormat("tg-TJ").format(n) + " сомонӣ";
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  let stats;

  try {
    stats = await getDashboardStats();
  } catch {
    stats = {
      salesTotal: 0,
      salesCount: 0,
      profit: 0,
      expensesTotal: 0,
      productCount: 0,
      lowStockCount: 0,
      customerDebt: 0,
      lowStock: [] as any[],
    };
  }

  const cards = [
    {
      title: "Фурӯши имрӯз",
      value: formatMoney(stats.salesTotal),
      sub: `${stats.salesCount} чек`,
      icon: ShoppingCart,
      color: "bg-blue-500",
    },
    {
      title: "Фоидаи имрӯз",
      value: formatMoney(stats.profit),
      sub: stats.profit >= 0 ? "мусбат" : "манфӣ",
      icon: TrendingUp,
      color: "bg-emerald-500",
    },
    {
      title: "Хароҷоти имрӯз",
      value: formatMoney(stats.expensesTotal),
      sub: "имрӯз",
      icon: DollarSign,
      color: "bg-orange-500",
    },
    {
      title: "Миқдори маҳсулот",
      value: String(stats.productCount),
      sub: "намуд",
      icon: Package,
      color: "bg-violet-500",
    },
    {
      title: "Маҳсулоти камшуда",
      value: String(stats.lowStockCount),
      sub: "огоҳӣ",
      icon: AlertTriangle,
      color: "bg-rose-500",
    },
    {
      title: "Қарзи мизоҷон",
      value: formatMoney(stats.customerDebt),
      sub: "умумӣ",
      icon: Users,
      color: "bg-amber-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Панели идоракунӣ</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Хуш омадед, {session?.user?.name} ·{" "}
            {new Date().toLocaleDateString("tg-TJ", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
                </div>
                <div
                  className={`w-11 h-11 rounded-xl ${card.color} text-white flex items-center justify-center`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
        <h2 className="font-semibold mb-4">Амалҳои зуд</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[
            { name: "Фурӯш", href: "/pos", icon: ShoppingCart },
            { name: "Маҳсулот", href: "/products", icon: Package },
            { name: "Қабули мол", href: "/purchases", icon: Receipt },
            { name: "Хароҷот", href: "/expenses", icon: DollarSign },
            { name: "Мизоҷ", href: "/customers", icon: Users },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.name}
                href={action.href}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <Icon className="w-6 h-6 text-blue-600" />
                <span className="text-sm font-medium">{action.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {stats.lowStock.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl p-5">
          <h2 className="font-semibold text-rose-800 dark:text-rose-200 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Маҳсулоти камшуда
          </h2>
          <ul className="space-y-2">
            {stats.lowStock.map((p: any) => (
              <li
                key={p.id}
                className="flex justify-between text-sm text-rose-700 dark:text-rose-300"
              >
                <span>{p.name}</span>
                <span>
                  {Number(p.quantity)} {p.unit === "PIECE" ? "дона" : p.unit}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
