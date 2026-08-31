"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createExpense, EXPENSE_CATEGORIES } from "@/actions/expenses";

export default function NewExpensePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await createExpense({
          category: fd.get("category") as string,
          amount: fd.get("amount") as any,
          description: (fd.get("description") as string) || null,
          paymentMethod: (fd.get("paymentMethod") as any) || "CASH",
          date: (fd.get("date") as string) || undefined,
        });
        router.push("/expenses");
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Хатогӣ рӯй дод");
      }
    });
  }

  const inputCls =
    "w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none";

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-3">
        <Link href="/expenses" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Илова кардани хароҷот</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Категория *</label>
            <select name="category" required className={inputCls} defaultValue="">
              <option value="" disabled>Интихоб кунед</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Маблағ *</label>
            <input name="amount" type="number" step="0.01" min="0.01" required className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Сана</label>
            <input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Усули пардохт</label>
            <select name="paymentMethod" className={inputCls} defaultValue="CASH">
              <option value="CASH">Нақд</option>
              <option value="CARD">Корт</option>
              <option value="QR">QR</option>
              <option value="MIXED">Омехта</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Тавсиф</label>
            <textarea name="description" rows={3} className={`${inputCls} resize-none`} />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={isPending} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-medium text-sm">
            {isPending ? "Сабт..." : "Сабт кардан"}
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm">
            Бекор кардан
          </button>
        </div>
      </form>
    </div>
  );
}
