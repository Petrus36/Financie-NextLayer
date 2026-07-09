"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface ChartData {
  label: string;
  income: number;
  expenses: number;
  profit: number;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("sk-SK", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { dataKey: string; value: number; color: string; name: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const profit = payload.find((p) => p.dataKey === "profit");
  const expenses = payload.find((p) => p.dataKey === "expenses");

  return (
    <div className="rounded-lg border border-border-strong bg-surface-elevated px-4 py-3 shadow-xl">
      <p className="mb-2 text-xs font-medium text-muted">{label}</p>
      <div className="space-y-1.5">
        {profit && (
          <div className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-2 text-sm text-zinc-200">
              <span className="h-2.5 w-2.5 rounded-full bg-brand" />
              Zisk
            </span>
            <span className="text-sm font-semibold text-brand">
              {formatMoney(profit.value)}
            </span>
          </div>
        )}
        {expenses && (
          <div className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-2 text-sm text-zinc-200">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              Výdavky
            </span>
            <span className="text-sm font-semibold text-red-400">
              {formatMoney(expenses.value)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function FinanceChart({ data }: { data: ChartData[] }) {
  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted">
        Žiadne dáta pre zvolené obdobie
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-6 px-1">
        <div className="flex items-center gap-2">
          <span className="h-3 w-8 rounded-full bg-brand" />
          <span className="text-sm text-zinc-300">Zisk</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-8 rounded-full bg-red-500" />
          <span className="text-sm text-zinc-300">Výdavky</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="#666"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "#2a2a2a" }}
          />
          <YAxis
            stroke="#666"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "#2a2a2a" }}
            tickFormatter={(v) =>
              new Intl.NumberFormat("sk-SK", {
                notation: "compact",
                compactDisplay: "short",
              }).format(v)
            }
          />
          <ReferenceLine y={0} stroke="#333" strokeDasharray="4 4" />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="profit"
            name="Zisk"
            stroke="#BAFF57"
            strokeWidth={3}
            dot={{ fill: "#BAFF57", stroke: "#000", strokeWidth: 1, r: 4 }}
            activeDot={{ r: 6, fill: "#BAFF57", stroke: "#fff", strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="expenses"
            name="Výdavky"
            stroke="#ef4444"
            strokeWidth={3}
            dot={{ fill: "#ef4444", stroke: "#000", strokeWidth: 1, r: 4 }}
            activeDot={{ r: 6, fill: "#ef4444", stroke: "#fff", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
