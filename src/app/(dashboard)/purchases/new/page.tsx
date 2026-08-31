"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { createPurchase, getProductsForPurchase } from "@/actions/purchases";
import { getSuppliers } from "@/actions/suppliers";
import { formatCurrency } from "@/lib/utils";

type Line = { productId: string; name: string; quantity: number; purchasePrice: number };

export default function NewPurchasePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [supplierId, setSupplierId] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");

  useEffect(() => {
    Promise.all([getSuppliers(), getProductsForPurchase()]).then(([s, p]) => {
      setSuppliers(s);
      setProducts(p);
    });
  }, []);

  function addLine() {
    if (!selectedProduct) return;
    const p = products.find((x) => x.id === selectedProduct);
    if (!p) return;
    if (lines.some((l) => l.productId === p.id)) return;
    setLines([...lines, { productId: p.id, name: p.name, quantity: 1, purchasePrice: Number(p.purchasePrice) }]);
    setSelectedProduct("");
  }

  function updateLine(idx: number, field: "quantity" | "purchasePrice", val: number) {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, [field]: val } : l)));
  }

  function removeLine(idx: number) {
    setLines((prev) => prev.filter((_, i) => i !== idx));
  }

  const total = lines.reduce((s, l) => s + l.quantity * l.purchasePrice, 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supplierId) { setError("Таъминкунандаро интихоб кунед"); return; }
    if (lines.length === 0) { setError("Ҳадди ақал як маҳсулот илова кунед"); return; }
    setError("");
    startTransition(async () => {
      try {
        await createPurchase({
          supplierId,
          notes: notes || null,
          items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity, purchasePrice: l.purchasePrice })),
        });
        router.push("/purchases");
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Хатогӣ");
      }
    });
  }

  const inputCls = "w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none";

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/purchases" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold">Қабули нави мол</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>}

        <div className="bg-white dark:bg-slate-800 rounded-2xl border p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Таъминкунанда *</label>
            <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} required className={inputCls}>
              <option value="">Интихоб кунед</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Маҳсулот илова кунед</label>
            <div className="flex gap-2">
              <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className={`flex-1 ${inputCls}`}>
                <option value="">Интихоб...</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <button type="button" onClick={addLine} className="px-3 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {lines.length > 0 && (
            <div className="space-y-2">
              {lines.map((l, idx) => (
                <div key={l.productId} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                  <div className="flex-1 min-w-0 text-sm font-medium truncate">{l.name}</div>
                  <input type="number" min="0.001" step="0.001" value={l.quantity} onChange={(e) => updateLine(idx, "quantity", Number(e.target.value))} className="w-20 px-2 py-1 rounded-lg border text-sm text-right" title="Миқдор" />
                  <input type="number" min="0" step="0.01" value={l.purchasePrice} onChange={(e) => updateLine(idx, "purchasePrice", Number(e.target.value))} className="w-24 px-2 py-1 rounded-lg border text-sm text-right" title="Нархи харид" />
                  <button type="button" onClick={() => removeLine(idx)} className="p-1 text-rose-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              <div className="flex justify-between font-bold pt-2">
                <span>Ҳамагӣ</span>
                <span className="text-blue-600">{formatCurrency(total)}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5">Эзоҳ</label>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls} />
          </div>
        </div>

        <button type="submit" disabled={isPending || lines.length === 0} className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-semibold">
          {isPending ? "Сабт..." : "Тасдиқ кардан — анбор зиёд мешавад"}
        </button>
      </form>
    </div>
  );
}
