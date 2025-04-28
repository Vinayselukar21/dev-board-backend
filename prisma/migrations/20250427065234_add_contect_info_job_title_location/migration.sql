-- AlterTable
ALTER TABLE "User" ADD COLUMN     "contactNo" VARCHAR(20) NOT NULL DEFAULT '',
ADD COLUMN     "location" VARCHAR(255) DEFAULT '',
ALTER COLUMN "role" SET DEFAULT 'admin';

-- AlterTable
ALTER TABLE "WorkspaceMember" ADD COLUMN     "jobTitle" TEXT NOT NULL DEFAULT '';
