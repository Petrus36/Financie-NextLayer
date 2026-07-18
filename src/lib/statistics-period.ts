import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  startOfDay,
  endOfDay,
  subMonths,
  isSameMonth,
} from "date-fns";

export type StatisticsView =
  | "month"
  | "year"
  | "last3"
  | "last6"
  | "custom";

export type StatisticsPeriod =
  | { mode: "month"; year: number; month: number }
  | { mode: "year"; year: number }
  | { mode: "last3" }
  | { mode: "last6" }
  | { mode: "custom"; from: Date; to: Date };

export function parseStatisticsPeriod(params: {
  view?: string;
  year?: string;
  month?: string;
  from?: string;
  to?: string;
}): StatisticsPeriod {
  const now = new Date();
  const view = (params.view ?? "month") as StatisticsView;

  if (view === "year") {
    return {
      mode: "year",
      year: params.year ? parseInt(params.year, 10) : now.getFullYear(),
    };
  }

  if (view === "last3") return { mode: "last3" };
  if (view === "last6") return { mode: "last6" };

  if (view === "custom" && params.from && params.to) {
    const from = startOfDay(new Date(params.from));
    const to = endOfDay(new Date(params.to));
    if (!isNaN(from.getTime()) && !isNaN(to.getTime()) && from <= to) {
      return { mode: "custom", from, to };
    }
  }

  return {
    mode: "month",
    year: params.year ? parseInt(params.year, 10) : now.getFullYear(),
    month: params.month ? parseInt(params.month, 10) : now.getMonth() + 1,
  };
}

export function getPeriodBounds(period: StatisticsPeriod): {
  start: Date;
  end: Date;
} {
  const now = new Date();

  switch (period.mode) {
    case "month": {
      const date = new Date(period.year, period.month - 1, 1);
      return { start: startOfMonth(date), end: endOfMonth(date) };
    }
    case "year": {
      const date = new Date(period.year, 0, 1);
      return { start: startOfYear(date), end: endOfYear(date) };
    }
    case "last3":
      return {
        start: startOfMonth(subMonths(now, 2)),
        end: endOfMonth(now),
      };
    case "last6":
      return {
        start: startOfMonth(subMonths(now, 5)),
        end: endOfMonth(now),
      };
    case "custom":
      return { start: period.from, end: period.to };
  }
}

export function isSingleMonthPeriod(start: Date, end: Date): boolean {
  return isSameMonth(start, end);
}

export function formatPeriodLabel(
  period: StatisticsPeriod,
  start: Date,
  end: Date
): string {
  const fmt = new Intl.DateTimeFormat("sk-SK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  switch (period.mode) {
    case "month":
      return new Intl.DateTimeFormat("sk-SK", {
        month: "long",
        year: "numeric",
      }).format(new Date(period.year, period.month - 1));
    case "year":
      return String(period.year);
    case "last3":
      return "Posledné 3 mesiace";
    case "last6":
      return "Posledných 6 mesiacov";
    case "custom":
      return `${fmt.format(start)} – ${fmt.format(end)}`;
  }
}

export function getChartTitle(
  period: StatisticsPeriod,
  label: string,
  start: Date,
  end: Date
): string {
  if (isSingleMonthPeriod(start, end)) {
    return `Denný vývoj — ${label}`;
  }
  if (period.mode === "year") {
    return `Mesačný vývoj — ${label}`;
  }
  return `Mesačný vývoj — ${label}`;
}

export function getCurrentMonthFilter(): StatisticsPeriod {
  const now = new Date();
  return { mode: "month", year: now.getFullYear(), month: now.getMonth() + 1 };
}
