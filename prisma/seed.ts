import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client.js";

const dbUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";

const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash("admin123", 12);

  await prisma.user.upsert({
    where: { email: "admin@nextlayer.studio" },
    update: {},
    create: {
      email: "admin@nextlayer.studio",
      name: "Admin",
      password,
    },
  });

  console.log("Seed completed!");
  console.log("Login: admin@nextlayer.studio / admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
