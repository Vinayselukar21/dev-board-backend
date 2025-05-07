-- DropForeignKey
ALTER TABLE "WorkspaceMember" DROP CONSTRAINT "WorkspaceMember_departmentId_fkey";

-- AlterTable
ALTER TABLE "CalendarEvent" ADD COLUMN     "createdById" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "icon" TEXT;

-- AlterTable
ALTER TABLE "WorkspaceMember" ALTER COLUMN "departmentId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "MemberWorkspaceRelationship" (
    "id" TEXT NOT NULL,
    "workspaceMemberId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "MemberWorkspaceRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MemberWorkspaceRelationship_workspaceMemberId_workspaceId_key" ON "MemberWorkspaceRelationship"("workspaceMemberId", "workspaceId");

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberWorkspaceRelationship" ADD CONSTRAINT "MemberWorkspaceRelationship_workspaceMemberId_fkey" FOREIGN KEY ("workspaceMemberId") REFERENCES "WorkspaceMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberWorkspaceRelationship" ADD CONSTRAINT "MemberWorkspaceRelationship_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "WorkspaceMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
