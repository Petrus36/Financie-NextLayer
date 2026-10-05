import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";
import { resolveDatabaseUrl } from "@/lib/env";

const PRISMA_CLIENT_STAMP = 9;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaStamp?: number;
};

export function getDatabaseUrl(): string {
  const url = resolveDatabaseUrl();

  if (!url) {
    throw new Error(
      "Database URL is not set. Add DATABASE_URL (or connect Neon to Vercel) in Environment Variables."
    );
  }

  return url;
}

function createPrismaClient() {
  const pool = new Pool({ connectionString: getDatabaseUrl() });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

function isPrismaClientFresh(client: PrismaClient): boolean {
  return (
    "firmBalance" in client &&
    "bill" in client &&
    "invoice" in client &&
    "internalDocument" in client &&
    "projectMember" in client &&
    "projectPayout" in client &&
    "projectTask" in client
  );
}

function getPrismaClient(): PrismaClient {
  const existing = globalForPrisma.prisma;
  // Recreate client after schema changes (dev HMR keeps stale instance)
  if (
    existing &&
    globalForPrisma.prismaStamp === PRISMA_CLIENT_STAMP &&
    isPrismaClientFresh(existing)
  ) {
    return existing;
  }

  globalForPrisma.prisma = createPrismaClient();
  globalForPrisma.prismaStamp = PRISMA_CLIENT_STAMP;
  return globalForPrisma.prisma;
}

/** Lazy client — avoids crashing at import time during build when env is missing. */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = client[prop as keyof PrismaClient];
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});
