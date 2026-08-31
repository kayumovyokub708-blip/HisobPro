"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createCustomer, updateCustomer } from "@/actions/customers";

export function CustomerForm({ customer }: { customer?: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const isEdit = !!customer;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      phone: (fd.get("phone") as string) || null,
      address: (fd.get("address") as string) || null,
      notes: (fd.get("notes") as string) || null,
    };

    startTransition(async () => {
      try {
        if (isEdit) await updateCustomer(customer.id, data);
        else await createCustomer(data);
        router.push("/customers");
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Хатогӣ рӯй дод");
      }
    });
  }

  const inputCls =
    "w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Ном *</label>
          <input name="name" required defaultValue={customer?.name || ""} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Телефон</label>
          <input name="phone" defaultValue={customer?.phone || ""} className={inputCls} placeholder="+992 ..." />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Суроға</label>
          <input name="address" defaultValue={customer?.address || ""} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Эзоҳ</label>
          <textarea name="notes" rows={3} defaultValue={customer?.notes || ""} className={`${inputCls} resize-none`} />
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-medium text-sm"
        >
          {isPending ? "Сабт..." : isEdit ? "Сабт кардан" : "Илова кардан"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm"
        >
          Бекор кардан
        </button>
      </div>
    </form>
  );
}
