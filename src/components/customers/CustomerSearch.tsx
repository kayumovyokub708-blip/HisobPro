"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search } from "lucide-react";

export function CustomerSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    startTransition(() => router.push(`/customers?${params.toString()}`));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4"
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ҷустуҷӯи ном ё телефон..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="px-5 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-sm font-medium disabled:opacity-50"
      >
        {isPending ? "..." : "Ҷустуҷӯ"}
      </button>
    </form>
  );
}
