/*
  Warnings:

  - You are about to drop the column `type` on the `OrgPermission` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `WorkspacePermission` table. All the data in the column will be lost.
  - Added the required column `name` to the `OrgPermission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `WorkspacePermission` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OrgPermission" DROP CONSTRAINT "OrgPermission_id_fkey";

-- DropForeignKey
ALTER TABLE "WorkspacePermission" DROP CONSTRAINT "WorkspacePermission_id_fkey";

-- AlterTable
ALTER TABLE "OrgPermission" DROP COLUMN "type",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "WorkspacePermission" DROP COLUMN "type",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "workspaceId" TEXT;

-- CreateTable
CREATE TABLE "WorkspaceRolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "WorkspaceRolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgRolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "OrgRolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceRolePermission_permissionId_roleId_key" ON "WorkspaceRolePermission"("permissionId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgRolePermission_permissionId_roleId_key" ON "OrgRolePermission"("permissionId", "roleId");

-- AddForeignKey
ALTER TABLE "WorkspacePermission" ADD CONSTRAINT "WorkspacePermission_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceRolePermission" ADD CONSTRAINT "WorkspaceRolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "WorkspaceRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceRolePermission" ADD CONSTRAINT "WorkspaceRolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "WorkspacePermission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgPermission" ADD CONSTRAINT "OrgPermission_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgRolePermission" ADD CONSTRAINT "OrgRolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "OrganizationRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgRolePermission" ADD CONSTRAINT "OrgRolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "OrgPermission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
