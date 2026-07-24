import { isWithinInterval } from "date-fns";
import type { ExpenseType } from "@/generated/prisma/client";

export function matchesTextSearch(
  query: string | undefined,
  fields: (string | null | undefined)[]
) {
  if (!query?.trim()) return true;
  const q = query.trim().toLowerCase();
  return fields.some((field) => field?.toLowerCase().includes(q));
}

export function expenseMatchesPeriod(
  expense: { type: ExpenseType; date: Date; active: boolean },
  start: Date,
  end: Date
) {
  const expenseDate = new Date(expense.date);
  if (expense.type === "ONE_TIME") {
    return isWithinInterval(expenseDate, { start, end });
  }
  return expense.active && expenseDate <= end;
}

export function incomeMatchesPeriod(
  income: { date: Date },
  start: Date,
  end: Date
) {
  return isWithinInterval(new Date(income.date), { start, end });
}

export function sumExpensesInPeriod(
  expenses: { type: ExpenseType; amount: number; date: Date; active: boolean }[],
  start: Date,
  end: Date
) {
  return expenses
    .filter((e) => expenseMatchesPeriod(e, start, end))
    .reduce((sum, e) => sum + e.amount, 0);
}

export function sumIncomesInPeriod(
  incomes: { amount: number; date: Date }[],
  start: Date,
  end: Date
) {
  return incomes
    .filter((i) => incomeMatchesPeriod(i, start, end))
    .reduce((sum, i) => sum + i.amount, 0);
}
