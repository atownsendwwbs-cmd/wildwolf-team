-- CreateTable
CREATE TABLE "TimeOffRequest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "submittedById" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "timeNote" TEXT,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimeOffRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TimeOffRequest_date_idx" ON "TimeOffRequest"("date");

ALTER TABLE "TimeOffRequest" ADD CONSTRAINT "TimeOffRequest_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
