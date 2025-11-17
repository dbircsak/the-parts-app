/*
  Warnings:

  - You are about to drop the `Material` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Material";

-- CreateTable
CREATE TABLE "materials" (
    "id" TEXT NOT NULL,
    "partNumber" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "orderedQty" INTEGER NOT NULL,
    "orderedDate" TIMESTAMP(3),
    "unitType" TEXT NOT NULL,
    "receivedQty" INTEGER NOT NULL,
    "receivedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);
