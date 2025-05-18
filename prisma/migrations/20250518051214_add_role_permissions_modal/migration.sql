/*
  Warnings:

  - You are about to drop the column `role` on the `WorkspaceMember` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PermissionType" AS ENUM ('VIEW_PROJECT', 'ALL_PROJECT', 'CREATE_PROJECT', 'EDIT_PROJECT', 'DELETE_PROJECT', 'VIEW_TASK', 'ALL_TASK', 'CREATE_TASK', 'EDIT_ANY_TASK', 'DELETE_TASK', 'ADD_MEMBER', 'REMOVE_MEMBER', 'CHANGE_MEMBER_ROLE', 'CREATE_EVENT', 'EDIT_EVENT', 'EDIT_ANY_EVENT', 'DELETE_EVENT');

-- CreateEnum
CREATE TYPE "OrgPermissionType" AS ENUM ('OWNER', 'VIEW_ORG', 'ONBOARD_USER', 'VIEW_WORKSPACE', 'CREATE_WORKSPACE', 'EDIT_WORKSPACE', 'DELETE_WORKSPACE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "orgRoleId" TEXT DEFAULT 'viewer';

-- AlterTable
ALTER TABLE "WorkspaceMember" DROP COLUMN "role",
ADD COLUMN     "roleId" TEXT;

-- CreateTable
CREATE TABLE "WorkspaceRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "WorkspaceRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspacePermission" (
    "id" TEXT NOT NULL,
    "type" "PermissionType" NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "WorkspacePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,

    CONSTRAINT "OrganizationRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgPermission" (
    "id" TEXT NOT NULL,
    "type" "OrgPermissionType" NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "OrgPermission_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_orgRoleId_fkey" FOREIGN KEY ("orgRoleId") REFERENCES "OrganizationRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "WorkspaceRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspacePermission" ADD CONSTRAINT "WorkspacePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "WorkspaceRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgPermission" ADD CONSTRAINT "OrgPermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "OrganizationRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
