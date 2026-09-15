-- CreateTable
CREATE TABLE "WarehouseReport" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL,
    "shipments" TEXT,
    "rackChanges" TEXT,
    "cleaning" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WarehouseReport_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WarehouseReport_date_idx" ON "WarehouseReport"("date");

ALTER TABLE "WarehouseReport" ADD CONSTRAINT "WarehouseReport_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
