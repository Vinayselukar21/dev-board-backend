/*
  Warnings:

  - Added the required column `repeatEvery` to the `CalendarEventSeries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `repeatFor` to the `CalendarEventSeries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seriesEndDate` to the `CalendarEventSeries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seriesStartDate` to the `CalendarEventSeries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `CalendarEventSeries` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CalendarEventSeries" ADD COLUMN     "repeatEvery" INTEGER NOT NULL,
ADD COLUMN     "repeatFor" TEXT NOT NULL,
ADD COLUMN     "seriesEndDate" TEXT NOT NULL,
ADD COLUMN     "seriesStartDate" TEXT NOT NULL,
ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "CalendarEventSeries" ADD CONSTRAINT "CalendarEventSeries_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
