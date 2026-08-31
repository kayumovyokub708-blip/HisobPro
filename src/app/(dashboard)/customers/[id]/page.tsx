import { getCustomer } from "@/actions/customers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CustomerDebtActions } from "@/components/customers/CustomerDebtActions";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let customer;
  try {
    customer = await getCustomer(id);
  } catch {
    notFound();
  }
  if (!customer) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/customers" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{customer.name}</h1>
          <p className="text-sm text-slate-500">{customer.phone || "Бе телефон"}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <p className="text-sm text-slate-500">Ҳаҷми умумии харид</p>
          <p className="text-xl font-bold mt-1">{formatCurrency(Number(customer.totalPurchases))}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <p className="text-sm text-slate-500">Қарзи ҳозира</p>
          <p className={`text-xl font-bold mt-1 ${Number(customer.debt) > 0 ? "text-rose-600" : ""}`}>
            {formatCurrency(Number(customer.debt))}
          </p>
        </div>
      </div>

      {customer.address && <p className="text-sm text-slate-500">Суроға: {customer.address}</p>}
      {customer.notes && <p className="text-sm text-slate-500">Эзоҳ: {customer.notes}</p>}

      <CustomerDebtActions customerId={customer.id} />

      {customer.payments.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <h2 className="font-semibold mb-3">Пардохтҳо</h2>
          <ul className="space-y-2 text-sm">
            {customer.payments.map((p: any) => (
              <li key={p.id} className="flex justify-between">
                <span className="text-slate-500">{formatDate(p.createdAt)}</span>
                <span className="text-emerald-600 font-medium">+{formatCurrency(Number(p.amount))}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {customer.sales.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <h2 className="font-semibold mb-3">Таърихи харид</h2>
          <ul className="space-y-2 text-sm">
            {customer.sales.map((s: any) => (
              <li key={s.id} className="flex justify-between">
                <span>{s.receiptNumber} · {formatDate(s.createdAt)}</span>
                <span className="font-medium">{formatCurrency(Number(s.total))}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
