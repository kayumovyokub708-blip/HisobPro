import Link from "next/link";
import { getExpenses } from "@/actions/expenses";
import { Plus, Receipt } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ExpensesClient } from "@/components/expenses/ExpensesClient";

export const dynamic = "force-dynamic";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const category = params.category || "";

  let data = { expenses: [] as any[], total: 0, page: 1, totalPages: 0, totalAmount: 0 };

  try {
    data = await getExpenses({ page, category: category || undefined });
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Хароҷот</h1>
          <p className="text-sm text-slate-500">
            Ҷамъ: {formatCurrency(data.totalAmount)} · {data.total} сабт
          </p>
        </div>
        <Link href="/expenses/new" className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm shadow-sm">
          <Plus className="w-4 h-4" /> Илова кардани хароҷот
        </Link>
      </div>

      {data.expenses.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <Receipt className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium mb-2">Ҳоло ягон хароҷот нест</h3>
          <Link href="/expenses/new" className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium mt-4">
            <Plus className="w-4 h-4" /> Илова кардан
          </Link>
        </div>
      ) : (
        <ExpensesClient expenses={data.expenses} page={data.page} totalPages={data.totalPages} />
      )}
    </div>
  );
}
