import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function upsertUser(name: string, pin: string, role: "ADMIN" | "MANAGER" | "EMPLOYEE") {
  const existing = await db.user.findFirst({ where: { name } });
  if (existing) {
    console.log(`Skipping ${name}, already exists.`);
    return;
  }
  const pinHash = await bcrypt.hash(pin, 10);
  await db.user.create({ data: { name, pinHash, role } });
  console.log(`Created ${role} "${name}" with PIN ${pin}`);
}

async function main() {
  await upsertUser("Owner", "1234", "ADMIN");
  await upsertUser("Production Manager", "1111", "MANAGER");
  await upsertUser("Warehouse Employee", "2222", "EMPLOYEE");
  console.log("\nSeed complete. Sign in and change these PINs from Admin > Team.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
