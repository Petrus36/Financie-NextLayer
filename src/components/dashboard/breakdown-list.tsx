import { formatCurrency } from "@/lib/utils";

type Row = {
  label: string;
  value: number;
  accent?: "brand" | "red" | "zinc";
};

export function BreakdownList({
  rows,
  total,
  totalLabel = "Spolu",
  accent = "brand",
}: {
  rows: Row[];
  total: number;
  totalLabel?: string;
  accent?: "brand" | "red";
}) {
  const max = Math.max(total, ...rows.map((row) => row.value), 1);

  return (
    <div className="space-y-4">
      {rows.map((row) => {
        const width = Math.max(0, Math.min(100, (row.value / max) * 100));
        const bar =
          row.accent === "red"
            ? "bg-red-500"
            : row.accent === "zinc"
              ? "bg-zinc-400"
              : "bg-brand";

        return (
          <div key={row.label} className="space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted">{row.label}</span>
              <span className="text-sm font-medium text-zinc-100">
                {formatCurrency(row.value)}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-border">
              <div className={`h-full rounded-full ${bar}`} style={{ width: `${width}%` }} />
            </div>
          </div>
        );
      })}
      <div className="flex items-center justify-between border-t border-border pt-3">
        <span className="text-sm font-medium text-zinc-300">{totalLabel}</span>
        <span
          className={`text-sm font-bold ${accent === "red" ? "text-red-400" : "text-brand"}`}
        >
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
}
