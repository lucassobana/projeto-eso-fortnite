/*
  Warnings:

  - You are about to drop the column `addedAt` on the `Cosmetic` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cosmetic" DROP COLUMN "addedAt",
ADD COLUMN     "added" TIMESTAMP(3);
