import {
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  eachDayOfInterval,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from "date-fns";
import { prisma } from "@/lib/prisma";
import { calcRecurringMonthlyTotal } from "@/lib/retainers";
import {
  type StatisticsPeriod,
  getPeriodBounds,
  isSingleMonthPeriod,
} from "@/lib/statistics-period";
import { firmExpenseAmountInPeriod } from "@/lib/firm-expense-period";

export async function getStatistics(period: StatisticsPeriod) {
  const { start, end } = getPeriodBounds(period);
  const singleMonth = isSingleMonthPeriod(start, end);
  const recurringMonthFlag = singleMonth ? 1 : undefined;

  const [
    deliveredProjects,
    projectExpenses,
    firmExpenses,
    firmIncomes,
    maintenanceContracts,
    monthlyRetainers,
    retainerDeliveries,
    invoices,
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
      select: { amount: true, date: true, invoiceId: true, category: true },
    }),
    prisma.maintenanceContract.findMany({
      where: { active: true },
      include: { client: true, project: true },
    }),
    prisma.monthlyRetainer.findMany({
      where: { active: true },
      include: { client: true, project: true },
    }),
    prisma.retainerDelivery.findMany({
      where: { date: { gte: start, lte: end } },
      select: { amount: true, date: true },
    }),
    prisma.invoice.findMany({
      where: { status: { not: "CANCELLED" } },
      select: {
        total: true,
        status: true,
        dueAt: true,
        issuedAt: true,
        paidAt: true,
      },
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
    recurringMonthFlag
  );

  const retainerRevenue = retainerDeliveries.reduce((sum, d) => sum + d.amount, 0);

  const invoiceRevenue = firmIncomes
    .filter((i) => i.invoiceId)
    .reduce((sum, i) => sum + i.amount, 0);
  const internalDocumentIncome = firmIncomes
    .filter((i) => !i.invoiceId && i.category === "Interný doklad")
    .reduce((sum, i) => sum + i.amount, 0);
  const firmIncomeTotal = firmIncomes
    .filter((i) => !i.invoiceId && i.category !== "Interný doklad")
    .reduce((sum, i) => sum + i.amount, 0);
  const totalIncome =
    totalProjectRevenue +
    maintenanceRevenue +
    retainerRevenue +
    invoiceRevenue +
    internalDocumentIncome +
    firmIncomeTotal;

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

    if (singleMonth) {
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
  const margin = totalIncome > 0 ? (profit / totalIncome) * 100 : 0;

  const expenseByCategoryMap = new Map<string, number>();
  for (const expense of firmExpenses) {
    const amount = firmExpenseAmountInPeriod(expense, start, end, singleMonth);
    if (amount <= 0) continue;
    const label = expense.category?.trim() || "Bez kategórie";
    expenseByCategoryMap.set(label, (expenseByCategoryMap.get(label) ?? 0) + amount);
  }
  const expenseByCategory = [...expenseByCategoryMap.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const issuedInvoices = invoices.filter((invoice) =>
    isWithinInterval(invoice.issuedAt, { start, end })
  );
  const invoiceIssuedTotal = issuedInvoices.reduce((sum, i) => sum + i.total, 0);
  const invoiceIssuedCount = issuedInvoices.length;
  const outstandingInvoices = invoices.filter(
    (invoice) => invoice.status === "DRAFT" || invoice.status === "SENT"
  );
  const invoiceOutstanding = outstandingInvoices.reduce((sum, i) => sum + i.total, 0);
  const overdueInvoices = outstandingInvoices.filter(
    (invoice) => invoice.status === "SENT" && new Date(invoice.dueAt) < new Date()
  );
  const invoiceOverdue = overdueInvoices.reduce((sum, i) => sum + i.total, 0);

  const spansMultipleYears = start.getFullYear() !== end.getFullYear();

  const monthlyBreakdown = !singleMonth
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

          const monthRetainers = retainerDeliveries
            .filter((d) => isWithinInterval(d.date, { start: mStart, end: mEnd }))
            .reduce((s, d) => s + d.amount, 0);

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
            label: new Intl.DateTimeFormat("sk-SK", {
              month: "short",
              ...(spansMultipleYears ? { year: "2-digit" } : {}),
            }).format(month),
            income,
            expenses: monthProjectExpenses + monthFirmExpenses,
            profit: income - monthProjectExpenses - monthFirmExpenses,
          };
        })
      : [];

  const dailyBreakdown = singleMonth
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

          const dayRetainers = retainerDeliveries
            .filter((d) => isWithinInterval(d.date, { start: dStart, end: dEnd }))
            .reduce((s, d) => s + d.amount, 0);

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

  const chartBreakdown = singleMonth ? dailyBreakdown : monthlyBreakdown;

  return {
    totalIncome,
    totalExpenses,
    profit,
    projectRevenue: totalProjectRevenue,
    maintenanceRevenue,
    retainerRevenue,
    invoiceRevenue,
    invoiceIssuedTotal,
    invoiceIssuedCount,
    invoiceOutstanding,
    invoiceOverdue,
    invoiceOverdueCount: overdueInvoices.length,
    unpaidInvoiceCount: outstandingInvoices.length,
    margin,
    firmIncomeTotal,
    internalDocumentIncome,
    projectExpenseTotal,
    firmExpenseTotal,
    expenseByCategory,
    deliveredProjectsCount: deliveredProjects.length,
    activeMaintenanceCount: maintenanceContracts.length,
    activeRetainerCount: monthlyRetainers.length,
    monthlyBreakdown,
    dailyBreakdown,
    chartBreakdown,
    recentDelivered: deliveredProjects.slice(0, 5),
  };
}

export async function getDashboardOverview() {
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());

  const [
    clientCount,
    activeProjects,
    deliveredProjects,
    activeMaintenance,
    unpaidInvoices,
    internalDocsThisMonth,
    recentInternalDocs,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.project.count({ where: { status: "ACTIVE" } }),
    prisma.project.count({ where: { status: "DELIVERED" } }),
    prisma.maintenanceContract.count({ where: { active: true } }),
    prisma.invoice.findMany({
      where: { status: { in: ["DRAFT", "SENT"] } },
      include: { client: true },
      orderBy: { dueAt: "asc" },
      take: 6,
    }),
    prisma.internalDocument.findMany({
      where: {
        date: { gte: monthStart, lte: monthEnd },
        countAsIncome: true,
      },
      select: { amount: true },
    }),
    prisma.internalDocument.findMany({
      orderBy: { date: "desc" },
      take: 5,
      include: { client: { select: { id: true, name: true } } },
    }),
  ]);

  const unpaidTotal = unpaidInvoices.reduce((s, i) => s + i.total, 0);
  const internalDocumentIncomeThisMonth = internalDocsThisMonth.reduce(
    (s, d) => s + d.amount,
    0
  );

  return {
    clientCount,
    activeProjects,
    deliveredProjects,
    activeMaintenance,
    unpaidInvoices,
    unpaidTotal,
    internalDocumentIncomeThisMonth,
    recentInternalDocs,
  };
}

export async function getProjectSummary(projectId: string) {
  const monthStart = startOfMonth(new Date());

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      expenses: true,
      payments: { orderBy: { date: "desc" } },
      retainers: {
        orderBy: [{ active: "desc" }, { createdAt: "desc" }],
        include: {
          deliveries: {
            where: { date: { gte: monthStart } },
            select: { amount: true },
          },
        },
      },
      client: true,
      maintenance: true,
      members: {
        orderBy: { createdAt: "asc" },
        include: { payouts: { orderBy: { date: "desc" } } },
      },
      payouts: { orderBy: { date: "desc" }, include: { member: true } },
      tasks: { orderBy: { createdAt: "asc" } },
      invoices: { orderBy: { issuedAt: "desc" }, take: 8 },
    },
  });

  if (!project) return null;

  const totalExpenses = project.expenses.reduce((s, e) => s + e.amount, 0);
  const totalPayouts = project.payouts.reduce((s, p) => s + p.amount, 0);
  const totalPaid = project.payments.reduce((s, p) => s + p.amount, 0);
  const remaining = project.price - totalPaid;
  const costs = totalExpenses + totalPayouts;
  const profit = project.price - costs;
  const realized = totalPaid - costs;
  const margin = project.price > 0 ? (profit / project.price) * 100 : 0;

  return {
    project,
    totalExpenses,
    totalPayouts,
    totalPaid,
    remaining,
    costs,
    profit,
    realized,
    margin,
  };
}
