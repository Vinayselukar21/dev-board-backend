/*
  Warnings:

  - You are about to drop the `_CalendarEventParticipants` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CalendarEventParticipants" DROP CONSTRAINT "_CalendarEventParticipants_A_fkey";

-- DropForeignKey
ALTER TABLE "_CalendarEventParticipants" DROP CONSTRAINT "_CalendarEventParticipants_B_fkey";

-- DropTable
DROP TABLE "_CalendarEventParticipants";

-- CreateTable
CREATE TABLE "CalendarEventParticipant" (
    "id" TEXT NOT NULL,
    "calendarEventId" TEXT NOT NULL,
    "workspaceMemberId" TEXT NOT NULL,

    CONSTRAINT "CalendarEventParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CalendarEventParticipant_calendarEventId_workspaceMemberId_key" ON "CalendarEventParticipant"("calendarEventId", "workspaceMemberId");

-- AddForeignKey
ALTER TABLE "CalendarEventParticipant" ADD CONSTRAINT "CalendarEventParticipant_calendarEventId_fkey" FOREIGN KEY ("calendarEventId") REFERENCES "CalendarEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEventParticipant" ADD CONSTRAINT "CalendarEventParticipant_workspaceMemberId_fkey" FOREIGN KEY ("workspaceMemberId") REFERENCES "WorkspaceMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
