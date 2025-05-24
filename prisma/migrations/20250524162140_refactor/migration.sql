/*
  Warnings:

  - You are about to drop the column `permissionId` on the `OrgRolePermission` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `OrgRolePermission` table. All the data in the column will be lost.
  - You are about to drop the column `permissionId` on the `WorkspaceRolePermission` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `WorkspaceRolePermission` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[orgPermissionId,organizationRoleId]` on the table `OrgRolePermission` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workspaceRoleId,workspacePermissionId]` on the table `WorkspaceRolePermission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orgPermissionId` to the `OrgRolePermission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationRoleId` to the `OrgRolePermission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspacePermissionId` to the `WorkspaceRolePermission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceRoleId` to the `WorkspaceRolePermission` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OrgRolePermission" DROP CONSTRAINT "OrgRolePermission_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "OrgRolePermission" DROP CONSTRAINT "OrgRolePermission_roleId_fkey";

-- DropForeignKey
ALTER TABLE "WorkspaceRolePermission" DROP CONSTRAINT "WorkspaceRolePermission_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "WorkspaceRolePermission" DROP CONSTRAINT "WorkspaceRolePermission_roleId_fkey";

-- DropIndex
DROP INDEX "OrgRolePermission_permissionId_roleId_key";

-- DropIndex
DROP INDEX "WorkspaceRolePermission_permissionId_roleId_key";

-- AlterTable
ALTER TABLE "OrgRolePermission" DROP COLUMN "permissionId",
DROP COLUMN "roleId",
ADD COLUMN     "orgPermissionId" TEXT NOT NULL,
ADD COLUMN     "organizationRoleId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WorkspaceRolePermission" DROP COLUMN "permissionId",
DROP COLUMN "roleId",
ADD COLUMN     "workspacePermissionId" TEXT NOT NULL,
ADD COLUMN     "workspaceRoleId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "OrgRolePermission_orgPermissionId_organizationRoleId_key" ON "OrgRolePermission"("orgPermissionId", "organizationRoleId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceRolePermission_workspaceRoleId_workspacePermission_key" ON "WorkspaceRolePermission"("workspaceRoleId", "workspacePermissionId");

-- AddForeignKey
ALTER TABLE "WorkspaceRolePermission" ADD CONSTRAINT "WorkspaceRolePermission_workspaceRoleId_fkey" FOREIGN KEY ("workspaceRoleId") REFERENCES "WorkspaceRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceRolePermission" ADD CONSTRAINT "WorkspaceRolePermission_workspacePermissionId_fkey" FOREIGN KEY ("workspacePermissionId") REFERENCES "WorkspacePermission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgRolePermission" ADD CONSTRAINT "OrgRolePermission_organizationRoleId_fkey" FOREIGN KEY ("organizationRoleId") REFERENCES "OrganizationRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgRolePermission" ADD CONSTRAINT "OrgRolePermission_orgPermissionId_fkey" FOREIGN KEY ("orgPermissionId") REFERENCES "OrgPermission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
