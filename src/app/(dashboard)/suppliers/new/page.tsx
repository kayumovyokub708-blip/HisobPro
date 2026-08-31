"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createSupplier } from "@/actions/suppliers";

export default function NewSupplierPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createSupplier({
          name: fd.get("name") as string,
          contactPerson: (fd.get("contactPerson") as string) || null,
          phone: (fd.get("phone") as string) || null,
          address: (fd.get("address") as string) || null,
          notes: (fd.get("notes") as string) || null,
        });
        router.push("/suppliers");
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Хатогӣ");
      }
    });
  }

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none";

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-3">
        <Link href="/suppliers" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold">Таъминкунандаи нав</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border p-6 space-y-4">
          <div><label className="block text-sm font-medium mb-1.5">Номи ширкат/шахс *</label><input name="name" required className={inputCls} /></div>
          <div><label className="block text-sm font-medium mb-1.5">Шахси масъул</label><input name="contactPerson" className={inputCls} /></div>
          <div><label className="block text-sm font-medium mb-1.5">Телефон</label><input name="phone" className={inputCls} /></div>
          <div><label className="block text-sm font-medium mb-1.5">Суроға</label><input name="address" className={inputCls} /></div>
          <div><label className="block text-sm font-medium mb-1.5">Эзоҳ</label><textarea name="notes" rows={2} className={`${inputCls} resize-none`} /></div>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={isPending} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium disabled:opacity-50">{isPending ? "Сабт..." : "Сабт кардан"}</button>
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 border rounded-xl text-sm">Бекор</button>
        </div>
      </form>
    </div>
  );
}
