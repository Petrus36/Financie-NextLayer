import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  isWithinInterval,
} from "date-fns";
import { prisma } from "@/lib/prisma";

export type PeriodFilter = {
  year: number;
  month?: number;
};

function getPeriodBounds(filter: PeriodFilter) {
  if (filter.month !== undefined) {
    const date = new Date(filter.year, filter.month - 1, 1);
    return { start: startOfMonth(date), end: endOfMonth(date) };
  }
  const date = new Date(filter.year, 0, 1);
  return { start: startOfYear(date), end: endOfYear(date) };
}

export async function getStatistics(filter: PeriodFilter) {
  const { start, end } = getPeriodBounds(filter);

  const [
    deliveredProjects,
    projectExpenses,
    firmExpenses,
    firmIncomes,
    maintenanceContracts,
  ] = await Promise.all([
    prisma.project.findMany({
      where: {
        status: "DELIVERED",
        deliveredAt: { gte: start, lte: end },
      },
      include: { expenses: true, client: true },
    }),
    prisma.projectExpense.findMany({
      where: { date: { gte: start, lte: end } },
      include: { project: { include: { client: true } } },
    }),
    prisma.firmExpense.findMany(),
    prisma.firmIncome.findMany({
      where: { date: { gte: start, lte: end } },
    }),
    prisma.maintenanceContract.findMany({
      where: { active: true },
      include: { client: true, project: true },
    }),
  ]);

  const projectRevenue = deliveredProjects.reduce((sum, p) => sum + p.price, 0);

  const maintenanceRevenue = maintenanceContracts.reduce((sum, m) => {
    const contractStart = new Date(m.startDate);
    if (contractStart > end) return sum;

    if (filter.month !== undefined) {
      if (contractStart <= end) return sum + m.monthlyAmount;
      return sum;
    }

    const months = eachMonthOfInterval({ start, end }).filter((month) => {
      const monthEnd = endOfMonth(month);
      return contractStart <= monthEnd;
    });
    return sum + m.monthlyAmount * months.length;
  }, 0);

  const firmIncomeTotal = firmIncomes.reduce((sum, i) => sum + i.amount, 0);
  const totalIncome = projectRevenue + maintenanceRevenue + firmIncomeTotal;

  const projectExpenseTotal = projectExpenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );

  const firmExpenseTotal = firmExpenses.reduce((sum, e) => {
    if (e.type === "ONE_TIME") {
      const expenseDate = new Date(e.date);
      if (isWithinInterval(expenseDate, { start, end })) {
        return sum + e.amount;
      }
      return sum;
    }
    if (!e.active) return sum;
    const expenseStart = new Date(e.date);
    if (expenseStart > end) return sum;

    if (filter.month !== undefined) {
      if (expenseStart <= end) return sum + e.amount;
      return sum;
    }

    const months = eachMonthOfInterval({ start, end }).filter((month) => {
      const monthEnd = endOfMonth(month);
      return expenseStart <= monthEnd;
    });
    return sum + e.amount * months.length;
  }, 0);

  const totalExpenses = projectExpenseTotal + firmExpenseTotal;
  const profit = totalIncome - totalExpenses;

  const monthlyBreakdown =
    filter.month === undefined
      ? eachMonthOfInterval({ start, end }).map((month) => {
          const mStart = startOfMonth(month);
          const mEnd = endOfMonth(month);

          const monthProjectRevenue = deliveredProjects
            .filter((p) => p.deliveredAt && isWithinInterval(p.deliveredAt, { start: mStart, end: mEnd }))
            .reduce((s, p) => s + p.price, 0);

          const monthMaintenance = maintenanceContracts
            .filter((m) => new Date(m.startDate) <= mEnd)
            .reduce((s, m) => s + m.monthlyAmount, 0);

          const monthFirmIncome = firmIncomes
            .filter((i) => isWithinInterval(i.date, { start: mStart, end: mEnd }))
            .reduce((s, i) => s + i.amount, 0);

          const monthProjectExpenses = projectExpenses
            .filter((e) => isWithinInterval(e.date, { start: mStart, end: mEnd }))
            .reduce((s, e) => s + e.amount, 0);

          const monthFirmExpenses = firmExpenses.reduce((s, e) => {
            if (e.type === "ONE_TIME") {
              if (isWithinInterval(e.date, { start: mStart, end: mEnd })) return s + e.amount;
              return s;
            }
            if (!e.active || new Date(e.date) > mEnd) return s;
            return s + e.amount;
          }, 0);

          return {
            month: month.getMonth() + 1,
            label: new Intl.DateTimeFormat("sk-SK", { month: "short" }).format(month),
            income: monthProjectRevenue + monthMaintenance + monthFirmIncome,
            expenses: monthProjectExpenses + monthFirmExpenses,
            profit:
              monthProjectRevenue +
              monthMaintenance +
              monthFirmIncome -
              monthProjectExpenses -
              monthFirmExpenses,
          };
        })
      : [];

  return {
    totalIncome,
    totalExpenses,
    profit,
    projectRevenue,
    maintenanceRevenue,
    firmIncomeTotal,
    projectExpenseTotal,
    firmExpenseTotal,
    deliveredProjectsCount: deliveredProjects.length,
    activeMaintenanceCount: maintenanceContracts.length,
    monthlyBreakdown,
    recentDelivered: deliveredProjects.slice(0, 5),
  };
}

export async function getDashboardOverview() {
  const [clientCount, activeProjects, deliveredProjects, activeMaintenance] =
    await Promise.all([
      prisma.client.count(),
      prisma.project.count({ where: { status: "ACTIVE" } }),
      prisma.project.count({ where: { status: "DELIVERED" } }),
      prisma.maintenanceContract.count({ where: { active: true } }),
    ]);

  return { clientCount, activeProjects, deliveredProjects, activeMaintenance };
}

export async function getProjectSummary(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      expenses: true,
      client: true,
      maintenance: true,
    },
  });

  if (!project) return null;

  const totalExpenses = project.expenses.reduce((s, e) => s + e.amount, 0);
  const profit = project.price - totalExpenses;
  const margin = project.price > 0 ? (profit / project.price) * 100 : 0;

  return {
    project,
    totalExpenses,
    profit,
    margin,
  };
}
