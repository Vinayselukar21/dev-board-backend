-- AlterTable
ALTER TABLE "CalendarEvent" ADD COLUMN     "seriesId" TEXT;

-- CreateTable
CREATE TABLE "CalendarEventSeries" (
    "id" TEXT NOT NULL,

    CONSTRAINT "CalendarEventSeries_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "CalendarEventSeries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
