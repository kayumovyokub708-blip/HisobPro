"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleEmployeeStatus, deleteEmployee } from "@/actions/employees";

export function EmployeesClient({
  employees,
  roleLabels,
}: {
  employees: any[];
  roleLabels: Record<string, string>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  function toggle(id: string) {
    startTransition(async () => {
      try {
        await toggleEmployeeStatus(id);
        router.refresh();
      } catch (e: any) {
        alert(e.message || "Хатогӣ");
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteEmployee(id);
        setConfirmId(null);
        router.refresh();
      } catch (e: any) {
        alert(e.message || "Хатогӣ");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50 dark:bg-slate-900/50">
              <th className="text-left px-4 py-3 font-medium text-slate-500">Ном</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 hidden sm:table-cell">Username</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Нақш</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Ҳолат</th>
              <th className="text-right px-4 py-3 font-medium text-slate-500">Амал</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 dark:border-slate-700/50">
                <td className="px-4 py-3 font-medium">
                  {u.name}
                  {u.phone && <div className="text-xs text-slate-400">{u.phone}</div>}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-slate-500">{u.username}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700">
                    {roleLabels[u.role] || u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggle(u.id)}
                    disabled={isPending}
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      u.status
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {u.status ? "Фаъол" : "Ғайрифаъол"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setConfirmId(u.id)} className="text-xs text-rose-500 hover:underline">
                    Нест
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-semibold mb-2">Нест кардан?</h3>
            <p className="text-sm text-slate-500 mb-6">Ин кормандро пурра нест мекунед?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmId(null)} className="px-4 py-2 rounded-xl text-sm border">Бекор</button>
              <button onClick={() => handleDelete(confirmId)} disabled={isPending} className="px-4 py-2 rounded-xl text-sm bg-rose-600 text-white disabled:opacity-50">
                Нест кардан
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
