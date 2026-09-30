import { prisma } from "@/lib/prisma";

export async function listInternalDocuments(limit = 20) {
  return prisma.internalDocument.findMany({
    orderBy: { date: "desc" },
    take: limit,
    include: { income: { select: { id: true } } },
  });
}
