import { prisma } from "@/lib/prisma";

export async function listTeamMembers() {
  return prisma.teamMember.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
    include: {
      firmExpenses: {
        select: { amount: true, date: true, type: true, active: true },
      },
    },
  });
}

export async function listActiveTeamMembersForSelect() {
  return prisma.teamMember.findMany({
    where: { active: true },
    select: { id: true, name: true, role: true },
    orderBy: { name: "asc" },
  });
}

export async function getTeamMember(id: string) {
  return prisma.teamMember.findUnique({
    where: { id },
    include: {
      firmExpenses: {
        orderBy: { date: "desc" },
        take: 30,
        include: { client: { select: { id: true, name: true } } },
      },
    },
  });
}

export function sumPaidToTeamMember(
  expenses: { amount: number; type: string; active: boolean }[]
) {
  return expenses.reduce((sum, expense) => {
    if (expense.type === "MONTHLY" && !expense.active) return sum;
    return sum + expense.amount;
  }, 0);
}
