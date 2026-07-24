"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { PeriodFilter } from "@/components/dashboard/period-filter";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { StatisticsView } from "@/lib/statistics-period";

export function FinanceListFilters({
  basePath,
  view,
  year,
  month,
  from,
  to,
  search,
  typeFilter,
  showTypeFilter,
}: {
  basePath: string;
  view: StatisticsView;
  year: number;
  month?: number;
  from?: string;
  to?: string;
  search?: string;
  typeFilter?: string;
  showTypeFilter?: boolean;
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
    router.push(`${basePath}?${params.toString()}`);
  }

  function submitSearch(value: string) {
    navigate({ q: value.trim() || null });
  }

  return (
    <div className="flex flex-col gap-4">
      <PeriodFilter
        basePath={basePath}
        view={view}
        year={year}
        month={month}
        from={from}
        to={to}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
        <div className="relative w-full sm:w-64">
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
            placeholder="Hľadať popis, kategóriu..."
            className="pl-9"
            aria-label="Hľadať"
          />
        </div>

        {showTypeFilter && (
          <Select
            value={typeFilter ?? "ALL"}
            onChange={(e) =>
              navigate({
                type: e.target.value === "ALL" ? null : e.target.value,
              })
            }
            className="w-full sm:w-40"
            aria-label="Typ výdavku"
          >
            <option value="ALL">Všetky typy</option>
            <option value="ONE_TIME">Jednorazové</option>
            <option value="MONTHLY">Mesačné</option>
          </Select>
        )}

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              submitSearch("");
            }}
            className={cn(
              "text-xs text-muted underline-offset-2 hover:text-zinc-100 hover:underline"
            )}
          >
            Zrušiť hľadanie
          </button>
        )}
      </div>
    </div>
  );
}
