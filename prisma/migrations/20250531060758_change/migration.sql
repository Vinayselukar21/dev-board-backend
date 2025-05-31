-- DropForeignKey
ALTER TABLE "_AssignedTasks" DROP CONSTRAINT "_AssignedTasks_A_fkey";

-- DropForeignKey
ALTER TABLE "_AssignedTasks" DROP CONSTRAINT "_AssignedTasks_B_fkey";

-- AddForeignKey
ALTER TABLE "_AssignedTasks" ADD CONSTRAINT "_AssignedTasks_A_fkey" FOREIGN KEY ("A") REFERENCES "ProjectMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssignedTasks" ADD CONSTRAINT "_AssignedTasks_B_fkey" FOREIGN KEY ("B") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
