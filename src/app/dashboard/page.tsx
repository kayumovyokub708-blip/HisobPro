"use client";

import Link from "next/link";

const stats = [
  { title: "Фурӯши имрӯз", value: "0", change: "—", color: "bg-blue-500" },
  { title: "Фоидаи имрӯз", value: "0", change: "—", color: "bg-emerald-500" },
  { title: "Хароҷоти имрӯз", value: "0", change: "—", color: "bg-orange-500" },
  { title: "Маҳсулоти боқимонда", value: "0", change: "—", color: "bg-violet-500" },
  { title: "Маҳсулоти камшуда", value: "0", change: "—", color: "bg-rose-500" },
  { title: "Қарзи мизоҷон", value: "0", change: "—", color: "bg-amber-500" },
];

const navItems = [
  { name: "Панели идоракунӣ", href: "/dashboard", active: true },
  { name: "Фурӯш", href: "/pos" },
  { name: "Маҳсулот", href: "/products" },
  { name: "Анбор", href: "/inventory" },
  { name: "Мизоҷон", href: "/customers" },
  { name: "Таъминкунандагон", href: "/suppliers" },
  { name: "Хароҷот", href: "/expenses" },
  { name: "Ҳисоботҳо", href: "/reports" },
  { name: "Кормандон", href: "/employees" },
  { name: "Танзимот", href: "/settings" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              HP
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white">HisobPro</div>
              <div className="text-xs text-slate-500">Smart Business</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                item.active
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-300">
            Администратор
          </div>
          <Link
            href="/login"
            className="text-xs text-red-500 hover:underline mt-1 inline-block"
          >
            Баромадан
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur border-b border-slate-200 dark:border-slate-700 px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Панели идоракунӣ
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {new Date().toLocaleDateString("tg-TJ", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <span className="text-xl">🔔</span>
              </button>
              <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center font-semibold text-sm">
                А
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.title}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      {stat.value}{" "}
                      <span className="text-sm font-normal text-slate-500">
                        сомонӣ
                      </span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{stat.change}</p>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-xl ${stat.color} opacity-90`}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-4">
              Амалҳои зуд
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {[
                { name: "Фурӯш", href: "/pos", emoji: "🛒" },
                { name: "Маҳсулот", href: "/products", emoji: "📦" },
                { name: "Қабули мол", href: "/purchases", emoji: "📥" },
                { name: "Хароҷот", href: "/expenses", emoji: "💸" },
                { name: "Мизоҷ", href: "/customers", emoji: "👤" },
              ].map((action) => (
                <Link
                  key={action.name}
                  href={action.href}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <span className="text-2xl">{action.emoji}</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {action.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 text-center">
            <p className="text-amber-800 dark:text-amber-200 text-sm">
              ⚠️ Ин версияи ибтидоӣ аст. Database ва функсияҳои пурра ҳанӯз пайваст нашудаанд.
              Барои идомаи таҳия ба GitHub нигаред.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
