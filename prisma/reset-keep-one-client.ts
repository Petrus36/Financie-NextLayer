/**
 * One-time reset: keep a single client profile, remove all transactions & other clients.
 * Run: npx tsx prisma/reset-keep-one-client.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const connectionString =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL or DATABASE_URL_UNPOOLED is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function clientCompleteness(client: {
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  ico: string | null;
  dic: string | null;
  icDph: string | null;
  address: string | null;
  city: string | null;
  zip: string | null;
  notes: string | null;
}) {
  return [client.name, client.email, client.phone, client.company, client.ico, client.dic, client.icDph, client.address, client.city, client.zip, client.notes].filter(
    (v) => v && String(v).trim()
  ).length;
}

async function main() {
  const clients = await prisma.client.findMany();
  if (clients.length === 0) {
    console.log("No clients in database.");
    return;
  }

  const keep = clients.reduce((best, c) =>
    clientCompleteness(c) > clientCompleteness(best) ? c : best
  );

  console.log(`Keeping client: ${keep.name} (${keep.id})`);
  console.log("Removing all other data…");

  await prisma.$transaction(async (tx) => {
    await tx.internalDocument.deleteMany();
    await tx.firmIncome.deleteMany();
    await tx.firmExpense.deleteMany();
    await tx.bill.deleteMany();

    await tx.firmBalance.upsert({
      where: { id: "main" },
      update: { cardAmount: 0, cashAmount: 0, notes: null },
      create: { id: "main", cardAmount: 0, cashAmount: 0 },
    });

    // Clear activity for kept client (projects, invoices, …)
    await tx.project.deleteMany({ where: { clientId: keep.id } });
    await tx.invoice.deleteMany({ where: { clientId: keep.id } });
    await tx.invoiceTemplate.deleteMany({ where: { clientId: keep.id } });
    await tx.monthlyRetainer.deleteMany({ where: { clientId: keep.id } });

    await tx.client.deleteMany({ where: { id: { not: keep.id } } });
  });

  const left = await prisma.client.count();
  console.log(`Done. Clients remaining: ${left}`);
  console.log("User login and company settings were not changed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
