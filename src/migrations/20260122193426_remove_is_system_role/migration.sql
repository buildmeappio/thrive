/*
  Warnings:

  - You are about to drop the column `is_system_role` on the `organization_roles` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "organization_roles_name_is_system_role_idx";

-- AlterTable
ALTER TABLE "organization_roles" DROP COLUMN "is_system_role";

-- CreateIndex
CREATE INDEX "organization_roles_name_idx" ON "organization_roles"("name");
