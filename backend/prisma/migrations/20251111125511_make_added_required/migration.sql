/*
  Warnings:

  - Made the column `added` on table `Cosmetic` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Cosmetic" ALTER COLUMN "added" SET NOT NULL;
