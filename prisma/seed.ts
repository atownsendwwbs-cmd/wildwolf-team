import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function upsertUser(name: string, role: "ADMIN" | "MANAGER" | "EMPLOYEE", pin: string) {
  const existing = await db.user.findFirst({ where: { name } });
  if (existing) {
    console.log(`Skipping ${name}, already exists.`);
    return;
  }
  const pinHash = await bcrypt.hash(pin, 10);
  await db.user.create({ data: { name, role, pinHash } });
  console.log(`Created ${role} "${name}" with PIN ${pin}`);
}

async function main() {
  await upsertUser("Alec Townsend", "ADMIN", "1299");
  await upsertUser("Desire", "MANAGER", "1111");
  await upsertUser("Susy", "MANAGER", "2222");
  await upsertUser("Cynthia", "MANAGER", "3333");
  await upsertUser("Chris", "ADMIN", "4444");
  await upsertUser("Keiclyn", "EMPLOYEE", "5555");
  console.log("\nSeed complete. Change these PINs from Team once you're set up.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
