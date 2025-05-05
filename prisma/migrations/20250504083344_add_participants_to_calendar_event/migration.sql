-- CreateTable
CREATE TABLE "_CalendarEventParticipants" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CalendarEventParticipants_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CalendarEventParticipants_B_index" ON "_CalendarEventParticipants"("B");

-- AddForeignKey
ALTER TABLE "_CalendarEventParticipants" ADD CONSTRAINT "_CalendarEventParticipants_A_fkey" FOREIGN KEY ("A") REFERENCES "CalendarEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CalendarEventParticipants" ADD CONSTRAINT "_CalendarEventParticipants_B_fkey" FOREIGN KEY ("B") REFERENCES "WorkspaceMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
