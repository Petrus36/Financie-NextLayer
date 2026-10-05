import { prisma } from "@/lib/prisma";
import { firmExpenseAmountInPeriod } from "@/lib/firm-expense-period";
import { isSingleMonthPeriod } from "@/lib/statistics-period";

export async function getClientPeriodEconomics(
  clientId: string,
  start: Date,
  end: Date
) {
  const singleMonth = isSingleMonthPeriod(start, end);

  const [paidInvoices, internalDocs, firmExpenses, projectExpenses] =
    await Promise.all([
      prisma.invoice.findMany({
        where: {
          clientId,
          status: "PAID",
          paidAt: { gte: start, lte: end },
        },
        select: { total: true, paidAt: true, number: true },
      }),
      prisma.internalDocument.findMany({
        where: {
          clientId,
          date: { gte: start, lte: end },
        },
        orderBy: { date: "desc" },
      }),
      prisma.firmExpense.findMany({
        where: { clientId },
      }),
      prisma.projectExpense.findMany({
        where: {
          project: { clientId },
          date: { gte: start, lte: end },
        },
        include: { project: { select: { title: true } } },
        orderBy: { date: "desc" },
      }),
    ]);

  const invoiceIncome = paidInvoices.reduce((s, i) => s + i.total, 0);
  const internalIncome = internalDocs.reduce((s, d) => s + d.amount, 0);
  const incomeTotal = invoiceIncome + internalIncome;

  const firmExpenseTotal = firmExpenses.reduce(
    (s, e) => s + firmExpenseAmountInPeriod(e, start, end, singleMonth),
    0
  );
  const projectExpenseTotal = projectExpenses.reduce((s, e) => s + e.amount, 0);
  const costTotal = firmExpenseTotal + projectExpenseTotal;

  const firmExpensesInPeriod = firmExpenses
    .map((expense) => ({
      expense,
      amountInPeriod: firmExpenseAmountInPeriod(
        expense,
        start,
        end,
        singleMonth
      ),
    }))
    .filter((row) => row.amountInPeriod > 0)
    .sort(
      (a, b) =>
        new Date(b.expense.date).getTime() - new Date(a.expense.date).getTime()
    );

  return {
    incomeTotal,
    invoiceIncome,
    internalIncome,
    costTotal,
    firmExpenseTotal,
    projectExpenseTotal,
    balance: incomeTotal - costTotal,
    paidInvoices,
    internalDocs,
    firmExpensesInPeriod,
    projectExpenses,
  };
}

export function listClientsForExpenseForm() {
  return prisma.client.findMany({
    select: { id: true, name: true, company: true },
    orderBy: { name: "asc" },
  });
}
