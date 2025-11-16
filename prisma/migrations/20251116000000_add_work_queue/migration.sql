-- CreateTable WorkQueue
CREATE TABLE "work_queue" (
    "roNumber" INTEGER NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "departmentCode" CHAR(1) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_queue_pkey" PRIMARY KEY ("roNumber"),
    CONSTRAINT "work_queue_roNumber_fkey" FOREIGN KEY ("roNumber") REFERENCES "daily_out" ("roNumber") ON DELETE CASCADE
);

-- CreateEnum WorkQueueStatus
CREATE TYPE "WorkQueueStatus" AS ENUM ('NOT_STARTED', 'UNDERWAY', 'COMPLETED');

-- AddCheckConstraint
ALTER TABLE "work_queue" ADD CONSTRAINT "work_queue_status_check" CHECK (status IN ('NOT_STARTED', 'UNDERWAY', 'COMPLETED'));

-- CreateIndex
CREATE UNIQUE INDEX "work_queue_roNumber_key" ON "work_queue"("roNumber");
