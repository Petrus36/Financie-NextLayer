import { startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";
import { prisma } from "@/lib/prisma";

/** Reset completed deliverables when a new calendar month starts. */
export async function syncRetainerPeriods(filters?: {
  clientId?: string;
  projectId?: string;
}) {
  const currentPeriod = startOfMonth(new Date());

  await prisma.monthlyRetainer.updateMany({
    where: {
      active: true,
      periodStart: { lt: currentPeriod },
      ...(filters?.clientId && { clientId: filters.clientId }),
      ...(filters?.projectId && { projectId: filters.projectId }),
    },
    data: {
      completedCount: 0,
      periodStart: currentPeriod,
    },
  });
}

export function calcRecurringMonthlyTotal(
  items: { startDate: Date; monthlyAmount: number }[],
  periodStart: Date,
  periodEnd: Date,
  filterMonth?: number
) {
  return items.reduce((sum, item) => {
    const contractStart = new Date(item.startDate);
    if (contractStart > periodEnd) return sum;

    if (filterMonth !== undefined) {
      if (contractStart <= periodEnd) return sum + item.monthlyAmount;
      return sum;
    }

    const months = eachMonthOfInterval({ start: periodStart, end: periodEnd }).filter(
      (month) => {
        const monthEnd = endOfMonth(month);
        return contractStart <= monthEnd;
      }
    );
    return sum + item.monthlyAmount * months.length;
  }, 0);
}
