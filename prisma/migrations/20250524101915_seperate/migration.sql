/*
  Warnings:

  - You are about to drop the column `roleId` on the `OrgPermission` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `WorkspacePermission` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrgPermission" DROP CONSTRAINT "OrgPermission_roleId_fkey";

-- DropForeignKey
ALTER TABLE "WorkspacePermission" DROP CONSTRAINT "WorkspacePermission_roleId_fkey";

-- AlterTable
ALTER TABLE "OrgPermission" DROP COLUMN "roleId";

-- AlterTable
ALTER TABLE "WorkspacePermission" DROP COLUMN "roleId";

-- AddForeignKey
ALTER TABLE "WorkspacePermission" ADD CONSTRAINT "WorkspacePermission_id_fkey" FOREIGN KEY ("id") REFERENCES "WorkspaceRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgPermission" ADD CONSTRAINT "OrgPermission_id_fkey" FOREIGN KEY ("id") REFERENCES "OrganizationRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
