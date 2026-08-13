-- CreateEnum
CREATE TYPE "ReactionTarget" AS ENUM ('ANNOUNCEMENT', 'BRIEF', 'TASK');

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateTable
CREATE TABLE "Reaction" (
    "id" TEXT NOT NULL,
    "messageType" "ReactionTarget" NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Reaction_messageType_messageId_userId_emoji_key" ON "Reaction"("messageType", "messageId", "userId", "emoji");
CREATE INDEX "Reaction_messageType_messageId_idx" ON "Reaction"("messageType", "messageId");

ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable: User gets an optional department
ALTER TABLE "User" ADD COLUMN "departmentId" TEXT;
CREATE INDEX "User_departmentId_idx" ON "User"("departmentId");
ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable: Task gets an optional department (alternative to assignedToId)
ALTER TABLE "Task" ADD COLUMN "departmentId" TEXT;
CREATE INDEX "Task_departmentId_idx" ON "Task"("departmentId");
ALTER TABLE "Task" ADD CONSTRAINT "Task_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable: Announcement gets mention tracking + edit tracking
ALTER TABLE "Announcement" ADD COLUMN "mentionedUserIds" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Announcement" ADD COLUMN "editedAt" TIMESTAMP(3);

-- AlterTable: DailyBrief gets edit tracking
ALTER TABLE "DailyBrief" ADD COLUMN "editedAt" TIMESTAMP(3);
