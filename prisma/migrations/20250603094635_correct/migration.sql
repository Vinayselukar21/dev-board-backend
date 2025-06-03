/*
  Warnings:

  - You are about to drop the column `occurence` on the `CalendarEvent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CalendarEvent" DROP COLUMN "occurence",
ADD COLUMN     "occurrence" TEXT NOT NULL DEFAULT 'single';
