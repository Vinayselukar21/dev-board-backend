/*
  Warnings:

  - You are about to drop the column `orgRoleId` on the `User` table. All the data in the column will be lost.
  - Made the column `roleId` on table `WorkspaceMember` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrgPermissionType" ADD VALUE 'REMOVE_USER';
ALTER TYPE "OrgPermissionType" ADD VALUE 'CHANGE_USER_ROLE';

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_orgRoleId_fkey";

-- DropForeignKey
ALTER TABLE "WorkspaceMember" DROP CONSTRAINT "WorkspaceMember_roleId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "orgRoleId",
ADD COLUMN     "organizationRoleId" TEXT;

-- AlterTable
ALTER TABLE "WorkspaceMember" ALTER COLUMN "roleId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationRoleId_fkey" FOREIGN KEY ("organizationRoleId") REFERENCES "OrganizationRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "WorkspaceRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
