import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function upsertUser(name: string, role: "ADMIN" | "MANAGER" | "EMPLOYEE") {
  const existing = await db.user.findFirst({ where: { name } });
  if (existing) {
    console.log(`Skipping ${name}, already exists.`);
    return;
  }
  await db.user.create({ data: { name, role } });
  console.log(`Created ${role} "${name}"`);
}

async function main() {
  await upsertUser("Owner", "ADMIN");
  await upsertUser("Desire", "MANAGER");
  await upsertUser("Susy", "MANAGER");
  await upsertUser("Cynthia", "MANAGER");
  await upsertUser("Alec", "ADMIN");
  await upsertUser("Chris", "ADMIN");
  await upsertUser("Keiclyn", "EMPLOYEE");
  console.log(
    "\nSeed complete. Sign in as Owner (rename it from Team if you'd like), and adjust roles for anyone above from Team."
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
