/*
  Warnings:

  - Made the column `organization_id` on table `organization_roles` required. This step will fail if there are existing NULL values in that column.

*/
-- Step 1: Handle foreign key references before cleaning up NULL organization_id values
-- Delete organization_role_permissions for roles with NULL organization_id
DELETE FROM "organization_role_permissions" 
WHERE "organization_role_id" IN (
  SELECT "id" FROM "organization_roles" WHERE "organization_id" IS NULL
);

-- Delete organization_invitations referencing roles with NULL organization_id
-- (organization_role_id is NOT NULL, so we must delete these invitations)
DELETE FROM "organization_invitations" 
WHERE "organization_role_id" IN (
  SELECT "id" FROM "organization_roles" WHERE "organization_id" IS NULL
);

-- Note: organization_managers.organization_role_id has ON DELETE SET NULL,
-- so it will be handled automatically when we delete the organization_roles

-- Step 2: Delete organization_roles with NULL organization_id
-- (organization_invitations and organization_managers have ON DELETE SET NULL, so they'll be handled automatically)
DELETE FROM "organization_roles" 
WHERE "organization_id" IS NULL;

-- Step 3: Now safely make the column NOT NULL
-- DropForeignKey
ALTER TABLE "organization_roles" DROP CONSTRAINT "organization_roles_organization_id_fkey";

-- AlterTable
ALTER TABLE "organization_roles" ALTER COLUMN "organization_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "organization_roles" ADD CONSTRAINT "organization_roles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
