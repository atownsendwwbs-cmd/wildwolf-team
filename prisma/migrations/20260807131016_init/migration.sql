-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "InventoryCategory" AS ENUM ('FINISHED_GOOD', 'RAW_MATERIAL', 'SUPPLY');

-- CreateEnum
CREATE TYPE "Urgency" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('OPEN', 'RESOLVED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pinHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'EMPLOYEE',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyBrief" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyBrief_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryAlert" (
    "id" TEXT NOT NULL,
    "category" "InventoryCategory" NOT NULL,
    "itemName" TEXT NOT NULL,
    "notes" TEXT,
    "urgency" "Urgency" NOT NULL DEFAULT 'MEDIUM',
    "status" "AlertStatus" NOT NULL DEFAULT 'OPEN',
    "reportedById" TEXT NOT NULL,
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EndOfDayReport" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL,
    "packedItems" TEXT NOT NULL,
    "sortedOutItems" TEXT NOT NULL,
    "notes" TEXT,
    "leftOff" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EndOfDayReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyBrief_date_idx" ON "DailyBrief"("date");

-- CreateIndex
CREATE INDEX "InventoryAlert_status_idx" ON "InventoryAlert"("status");

-- CreateIndex
CREATE INDEX "InventoryAlert_category_idx" ON "InventoryAlert"("category");

-- CreateIndex
CREATE INDEX "EndOfDayReport_date_idx" ON "EndOfDayReport"("date");

-- AddForeignKey
ALTER TABLE "DailyBrief" ADD CONSTRAINT "DailyBrief_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAlert" ADD CONSTRAINT "InventoryAlert_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAlert" ADD CONSTRAINT "InventoryAlert_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EndOfDayReport" ADD CONSTRAINT "EndOfDayReport_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
