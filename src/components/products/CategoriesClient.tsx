"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { createCategory, deleteCategory } from "@/actions/products";

export function CategoriesClient({
  categories: initial,
}: {
  categories: any[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError("");
    startTransition(async () => {
      try {
        await createCategory(name.trim());
        setName("");
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Хатогӣ");
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Нест кардани категория?")) return;
    startTransition(async () => {
      try {
        await deleteCategory(id);
        router.refresh();
      } catch (err: any) {
        alert(err.message || "Хатогӣ");
      }
    });
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleAdd}
        className="flex gap-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Номи категорияи нав"
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          type="submit"
          disabled={isPending || !name.trim()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Илова
        </button>
      </form>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-xl">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {initial.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Ҳоло ягон категория нест
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {initial.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-slate-500">
                    {c._count?.products || 0} маҳсулот
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(c.id)}
                  disabled={isPending}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
