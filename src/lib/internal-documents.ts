import { prisma } from "@/lib/prisma";

export async function listInternalDocuments(limit = 100) {
  return prisma.internalDocument.findMany({
    orderBy: { date: "desc" },
    take: limit,
    include: {
      income: { select: { id: true } },
      client: { select: { id: true, name: true, company: true } },
    },
  });
}

export async function sumClientInternalPayments(clientId: string) {
  const result = await prisma.internalDocument.aggregate({
    where: { clientId },
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0;
}

export async function listClientsForInternalDocumentForm() {
  return prisma.client.findMany({
    select: { id: true, name: true, company: true },
    orderBy: { name: "asc" },
  });
}
