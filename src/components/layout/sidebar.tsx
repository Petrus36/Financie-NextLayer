"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Receipt,
  TrendingUp,
  LogOut,
  Layers,
  LineChart,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/dashboard", label: "Prehľad", icon: LayoutDashboard },
  { href: "/statistics", label: "Štatistiky", icon: LineChart },
  { href: "/celkove-financie", label: "Celkové financie", icon: Wallet },
  { href: "/clients", label: "Klienti", icon: Users },
  { href: "/expenses", label: "Výdavky firmy", icon: Receipt },
  { href: "/income", label: "Príjmy firmy", icon: TrendingUp },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-border bg-black/90 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand">
          <Layers className="h-5 w-5 text-black" />
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-100">NextLayer Studio</p>
          <p className="text-xs text-muted">Financie</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-muted text-brand"
                  : "text-muted hover:bg-surface-elevated hover:text-zinc-100"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface-elevated hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Odhlásiť sa
        </button>
      </div>
    </aside>
  );
}
