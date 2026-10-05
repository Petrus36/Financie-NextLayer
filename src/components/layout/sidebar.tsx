"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Receipt,
  TrendingUp,
  LogOut,
  Layers,
  LineChart,
  Wallet,
  FileStack,
  FileText,
  Settings,
  Menu,
  X,
  Banknote,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const navGroups = [
  {
    label: "Denné",
    items: [
      { href: "/dashboard", label: "Prehľad", icon: LayoutDashboard },
      { href: "/projects", label: "Projekty", icon: Briefcase },
      { href: "/invoices", label: "Faktúry", icon: FileText },
      { href: "/statistics", label: "Štatistiky", icon: LineChart },
    ],
  },
  {
    label: "Financie",
    items: [
      { href: "/celkove-financie", label: "Celkové financie", icon: Wallet },
      { href: "/interne-doklady", label: "Interné doklady", icon: Banknote },
      { href: "/expenses", label: "Výdavky firmy", icon: Receipt },
      { href: "/income", label: "Príjmy firmy", icon: TrendingUp },
    ],
  },
  {
    label: "Firma",
    items: [
      { href: "/clients", label: "Klienti", icon: Users },
      { href: "/bills", label: "Doklady", icon: FileStack },
      { href: "/settings", label: "Nastavenia", icon: Settings },
    ],
  },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-6 overflow-y-auto p-4">
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
            {group.label}
          </p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
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
          </div>
        </div>
      ))}
    </nav>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-black/90 px-4 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
            <Layers className="h-4 w-4 text-black" />
          </div>
          <p className="text-sm font-bold text-zinc-100">Financie</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-lg p-2 text-zinc-300 hover:bg-surface-elevated"
          aria-label={open ? "Zavrieť menu" : "Otvoriť menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Zavrieť menu"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-black/95 backdrop-blur-xl transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand">
            <Layers className="h-5 w-5 text-black" />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-100">NextLayer Studio</p>
            <p className="text-xs text-muted">Financie</p>
          </div>
        </div>

        <NavLinks onNavigate={() => setOpen(false)} />

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
    </>
  );
}
