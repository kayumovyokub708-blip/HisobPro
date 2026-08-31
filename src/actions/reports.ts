"use server";

import { prisma } from "@/lib/prisma";

function getDateRange(period: string, from?: string, to?: string) {
  const now = new Date();
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  switch (period) {
    case "today":
      return { gte: start, lte: now };
    case "yesterday": {
      const y = new Date(start);
      y.setDate(y.getDate() - 1);
      const yEnd = new Date(y);
      yEnd.setHours(23, 59, 59, 999);
      return { gte: y, lte: yEnd };
    }
    case "week": {
      const w = new Date(start);
      w.setDate(w.getDate() - 7);
      return { gte: w, lte: now };
    }
    case "month": {
      const m = new Date(start);
      m.setDate(1);
      return { gte: m, lte: now };
    }
    case "custom":
      if (from && to) {
        return { gte: new Date(from), lte: new Date(to + "T23:59:59") };
      }
      return { gte: start, lte: now };
    default:
      return { gte: start, lte: now };
  }
}

export async function getSalesReport(period = "today", from?: string, to?: string) {
  const range = getDateRange(period, from, to);

  const [agg, sales, prevAgg] = await Promise.all([
    prisma.sale.aggregate({
      where: { createdAt: range },
      _sum: { total: true, discount: true, subtotal: true },
      _count: true,
      _avg: { total: true },
    }),
    prisma.sale.findMany({
      where: { createdAt: range },
      include: { items: { include: { product: true } }, user: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    (async () => {
      const duration = range.lte.getTime() - range.gte.getTime();
      const prevEnd = new Date(range.gte.getTime() - 1);
      const prevStart = new Date(prevEnd.getTime() - duration);
      return prisma.sale.aggregate({
        where: { createdAt: { gte: prevStart, lte: prevEnd } },
        _sum: { total: true },
        _count: true,
      });
    })(),
  ]);

  let cost = 0;
  for (const sale of sales) {
    for (const item of sale.items) {
      cost += Number(item.quantity) * Number(item.product?.purchasePrice || 0);
    }
  }
  const revenue = Number(agg._sum.total || 0);
  const profit = revenue - cost;

  const prevRevenue = Number(prevAgg._sum.total || 0);
  const changePercent = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;

  const productMap = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const sale of sales) {
    for (const item of sale.items) {
      const id = item.productId;
      const cur = productMap.get(id) || { name: item.product?.name || "—", qty: 0, revenue: 0 };
      cur.qty += Number(item.quantity);
      cur.revenue += Number(item.total);
      productMap.set(id, cur);
    }
  }
  const topProducts = Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  const chartStart = new Date();
  chartStart.setDate(chartStart.getDate() - 13);
  chartStart.setHours(0, 0, 0, 0);

  const chartSales = await prisma.sale.findMany({
    where: { createdAt: { gte: chartStart } },
    select: { createdAt: true, total: true },
  });

  const dailyMap = new Map<string, number>();
  for (let i = 0; i < 14; i++) {
    const d = new Date(chartStart);
    d.setDate(d.getDate() + i);
    dailyMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const s of chartSales) {
    const key = new Date(s.createdAt).toISOString().slice(0, 10);
    dailyMap.set(key, (dailyMap.get(key) || 0) + Number(s.total));
  }
  const chartData = Array.from(dailyMap.entries()).map(([date, total]) => ({ date, total }));

  return {
    revenue,
    profit,
    cost,
    salesCount: agg._count,
    avgCheck: Number(agg._avg.total || 0),
    discount: Number(agg._sum.discount || 0),
    changePercent,
    topProducts,
    chartData,
    recentSales: sales.slice(0, 15),
  };
}

export async function getExpensesReport(period = "month") {
  const range = getDateRange(period);
  const expenses = await prisma.expense.findMany({
    where: { date: range },
    orderBy: { date: "desc" },
  });
  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const byCategory = new Map<string, number>();
  for (const e of expenses) {
    byCategory.set(e.category, (byCategory.get(e.category) || 0) + Number(e.amount));
  }
  const categories = Array.from(byCategory.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);
  return { total, categories, count: expenses.length };
}

export async function getInventoryReport() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { quantity: "asc" },
  });
  let totalValue = 0, lowStock = 0, outOfStock = 0;
  for (const p of products) {
    totalValue += Number(p.quantity) * Number(p.purchasePrice);
    if (Number(p.quantity) <= 0) outOfStock++;
    else if (Number(p.quantity) <= Number(p.minStock) && Number(p.minStock) > 0) lowStock++;
  }
  return {
    totalValue,
    productCount: products.length,
    lowStock,
    outOfStock,
    lowStockProducts: products
      .filter((p) => Number(p.quantity) <= Number(p.minStock) && Number(p.minStock) > 0)
      .slice(0, 15),
  };
}

export async function getCustomersReport() {
  const customers = await prisma.customer.findMany({
    orderBy: { totalPurchases: "desc" },
    take: 20,
  });
  const debtors = await prisma.customer.findMany({
    where: { debt: { gt: 0 } },
    orderBy: { debt: "desc" },
    take: 20,
  });
  const totalDebt = debtors.reduce((s, c) => s + Number(c.debt), 0);
  return { topCustomers: customers, debtors, totalDebt, debtorCount: debtors.length };
}
