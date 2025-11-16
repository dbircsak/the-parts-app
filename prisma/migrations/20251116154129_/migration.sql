/*
  Warnings:

  - The `status` column on the `work_queue` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "work_queue" DROP CONSTRAINT "work_queue_roNumber_fkey";

-- AlterTable
ALTER TABLE "work_queue" DROP COLUMN "status",
ADD COLUMN     "status" "WorkQueueStatus" NOT NULL DEFAULT 'NOT_STARTED';

-- AddForeignKey
ALTER TABLE "work_queue" ADD CONSTRAINT "work_queue_roNumber_fkey" FOREIGN KEY ("roNumber") REFERENCES "daily_out"("roNumber") ON DELETE CASCADE ON UPDATE CASCADE;
