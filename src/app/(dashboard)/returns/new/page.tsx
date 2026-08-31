"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { findSaleByReceipt, createReturn } from "@/actions/returns";
import { formatCurrency } from "@/lib/utils";

type ReturnLine = {
  productId: string;
  name: string;
  maxQty: number;
  price: number;
  quantity: number;
  selected: boolean;
};

export default function NewReturnPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [receipt, setReceipt] = useState("");
  const [error, setError] = useState("");
  const [sale, setSale] = useState<any>(null);
  const [lines, setLines] = useState<ReturnLine[]>([]);
  const [reason, setReason] = useState("");
  const [searching, setSearching] = useState(false);

  async function searchSale(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSale(null);
    setLines([]);
    if (!receipt.trim()) {
      setError("Рақами чекро ворид кунед");
      return;
    }
    setSearching(true);
    try {
      const found = await findSaleByReceipt(receipt.trim());
      if (!found) {
        setError("Чек ёфт нашуд");
        return;
      }

      const returnedQty: Record<string, number> = {};
      for (const r of found.returns || []) {
        for (const ri of r.items) {
          returnedQty[ri.productId] =
            (returnedQty[ri.productId] || 0) + Number(ri.quantity);
        }
      }

      const nextLines: ReturnLine[] = found.items.map((item: any) => {
        const sold = Number(item.quantity);
        const already = returnedQty[item.productId] || 0;
        const max = Math.max(0, sold - already);
        return {
          productId: item.productId,
          name: item.product?.name || "—",
          maxQty: max,
          price: Number(item.price),
          quantity: max > 0 ? max : 0,
          selected: max > 0,
        };
      });

      setSale(found);
      setLines(nextLines);
      if (nextLines.every((l) => l.maxQty <= 0)) {
        setError("Ҳамаи маҳсулоти ин чек аллакай баргардонида шудаанд");
      }
    } catch (err: any) {
      setError(err.message || "Хатогӣ");
    } finally {
      setSearching(false);
    }
  }

  function updateLine(idx: number, patch: Partial<ReturnLine>) {
    setLines((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, ...patch } : l))
    );
  }

  const selected = lines.filter((l) => l.selected && l.quantity > 0);
  const totalRefund = selected.reduce(
    (s, l) => s + l.quantity * l.price,
    0
  );

  function handleSubmit() {
    if (!sale || selected.length === 0) {
      setError("Ҳадди ақал як маҳсулот интихоб кунед");
      return;
    }
    setError("");
    startTransition(async () => {
      try {
        await createReturn({
          saleId: sale.id,
          reason: reason || null,
          items: selected.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
            price: l.price,
          })),
        });
        router.push("/returns");
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Хатогӣ");
      }
    });
  }

  const inputCls =
    "w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none";

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link
          href="/returns"
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Баргардонидани нав</h1>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <form onSubmit={searchSale} className="bg-white dark:bg-slate-800 rounded-2xl border p-5 space-y-3">
        <label className="block text-sm font-medium">Рақами чек</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={receipt}
              onChange={(e) => setReceipt(e.target.value)}
              placeholder="HP-20260831-1234"
              className={`pl-10 ${inputCls}`}
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-5 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-sm font-medium disabled:opacity-50"
          >
            {searching ? "..." : "Ҷустуҷӯ"}
          </button>
        </div>
      </form>

      {sale && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border p-5 space-y-4">
          <div className="flex flex-wrap justify-between gap-2 text-sm">
            <div>
              <span className="text-slate-500">Чек: </span>
              <span className="font-medium">{sale.receiptNumber}</span>
            </div>
            <div>
              <span className="text-slate-500">Ҳамагӣ: </span>
              <span className="font-medium">
                {formatCurrency(Number(sale.total))}
              </span>
            </div>
            {sale.customer && (
              <div>
                <span className="text-slate-500">Мизоҷ: </span>
                <span className="font-medium">{sale.customer.name}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {lines.map((l, idx) => (
              <div
                key={l.productId}
                className={`flex flex-wrap items-center gap-3 p-3 rounded-xl border ${
                  l.maxQty <= 0
                    ? "opacity-50 border-slate-200 dark:border-slate-700"
                    : "border-slate-200 dark:border-slate-600"
                }`}
              >
                <input
                  type="checkbox"
                  checked={l.selected && l.maxQty > 0}
                  disabled={l.maxQty <= 0}
                  onChange={(e) =>
                    updateLine(idx, { selected: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{l.name}</div>
                  <div className="text-xs text-slate-500">
                    Макс: {l.maxQty} · {formatCurrency(l.price)}
                  </div>
                </div>
                <input
                  type="number"
                  min="0.001"
                  step="0.001"
                  max={l.maxQty}
                  disabled={!l.selected || l.maxQty <= 0}
                  value={l.quantity || ""}
                  onChange={(e) => {
                    const v = Math.min(
                      l.maxQty,
                      Math.max(0, Number(e.target.value) || 0)
                    );
                    updateLine(idx, { quantity: v });
                  }}
                  className="w-24 px-2 py-1.5 rounded-lg border text-sm text-right disabled:opacity-50"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Сабаб</label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Масалан: нуқсон, андоза..."
              className={inputCls}
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="text-lg font-bold">
              Бозгашт:{" "}
              <span className="text-amber-600">
                {formatCurrency(totalRefund)}
              </span>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || selected.length === 0}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium"
            >
              {isPending ? "Сабт..." : "Тасдиқ кардан"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
