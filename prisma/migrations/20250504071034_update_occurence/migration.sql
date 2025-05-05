/*
  Warnings:

  - You are about to drop the column `occurrence` on the `CalendarEvent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CalendarEvent" DROP COLUMN "occurrence",
ADD COLUMN     "occurence" TEXT NOT NULL DEFAULT 'single';
