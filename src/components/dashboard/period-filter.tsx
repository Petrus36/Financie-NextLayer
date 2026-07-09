"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

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

export function PeriodFilter({
  basePath = "/statistics",
  year,
  month,
  view,
}: {
  basePath?: string;
  year: number;
  month?: number;
  view: "month" | "year";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  function navigate(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    router.push(`${basePath}?${params.toString()}`);
  }

  function setView(newView: "month" | "year") {
    const now = new Date();
    if (newView === "year") {
      navigate({ view: "year", year: String(year), month: null });
    } else {
      navigate({
        view: "month",
        year: String(year),
        month: String(month ?? now.getMonth() + 1),
      });
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex rounded-lg border border-border-strong bg-surface p-1">
        <button
          type="button"
          onClick={() => setView("month")}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            view === "month"
              ? "bg-brand text-black"
              : "text-muted hover:text-zinc-100"
          )}
        >
          Mesiac
        </button>
        <button
          type="button"
          onClick={() => setView("year")}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            view === "year"
              ? "bg-brand text-black"
              : "text-muted hover:text-zinc-100"
          )}
        >
          Rok
        </button>
      </div>

      <Select
        value={String(year)}
        onChange={(e) => {
          const updates: Record<string, string | null> = { year: e.target.value };
          if (view === "month" && month) updates.month = String(month);
          navigate(updates);
        }}
        className="w-28"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </Select>

      {view === "month" && (
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
      )}
    </div>
  );
}
