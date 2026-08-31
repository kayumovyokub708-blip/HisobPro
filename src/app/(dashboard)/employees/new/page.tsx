"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createEmployee } from "@/actions/employees";

export default function NewEmployeePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createEmployee({
          name: fd.get("name") as string,
          username: fd.get("username") as string,
          phone: (fd.get("phone") as string) || null,
          email: (fd.get("email") as string) || null,
          role: fd.get("role") as any,
          password: fd.get("password") as string,
          status: true,
        });
        router.push("/employees");
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Хатогӣ");
      }
    });
  }

  const inputCls =
    "w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none";

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-3">
        <Link href="/employees" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Корманди нав</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
        )}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Ном *</label>
            <input name="name" required className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Username *</label>
            <input name="username" required minLength={3} className={inputCls} autoComplete="off" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Парол *</label>
            <input name="password" type="password" required minLength={4} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Нақш *</label>
            <select name="role" className={inputCls} defaultValue="CASHIER">
              <option value="CASHIER">Кассир</option>
              <option value="MANAGER">Мудир</option>
              <option value="ADMIN">Админ</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Телефон</label>
            <input name="phone" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input name="email" type="email" className={inputCls} />
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={isPending} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium disabled:opacity-50">
            {isPending ? "Сабт..." : "Сабт кардан"}
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 border rounded-xl text-sm">
            Бекор
          </button>
        </div>
      </form>
    </div>
  );
}
