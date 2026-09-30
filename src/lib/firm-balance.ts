import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const BALANCE_ID = "main";

/** Adjust „V hotovosti“ when recording cash internal income (interný doklad). */
export async function adjustFirmCashInTransaction(
  tx: Prisma.TransactionClient,
  delta: number
) {
  await tx.firmBalance.upsert({
    where: { id: BALANCE_ID },
    update: { cashAmount: { increment: delta } },
    create: { id: BALANCE_ID, cashAmount: delta },
  });
}

export async function getFirmBalance() {
  return prisma.firmBalance.upsert({
    where: { id: BALANCE_ID },
    update: {},
    create: { id: BALANCE_ID },
  });
}

/** Simple all-time totals from recorded transactions (for bank reconciliation hint). */
export async function getRecordedFinanceTotals() {
  const [
    payments,
    firmIncomes,
    projectExpenses,
    firmExpensesOneTime,
    maintenance,
    retainers,
    retainerDeliveries,
  ] = await Promise.all([
    prisma.projectPayment.aggregate({ _sum: { amount: true } }),
    prisma.firmIncome.aggregate({ _sum: { amount: true } }),
    prisma.projectExpense.aggregate({ _sum: { amount: true } }),
    prisma.firmExpense.aggregate({
      where: { type: "ONE_TIME" },
      _sum: { amount: true },
    }),
    prisma.maintenanceContract.findMany({ where: { active: true } }),
    prisma.monthlyRetainer.findMany({ where: { active: true } }),
    prisma.retainerDelivery.aggregate({ _sum: { amount: true } }),
  ]);

  const totalIncome =
    (payments._sum.amount ?? 0) +
    (firmIncomes._sum.amount ?? 0) +
    (retainerDeliveries._sum.amount ?? 0);

  const totalExpenses =
    (projectExpenses._sum.amount ?? 0) +
    (firmExpensesOneTime._sum.amount ?? 0);

  const monthlyRecurring =
    maintenance.reduce((s, m) => s + m.monthlyAmount, 0) +
    retainers.reduce((s, r) => s + r.monthlyAmount, 0);

  const netRecorded = totalIncome - totalExpenses;

  return {
    totalIncome,
    totalExpenses,
    netRecorded,
    monthlyRecurring,
  };
}

export async function getOverallFinances() {
  const [balance, recorded] = await Promise.all([
    getFirmBalance(),
    getRecordedFinanceTotals(),
  ]);

  const totalLiquid = balance.cardAmount + balance.cashAmount;
  const difference = totalLiquid - recorded.netRecorded;

  return {
    balance,
    totalLiquid,
    recorded,
    difference,
  };
}
