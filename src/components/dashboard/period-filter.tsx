"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StatisticsView } from "@/lib/statistics-period";

const months = [
  { value: "1", label: "Január" },
  { value: "2", label: "Február" },
  { value: "3", label: "Marec" },
  { value: "4", label: "Apríl" },
  { value: "5", label: "Máj" },
  { value: "6", label: "Jún" },
  { value: "7", label: "Júl" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "Október" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const viewOptions: { value: StatisticsView; label: string }[] = [
  { value: "month", label: "Mesiac" },
  { value: "year", label: "Rok" },
  { value: "last3", label: "3 mesiace" },
  { value: "last6", label: "6 mesiacov" },
  { value: "custom", label: "Vlastné obdobie" },
];

export function PeriodFilter({
  basePath = "/statistics",
  view,
  year,
  month,
  from,
  to,
}: {
  basePath?: string;
  view: StatisticsView;
  year: number;
  month?: number;
  from?: string;
  to?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [customFrom, setCustomFrom] = useState(from ?? "");
  const [customTo, setCustomTo] = useState(to ?? "");

  useEffect(() => {
    if (from) setCustomFrom(from);
    if (to) setCustomTo(to);
  }, [from, to]);

  function formatDateInput(date: Date) {
    return date.toISOString().slice(0, 10);
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  function navigate(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`${basePath}?${params.toString()}`);
  }

  function setView(newView: StatisticsView) {
    const now = new Date();
    const base: Record<string, string | null> = { view: newView };

    if (newView === "month") {
      navigate({
        ...base,
        year: String(year),
        month: String(month ?? now.getMonth() + 1),
        from: null,
        to: null,
      });
    } else if (newView === "year") {
      navigate({ ...base, year: String(year), month: null, from: null, to: null });
    } else if (newView === "last3" || newView === "last6") {
      navigate({ ...base, year: null, month: null, from: null, to: null });
    } else {
      const now = new Date();
      const defaultFrom = formatDateInput(
        new Date(now.getFullYear(), now.getMonth(), 1)
      );
      const defaultTo = formatDateInput(now);
      setCustomFrom(customFrom || defaultFrom);
      setCustomTo(customTo || defaultTo);
      navigate({
        ...base,
        from: customFrom || defaultFrom,
        to: customTo || defaultTo,
        year: null,
        month: null,
      });
    }
  }

  function applyCustomRange() {
    if (!customFrom || !customTo) return;
    navigate({
      view: "custom",
      from: customFrom,
      to: customTo,
      year: null,
      month: null,
    });
  }

  return (
    <div className="flex flex-col items-end gap-3">
      <div className="flex flex-wrap justify-end gap-1 rounded-lg border border-border-strong bg-surface p-1">
        {viewOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setView(opt.value)}
            className={cn(
              "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm",
              view === opt.value
                ? "bg-brand text-black"
                : "text-muted hover:text-zinc-100"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {view === "month" && (
          <>
            <Select
              value={String(year)}
              onChange={(e) =>
                navigate({
                  year: e.target.value,
                  month: String(month ?? new Date().getMonth() + 1),
                })
              }
              className="w-28"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
            <Select
              value={month ? String(month) : String(new Date().getMonth() + 1)}
              onChange={(e) => navigate({ month: e.target.value })}
              className="w-36"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </Select>
          </>
        )}

        {view === "year" && (
          <Select
            value={String(year)}
            onChange={(e) => navigate({ year: e.target.value })}
            className="w-28"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
        )}

        {view === "custom" && (
          <>
            <Input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="w-36"
              aria-label="Od dátumu"
            />
            <span className="text-muted text-sm">—</span>
            <Input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="w-36"
              aria-label="Do dátumu"
            />
            <Button type="button" size="sm" onClick={applyCustomRange}>
              Použiť
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
