/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `OrganizationRole` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `WorkspaceRole` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "OrganizationRole_name_key" ON "OrganizationRole"("name");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceRole_name_key" ON "WorkspaceRole"("name");
