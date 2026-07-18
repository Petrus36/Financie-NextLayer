import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export function getDatabaseUrl(): string {
  const url =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL;

  if (!url) {
    throw new Error(
      "Database URL is not set. Add DATABASE_URL (or POSTGRES_PRISMA_URL) in Vercel → Settings → Environment Variables."
    );
  }

  return url;
}

function createPrismaClient() {
  const pool = new Pool({ connectionString: getDatabaseUrl() });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

function getPrismaClient(): PrismaClient {
  const existing = globalForPrisma.prisma;
  // Recreate client after schema changes (dev HMR keeps stale instance)
  if (existing && "firmBalance" in existing) {
    return existing;
  }

  globalForPrisma.prisma = createPrismaClient();
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
