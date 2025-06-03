-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrgPermissionType" ADD VALUE 'CREATE_CUSTOM_ORG_ROLE';
ALTER TYPE "OrgPermissionType" ADD VALUE 'EDIT_CUSTOM_ORG_ROLE';
ALTER TYPE "OrgPermissionType" ADD VALUE 'DELETE_CUSTOM_ORG_ROLE';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PermissionType" ADD VALUE 'CREATE_CUSTOM_WORKSPACE_ROLE';
ALTER TYPE "PermissionType" ADD VALUE 'EDIT_CUSTOM_WORKSPACE_ROLE';
ALTER TYPE "PermissionType" ADD VALUE 'DELETE_CUSTOM_WORKSPACE_ROLE';
