/*
  Warnings:

  - Made the column `journalId` on table `JournalEntry` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "JournalEntry" ALTER COLUMN "journalId" SET NOT NULL;
