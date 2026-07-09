"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select";

const months = [
  { value: "", label: "Celý rok" },
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
  year,
  month,
}: {
  year: number;
  month?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-3">
      <Select
        value={String(year)}
        onChange={(e) => updateFilter("year", e.target.value)}
        className="w-28"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </Select>
      <Select
        value={month ? String(month) : ""}
        onChange={(e) => updateFilter("month", e.target.value)}
        className="w-36"
      >
        {months.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
