import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-600 text-white text-3xl font-bold shadow-lg">
            HP
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
            HisobPro
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Smart Business Management
          </p>
          <p className="text-base text-slate-500 dark:text-slate-400 font-medium">
            Ҳамаи ҳисобҳои магазин — дар як ҷо.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 md:p-8 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
              Лоиҳа дар ҳоли таҳия
            </span>
          </div>

          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3">
            Системаи идоракунии магазин ва POS
          </h2>

          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
            HisobPro — системаи пурраи идоракунии мағоза барои Тоҷикистон.
            Фурӯш, анбор, мизоҷон, қарзҳо, ҳисоботҳо ва бисёр чизҳои дигар.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {[
              "POS / Фурӯш",
              "Маҳсулот",
              "Анбор",
              "Мизоҷон",
              "Қарзҳо",
              "Ҳисоботҳо",
            ].map((item) => (
              <div
                key={item}
                className="bg-slate-50 dark:bg-slate-700/50 rounded-lg py-2 px-3 text-slate-700 dark:text-slate-200 font-medium"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-md"
          >
            Даромадан
          </Link>
          <a
            href="https://github.com/kayumovyokub708-blip/HisobPro"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            GitHub Repository
          </a>
        </div>

        <p className="text-xs text-slate-400 dark:text-slate-500">
          Version 0.1.0 · Development in progress
        </p>
      </div>
    </div>
  );
}
