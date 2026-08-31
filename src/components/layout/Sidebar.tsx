"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse,
  Users,
  Truck,
  Receipt,
  RotateCcw,
  BarChart3,
  UserCog,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Панели идоракунӣ", icon: LayoutDashboard },
  { href: "/pos", label: "Касса (POS)", icon: ShoppingCart },
  { href: "/products", label: "Маҳсулот", icon: Package },
  { href: "/inventory", label: "Анбор", icon: Warehouse },
  { href: "/customers", label: "Мизоҷон", icon: Users },
  { href: "/suppliers", label: "Таъминкунандагон", icon: Truck },
  { href: "/purchases", label: "Қабули мол", icon: Receipt },
  { href: "/expenses", label: "Хароҷот", icon: Receipt },
  { href: "/returns", label: "Баргардонидан", icon: RotateCcw },
  { href: "/reports", label: "Ҳисоботҳо", icon: BarChart3 },
  { href: "/employees", label: "Кормандон", icon: UserCog },
  { href: "/settings", label: "Танзимот", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const role = (session?.user as any)?.role;

  // Simple role filter
  const visibleItems = navItems.filter((item) => {
    if (role === "CASHIER") {
      return ["/dashboard", "/pos", "/customers"].includes(item.href);
    }
    if (role === "MANAGER") {
      return !["/employees", "/settings"].includes(item.href);
    }
    return true; // ADMIN
  });

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-white dark:bg-slate-800 shadow border border-slate-200 dark:border-slate-700"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform lg:translate-x-0 lg:static",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              HP
            </div>
            <div>
              <div className="font-bold text-sm">HisobPro</div>
              <div className="text-xs text-slate-500">Smart Business</div>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {visibleItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <div className="px-3 py-2 mb-2">
            <div className="text-sm font-medium truncate">
              {session?.user?.name}
            </div>
            <div className="text-xs text-slate-500 capitalize">
              {(session?.user as any)?.role?.toLowerCase() || "—"}
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Баромадан
          </button>
        </div>
      </aside>
    </>
  );
}
