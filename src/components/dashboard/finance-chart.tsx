"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ChartData {
  label: string;
  income: number;
  expenses: number;
  profit: number;
}

export function FinanceChart({ data }: { data: ChartData[] }) {
  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis dataKey="label" stroke="#71717a" fontSize={12} />
        <YAxis stroke="#71717a" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#18181b",
            border: "1px solid #27272a",
            borderRadius: "8px",
            color: "#fafafa",
          }}
          formatter={(value) =>
            new Intl.NumberFormat("sk-SK", {
              style: "currency",
              currency: "EUR",
            }).format(Number(value))
          }
        />
        <Legend />
        <Bar dataKey="income" name="Príjmy" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" name="Výdavky" fill="#ef4444" radius={[4, 4, 0, 0]} />
        <Bar dataKey="profit" name="Zisk" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
