/*
  Warnings:

  - The primary key for the `group_members` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `user_id` on the `group_members` table. All the data in the column will be lost.
  - You are about to drop the column `created_by_user_id` on the `groups` table. All the data in the column will be lost.
  - You are about to drop the column `accepted_by` on the `organization_invitations` table. All the data in the column will be lost.
  - You are about to drop the column `invited_by` on the `organization_invitations` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `organization_invitations` table. All the data in the column will be lost.
  - The primary key for the `user_location_memberships` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `user_id` on the `user_location_memberships` table. All the data in the column will be lost.
  - You are about to drop the column `granted_by_user_id` on the `user_role_grants` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `user_role_grants` table. All the data in the column will be lost.
  - You are about to drop the `role_permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_primary_roles` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[organization_id,email,organization_role_id]` on the table `organization_invitations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organization_id,key]` on the table `permissions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `organization_manager_id` to the `group_members` table without a default value. This is not possible if the table is not empty.
  - Made the column `organization_role_id` on table `organization_invitations` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `organization_manager_id` to the `user_location_memberships` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_manager_id` to the `user_role_grants` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "group_members" DROP CONSTRAINT "group_members_user_id_fkey";

-- DropForeignKey
ALTER TABLE "groups" DROP CONSTRAINT "groups_created_by_user_id_fkey";

-- DropForeignKey
ALTER TABLE "groups" DROP CONSTRAINT "groups_role_id_fkey";

-- DropForeignKey
ALTER TABLE "organization_invitations" DROP CONSTRAINT "organization_invitations_organization_role_id_fkey";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_permission_id_fkey";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_role_id_fkey";

-- DropForeignKey
ALTER TABLE "user_location_memberships" DROP CONSTRAINT "user_location_memberships_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_primary_roles" DROP CONSTRAINT "user_primary_roles_primary_role_id_fkey";

-- DropForeignKey
ALTER TABLE "user_primary_roles" DROP CONSTRAINT "user_primary_roles_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_role_grants" DROP CONSTRAINT "user_role_grants_granted_by_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_role_grants" DROP CONSTRAINT "user_role_grants_role_id_fkey";

-- DropForeignKey
ALTER TABLE "user_role_grants" DROP CONSTRAINT "user_role_grants_user_id_fkey";

-- DropIndex
DROP INDEX "group_members_user_id_idx";

-- DropIndex
DROP INDEX "organization_invitations_organization_id_email_role_key";

-- DropIndex
DROP INDEX "permissions_key_key";

-- DropIndex
DROP INDEX "user_role_grants_user_id_idx";

-- AlterTable
ALTER TABLE "group_members" DROP CONSTRAINT "group_members_pkey",
DROP COLUMN "user_id",
ADD COLUMN     "organization_manager_id" UUID NOT NULL,
ADD CONSTRAINT "group_members_pkey" PRIMARY KEY ("group_id", "organization_manager_id");

-- AlterTable
ALTER TABLE "groups" DROP COLUMN "created_by_user_id",
ADD COLUMN     "created_by_manager_id" UUID;

-- AlterTable
ALTER TABLE "organization_invitations" DROP COLUMN "accepted_by",
DROP COLUMN "invited_by",
DROP COLUMN "role",
ADD COLUMN     "accepted_by_manager_id" UUID,
ADD COLUMN     "invited_by_manager_id" UUID,
ALTER COLUMN "organization_role_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "permissions" ADD COLUMN     "organization_id" UUID;

-- AlterTable
ALTER TABLE "user_location_memberships" DROP CONSTRAINT "user_location_memberships_pkey",
DROP COLUMN "user_id",
ADD COLUMN     "organization_manager_id" UUID NOT NULL,
ADD CONSTRAINT "user_location_memberships_pkey" PRIMARY KEY ("organization_manager_id");

-- AlterTable
ALTER TABLE "user_role_grants" DROP COLUMN "granted_by_user_id",
DROP COLUMN "user_id",
ADD COLUMN     "granted_by_manager_id" UUID,
ADD COLUMN     "organization_manager_id" UUID NOT NULL;

-- DropTable
DROP TABLE "role_permissions";

-- DropTable
DROP TABLE "user_primary_roles";

-- CreateTable
CREATE TABLE "organization_role_permissions" (
    "organization_role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,

    CONSTRAINT "organization_role_permissions_pkey" PRIMARY KEY ("organization_role_id","permission_id")
);

-- CreateIndex
CREATE INDEX "organization_role_permissions_permission_id_idx" ON "organization_role_permissions"("permission_id");

-- CreateIndex
CREATE INDEX "group_members_organization_manager_id_idx" ON "group_members"("organization_manager_id");

-- CreateIndex
CREATE INDEX "groups_created_by_manager_id_idx" ON "groups"("created_by_manager_id");

-- CreateIndex
CREATE INDEX "organization_invitations_invited_by_manager_id_idx" ON "organization_invitations"("invited_by_manager_id");

-- CreateIndex
CREATE INDEX "organization_invitations_accepted_by_manager_id_idx" ON "organization_invitations"("accepted_by_manager_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_invitations_organization_id_email_organization_key" ON "organization_invitations"("organization_id", "email", "organization_role_id");

-- CreateIndex
CREATE INDEX "organization_managers_account_id_idx" ON "organization_managers"("account_id");

-- CreateIndex
CREATE INDEX "organization_managers_organization_id_idx" ON "organization_managers"("organization_id");

-- CreateIndex
CREATE INDEX "organization_managers_organization_role_id_idx" ON "organization_managers"("organization_role_id");

-- CreateIndex
CREATE INDEX "organization_managers_department_id_idx" ON "organization_managers"("department_id");

-- CreateIndex
CREATE INDEX "permissions_organization_id_idx" ON "permissions"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_organization_id_key_key" ON "permissions"("organization_id", "key");

-- CreateIndex
CREATE INDEX "user_location_memberships_location_id_idx" ON "user_location_memberships"("location_id");

-- CreateIndex
CREATE INDEX "user_role_grants_organization_manager_id_idx" ON "user_role_grants"("organization_manager_id");

-- CreateIndex
CREATE INDEX "user_role_grants_location_id_idx" ON "user_role_grants"("location_id");

-- CreateIndex
CREATE INDEX "user_role_grants_granted_by_manager_id_idx" ON "user_role_grants"("granted_by_manager_id");

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "organization_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_created_by_manager_id_fkey" FOREIGN KEY ("created_by_manager_id") REFERENCES "organization_managers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_organization_manager_id_fkey" FOREIGN KEY ("organization_manager_id") REFERENCES "organization_managers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_invitations" ADD CONSTRAINT "organization_invitations_organization_role_id_fkey" FOREIGN KEY ("organization_role_id") REFERENCES "organization_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_invitations" ADD CONSTRAINT "organization_invitations_invited_by_manager_id_fkey" FOREIGN KEY ("invited_by_manager_id") REFERENCES "organization_managers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_invitations" ADD CONSTRAINT "organization_invitations_accepted_by_manager_id_fkey" FOREIGN KEY ("accepted_by_manager_id") REFERENCES "organization_managers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_role_permissions" ADD CONSTRAINT "organization_role_permissions_organization_role_id_fkey" FOREIGN KEY ("organization_role_id") REFERENCES "organization_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_role_permissions" ADD CONSTRAINT "organization_role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_location_memberships" ADD CONSTRAINT "user_location_memberships_organization_manager_id_fkey" FOREIGN KEY ("organization_manager_id") REFERENCES "organization_managers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role_grants" ADD CONSTRAINT "user_role_grants_organization_manager_id_fkey" FOREIGN KEY ("organization_manager_id") REFERENCES "organization_managers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role_grants" ADD CONSTRAINT "user_role_grants_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "organization_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role_grants" ADD CONSTRAINT "user_role_grants_granted_by_manager_id_fkey" FOREIGN KEY ("granted_by_manager_id") REFERENCES "organization_managers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
