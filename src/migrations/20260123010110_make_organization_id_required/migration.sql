/*
  Warnings:

  - You are about to alter the column `organization_id` on the `organization_roles` table. The data in that column could be lost. The data in that column will be cast from `Nullable` to `Non-nullable`.
  - Made the column `organization_id` on table `organization_roles` required. This step will fail if there are existing NULL values in that column.

*/
-- Delete any roles with null organizationId
DELETE FROM "organization_roles" WHERE "organization_id" IS NULL;

-- AlterTable
ALTER TABLE "organization_roles" ALTER COLUMN "organization_id" SET NOT NULL;

