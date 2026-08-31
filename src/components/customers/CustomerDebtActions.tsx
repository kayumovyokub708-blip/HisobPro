"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addCustomerDebt, addCustomerPayment } from "@/actions/customers";

export function CustomerDebtActions({ customerId }: { customerId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<"debt" | "pay" | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  function submit() {
    const val = Number(amount);
    if (!val || val <= 0) {
      setError("Маблағро дуруст ворид кунед");
      return;
    }
    setError("");
    startTransition(async () => {
      try {
        if (mode === "debt") {
          await addCustomerDebt(customerId, val, note || undefined);
        } else {
          await addCustomerPayment(customerId, val, "CASH", note || undefined);
        }
        setMode(null);
        setAmount("");
        setNote("");
        router.refresh();
      } catch (e: any) {
        setError(e.message || "Хатогӣ");
      }
    });
  }

  if (!mode) {
    return (
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setMode("debt")}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium"
        >
          + Қарз сабт кардан
        </button>
        <button
          onClick={() => setMode("pay")}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium"
        >
          + Пардохт сабт кардан
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3 max-w-sm">
      <h3 className="font-semibold text-sm">
        {mode === "debt" ? "Қарз сабт кардан" : "Пардохти қарз"}
      </h3>
      {error && (
        <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}
      <input
        type="number"
        min="0"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Маблағ (сомонӣ)"
        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        autoFocus
      />
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Эзоҳ (ихтиёрӣ)"
        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={isPending}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium disabled:opacity-50"
        >
          {isPending ? "..." : "Сабт кардан"}
        </button>
        <button
          onClick={() => {
            setMode(null);
            setError("");
          }}
          className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-sm"
        >
          Бекор
        </button>
      </div>
    </div>
  );
}
