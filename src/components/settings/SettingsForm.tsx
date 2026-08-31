"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSettings } from "@/actions/settings";

export function SettingsForm({ settings }: { settings: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updateSettings({
          storeName: fd.get("storeName") as string,
          phone: (fd.get("phone") as string) || null,
          address: (fd.get("address") as string) || null,
          currency: (fd.get("currency") as string) || "TJS",
          currencySymbol: (fd.get("currencySymbol") as string) || "сомонӣ",
          receiptFooter: (fd.get("receiptFooter") as string) || null,
          language: (fd.get("language") as string) || "tg",
          theme: (fd.get("theme") as string) || "light",
          allowNegativeStock: fd.get("allowNegativeStock") === "on",
        });
        setSuccess(true);
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Хатогӣ");
      }
    });
  }

  const inputCls =
    "w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
      )}
      {success && (
        <div className="bg-emerald-50 text-emerald-700 text-sm rounded-xl px-4 py-3">
          Танзимот бомуваффақият сабт шуд
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl border p-6 space-y-4">
        <h2 className="font-semibold">Мағоза</h2>
        <div>
          <label className="block text-sm font-medium mb-1.5">Номи мағоза *</label>
          <input name="storeName" required defaultValue={settings.storeName} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Телефон</label>
          <input name="phone" defaultValue={settings.phone || ""} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Суроға</label>
          <input name="address" defaultValue={settings.address || ""} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Поёни чек</label>
          <input name="receiptFooter" defaultValue={settings.receiptFooter || ""} className={inputCls} />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border p-6 space-y-4">
        <h2 className="font-semibold">Асъор ва забон</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Асъор</label>
            <input name="currency" defaultValue={settings.currency || "TJS"} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Аломати асъор</label>
            <input name="currencySymbol" defaultValue={settings.currencySymbol || "сомонӣ"} className={inputCls} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Забон</label>
            <select name="language" defaultValue={settings.language || "tg"} className={inputCls}>
              <option value="tg">Тоҷикӣ</option>
              <option value="ru">Русӣ</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Мавзӯъ</label>
            <select name="theme" defaultValue={settings.theme || "light"} className={inputCls}>
              <option value="light">Рӯшно</option>
              <option value="dark">Торик</option>
              <option value="system">Система</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border p-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="allowNegativeStock"
            defaultChecked={settings.allowNegativeStock}
            className="w-4 h-4 rounded"
          />
          <div>
            <div className="text-sm font-medium">Иҷозати анбори манфӣ</div>
            <div className="text-xs text-slate-500">Фурӯш ҳатто агар мол набошад</div>
          </div>
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-medium text-sm"
      >
        {isPending ? "Сабт..." : "Сабт кардан"}
      </button>
    </form>
  );
}
