/*
  Warnings:

  - You are about to drop the column `workspaceId` on the `WorkspacePermission` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "WorkspacePermission" DROP CONSTRAINT "WorkspacePermission_workspaceId_fkey";

-- AlterTable
ALTER TABLE "WorkspacePermission" DROP COLUMN "workspaceId",
ADD COLUMN     "organizationId" TEXT;

-- AddForeignKey
ALTER TABLE "WorkspacePermission" ADD CONSTRAINT "WorkspacePermission_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
