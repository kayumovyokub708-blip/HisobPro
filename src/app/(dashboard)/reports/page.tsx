import { getSalesReport, getExpensesReport, getInventoryReport, getCustomersReport } from "@/actions/reports";
import { ReportsClient } from "@/components/reports/ReportsClient";

export const dynamic = "force-dynamic";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const period = params.period || "today";
  const from = params.from;
  const to = params.to;

  let sales: any = null;
  let expenses: any = null;
  let inventory: any = null;
  let customers: any = null;

  try {
    [sales, expenses, inventory, customers] = await Promise.all([
      getSalesReport(period, from, to),
      getExpensesReport(period === "today" ? "month" : period),
      getInventoryReport(),
      getCustomersReport(),
    ]);
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ҳисоботҳо</h1>
        <p className="text-sm text-slate-500">Маълумоти воқеӣ аз база</p>
      </div>
      <ReportsClient period={period} sales={sales} expenses={expenses} inventory={inventory} customers={customers} />
    </div>
  );
}
