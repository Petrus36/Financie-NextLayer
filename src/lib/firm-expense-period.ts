import { eachMonthOfInterval, endOfMonth, isWithinInterval } from "date-fns";
import type { ExpenseType } from "@/generated/prisma/client";

export function firmExpenseAmountInPeriod(
  expense: { type: ExpenseType; amount: number; date: Date; active: boolean },
  start: Date,
  end: Date,
  singleMonth: boolean
) {
  if (expense.type === "ONE_TIME") {
    if (isWithinInterval(new Date(expense.date), { start, end })) {
      return expense.amount;
    }
    return 0;
  }

  if (!expense.active) return 0;
  const expenseStart = new Date(expense.date);
  if (expenseStart > end) return 0;

  if (singleMonth) {
    if (expenseStart <= end) return expense.amount;
    return 0;
  }

  const months = eachMonthOfInterval({ start, end }).filter((month) => {
    const monthEnd = endOfMonth(month);
    return expenseStart <= monthEnd;
  });
  return expense.amount * months.length;
}
