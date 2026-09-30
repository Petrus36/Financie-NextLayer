"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { PeriodFilter } from "@/components/dashboard/period-filter";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { StatisticsView } from "@/lib/statistics-period";

const statusOptions = [
  { value: "", label: "Všetky stavy" },
  { value: "DRAFT", label: "Koncept" },
  { value: "SENT", label: "Odoslané" },
  { value: "PAID", label: "Zaplatené" },
  { value: "OVERDUE", label: "Po splatnosti" },
  { value: "CANCELLED", label: "Zrušené" },
] as const;

export function InvoiceListFilters({
  view,
  year,
  month,
  from,
  to,
  status,
  search,
}: {
  view: StatisticsView;
  year: number;
  month?: number;
  from?: string;
  to?: string;
  status?: string;
  search?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(search ?? "");

  useEffect(() => {
    setQuery(search ?? "");
  }, [search]);

  function navigate(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`/invoices?${params.toString()}`);
  }

  function submitSearch(value: string) {
    navigate({ q: value.trim() || null });
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-surface-elevated/40 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-200">Filter faktúr</p>
          <p className="text-xs text-muted">
            Obdobie vyberte mesiacom a rokom — netreba písať dátum ručne.
          </p>
        </div>
        <PeriodFilter
          basePath="/invoices"
          view={view}
          year={year}
          month={month}
          from={from}
          to={to}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitSearch(query);
            }}
            onBlur={() => {
              if (query !== (search ?? "")) submitSearch(query);
            }}
            placeholder="Číslo faktúry, klient..."
            className="pl-9"
            aria-label="Hľadať faktúry"
          />
        </div>

        <Select
          value={status ?? ""}
          onChange={(e) => navigate({ status: e.target.value || null })}
          className="w-full sm:w-44"
          aria-label="Stav faktúry"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value || "all"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              submitSearch("");
            }}
            className="text-xs text-muted underline-offset-2 hover:text-zinc-100 hover:underline"
          >
            Zrušiť hľadanie
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border pt-3">
        {statusOptions.map((tab) => {
          const active = (status ?? "") === tab.value;
          const params = new URLSearchParams(searchParams.toString());
          if (tab.value) params.set("status", tab.value);
          else params.delete("status");
          if (search) params.set("q", search);
          return (
            <Link
              key={tab.value || "all"}
              href={`/invoices?${params.toString()}`}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-brand/40 bg-brand-muted text-brand"
                  : "border-border text-muted hover:text-zinc-100"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
