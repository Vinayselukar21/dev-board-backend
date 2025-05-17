/*
  Warnings:

  - You are about to drop the column `jobTitle` on the `WorkspaceMember` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "designation" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "jobTitle" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "WorkspaceMember" DROP COLUMN "jobTitle";
