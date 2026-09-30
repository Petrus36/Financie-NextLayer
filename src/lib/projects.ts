import type { ProjectStage } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const PROJECT_STAGES = [
  "INQUIRY",
  "PLANNING",
  "IN_PROGRESS",
  "REVIEW",
  "DELIVERED",
  "PAUSED",
  "CANCELLED",
] as const satisfies ProjectStage[];

export const PROJECT_STAGE_LABEL: Record<ProjectStage, string> = {
  INQUIRY: "Dopyt",
  PLANNING: "Plánovanie",
  IN_PROGRESS: "V procese",
  REVIEW: "Kontrola",
  DELIVERED: "Odovzdané",
  PAUSED: "Pozastavené",
  CANCELLED: "Zrušené",
};

export const PROJECT_MEMBER_ROLES = [
  "Strihanie videa",
  "Grafika",
  "Kamera",
  "Produkcia",
  "Režia",
  "Project manager",
  "Iné",
] as const;

export function isClosedStage(stage: ProjectStage) {
  return stage === "DELIVERED" || stage === "CANCELLED";
}

export function projectFinance(input: {
  price: number;
  payments: { amount: number }[];
  expenses: { amount: number }[];
  payouts: { amount: number }[];
}) {
  const received = input.payments.reduce((sum, item) => sum + item.amount, 0);
  const expenseTotal = input.expenses.reduce((sum, item) => sum + item.amount, 0);
  const payoutTotal = input.payouts.reduce((sum, item) => sum + item.amount, 0);
  const costs = expenseTotal + payoutTotal;
  const remaining = input.price - received;
  const realized = received - costs;
  const expected = input.price - costs;
  const collectPct = input.price > 0 ? (received / input.price) * 100 : 0;

  return {
    received,
    expenseTotal,
    payoutTotal,
    costs,
    remaining,
    realized,
    expected,
    collectPct,
  };
}

export async function listManagedProjects() {
  return prisma.project.findMany({
    include: {
      client: { select: { id: true, name: true, company: true } },
      payments: { select: { amount: true } },
      expenses: { select: { amount: true } },
      payouts: { select: { amount: true } },
      members: { select: { id: true } },
      tasks: { select: { done: true } },
    },
    orderBy: [{ stage: "asc" }, { updatedAt: "desc" }],
  });
}

export async function getManagedProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      client: true,
      payments: { orderBy: { date: "desc" } },
      expenses: { orderBy: { date: "desc" } },
      members: {
        orderBy: { createdAt: "asc" },
        include: { payouts: { orderBy: { date: "desc" } } },
      },
      payouts: { orderBy: { date: "desc" }, include: { member: true } },
      tasks: { orderBy: { createdAt: "asc" } },
      invoices: { orderBy: { issuedAt: "desc" }, take: 8 },
      maintenance: true,
      retainers: {
        orderBy: [{ active: "desc" }, { createdAt: "desc" }],
        include: {
          deliveries: { select: { amount: true, date: true } },
        },
      },
    },
  });
}
