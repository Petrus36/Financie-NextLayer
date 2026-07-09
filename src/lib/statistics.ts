import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  eachDayOfInterval,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from "date-fns";
import { prisma } from "@/lib/prisma";
import { calcRecurringMonthlyTotal } from "@/lib/retainers";

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
    monthlyRetainers,
  ] = await Promise.all([
    prisma.project.findMany({
      where: {
        status: "DELIVERED",
        deliveredAt: { gte: start, lte: end },
      },
      include: { expenses: true, client: true, payments: true },
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
    prisma.monthlyRetainer.findMany({
      where: { active: true },
      include: { client: true, project: true },
    }),
  ]);

  const allPayments = await prisma.projectPayment.findMany({
    select: { amount: true, date: true, projectId: true },
  });

  const legacyProjects = await prisma.project.findMany({
    where: { status: "DELIVERED" },
    select: { id: true, price: true, deliveredAt: true, payments: { select: { id: true } } },
  });

  const paymentsInPeriod = allPayments.filter((p) =>
    isWithinInterval(p.date, { start, end })
  );

  const totalProjectRevenue =
    paymentsInPeriod.reduce((sum, p) => sum + p.amount, 0) +
    legacyProjects
      .filter(
        (p) =>
          p.payments.length === 0 &&
          p.deliveredAt &&
          isWithinInterval(p.deliveredAt, { start, end })
      )
      .reduce((sum, p) => sum + p.price, 0);

  const maintenanceRevenue = calcRecurringMonthlyTotal(
    maintenanceContracts,
    start,
    end,
    filter.month
  );

  const retainerRevenue = calcRecurringMonthlyTotal(
    monthlyRetainers,
    start,
    end,
    filter.month
  );

  const firmIncomeTotal = firmIncomes.reduce((sum, i) => sum + i.amount, 0);
  const totalIncome =
    totalProjectRevenue + maintenanceRevenue + retainerRevenue + firmIncomeTotal;

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

          const monthProjectRevenue = allPayments
            .filter((p) => isWithinInterval(p.date, { start: mStart, end: mEnd }))
            .reduce((s, p) => s + p.amount, 0);

          const monthLegacyRevenue = legacyProjects
            .filter(
              (p) =>
                p.payments.length === 0 &&
                p.deliveredAt &&
                isWithinInterval(p.deliveredAt, { start: mStart, end: mEnd })
            )
            .reduce((s, p) => s + p.price, 0);

          const monthMaintenance = calcRecurringMonthlyTotal(
            maintenanceContracts,
            mStart,
            mEnd,
            1
          );

          const monthRetainers = calcRecurringMonthlyTotal(
            monthlyRetainers,
            mStart,
            mEnd,
            1
          );

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

          const income =
            monthProjectRevenue +
            monthLegacyRevenue +
            monthMaintenance +
            monthRetainers +
            monthFirmIncome;

          return {
            month: month.getMonth() + 1,
            label: new Intl.DateTimeFormat("sk-SK", { month: "short" }).format(month),
            income,
            expenses: monthProjectExpenses + monthFirmExpenses,
            profit: income - monthProjectExpenses - monthFirmExpenses,
          };
        })
      : [];

  const dailyBreakdown =
    filter.month !== undefined
      ? eachDayOfInterval({ start, end }).map((day) => {
          const dStart = startOfDay(day);
          const dEnd = endOfDay(day);
          const isFirstDay = day.getDate() === 1;

          const dayProjectRevenue = allPayments
            .filter((p) => isWithinInterval(p.date, { start: dStart, end: dEnd }))
            .reduce((s, p) => s + p.amount, 0);

          const dayLegacyRevenue = legacyProjects
            .filter(
              (p) =>
                p.payments.length === 0 &&
                p.deliveredAt &&
                isWithinInterval(p.deliveredAt, { start: dStart, end: dEnd })
            )
            .reduce((s, p) => s + p.price, 0);

          const dayMaintenance = isFirstDay
            ? calcRecurringMonthlyTotal(maintenanceContracts, dStart, dEnd, 1)
            : 0;

          const dayRetainers = isFirstDay
            ? calcRecurringMonthlyTotal(monthlyRetainers, dStart, dEnd, 1)
            : 0;

          const dayFirmIncome = firmIncomes
            .filter((i) => isWithinInterval(i.date, { start: dStart, end: dEnd }))
            .reduce((s, i) => s + i.amount, 0);

          const dayProjectExpenses = projectExpenses
            .filter((e) => isWithinInterval(e.date, { start: dStart, end: dEnd }))
            .reduce((s, e) => s + e.amount, 0);

          const dayFirmExpenses = firmExpenses.reduce((s, e) => {
            if (e.type === "ONE_TIME") {
              if (isWithinInterval(e.date, { start: dStart, end: dEnd })) return s + e.amount;
              return s;
            }
            if (!e.active || new Date(e.date) > dEnd) return s;
            return isFirstDay ? s + e.amount : s;
          }, 0);

          const income =
            dayProjectRevenue +
            dayLegacyRevenue +
            dayMaintenance +
            dayRetainers +
            dayFirmIncome;

          return {
            label: String(day.getDate()),
            income,
            expenses: dayProjectExpenses + dayFirmExpenses,
            profit: income - dayProjectExpenses - dayFirmExpenses,
          };
        })
      : [];

  const chartBreakdown = filter.month !== undefined ? dailyBreakdown : monthlyBreakdown;

  return {
    totalIncome,
    totalExpenses,
    profit,
    projectRevenue: totalProjectRevenue,
    maintenanceRevenue,
    retainerRevenue,
    firmIncomeTotal,
    projectExpenseTotal,
    firmExpenseTotal,
    deliveredProjectsCount: deliveredProjects.length,
    activeMaintenanceCount: maintenanceContracts.length,
    activeRetainerCount: monthlyRetainers.length,
    monthlyBreakdown,
    dailyBreakdown,
    chartBreakdown,
    recentDelivered: deliveredProjects.slice(0, 5),
  };
}

export function getCurrentMonthFilter(): PeriodFilter {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
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
      payments: { orderBy: { date: "desc" } },
      retainers: { where: { active: true }, orderBy: { createdAt: "desc" } },
      client: true,
      maintenance: true,
    },
  });

  if (!project) return null;

  const totalExpenses = project.expenses.reduce((s, e) => s + e.amount, 0);
  const totalPaid = project.payments.reduce((s, p) => s + p.amount, 0);
  const remaining = project.price - totalPaid;
  const profit = project.price - totalExpenses;
  const margin = project.price > 0 ? (profit / project.price) * 100 : 0;

  return {
    project,
    totalExpenses,
    totalPaid,
    remaining,
    profit,
    margin,
  };
}
