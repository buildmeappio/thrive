/*
  Warnings:

  - You are about to drop the column `approved_at` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `approved_by` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `rejected_at` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `rejected_by` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `rejected_reason` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `organizations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "organization_managers" ADD COLUMN     "organization_role_id" UUID;

-- AlterTable
ALTER TABLE "organizations" DROP COLUMN "approved_at",
DROP COLUMN "approved_by",
DROP COLUMN "rejected_at",
DROP COLUMN "rejected_by",
DROP COLUMN "rejected_reason",
DROP COLUMN "status";

-- CreateTable
CREATE TABLE "organization_invitations" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "organization_role_id" UUID,
    "invited_by" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "accepted_at" TIMESTAMPTZ,
    "accepted_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "organization_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_roles" (
    "id" UUID NOT NULL,
    "organization_id" UUID,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "is_system_role" BOOLEAN NOT NULL DEFAULT false,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "organization_roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organization_invitations_id_key" ON "organization_invitations"("id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_invitations_token_key" ON "organization_invitations"("token");

-- CreateIndex
CREATE INDEX "organization_invitations_email_idx" ON "organization_invitations"("email");

-- CreateIndex
CREATE INDEX "organization_invitations_token_idx" ON "organization_invitations"("token");

-- CreateIndex
CREATE INDEX "organization_invitations_organization_role_id_idx" ON "organization_invitations"("organization_role_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_invitations_organization_id_email_role_key" ON "organization_invitations"("organization_id", "email", "role");

-- CreateIndex
CREATE UNIQUE INDEX "organization_roles_id_key" ON "organization_roles"("id");

-- CreateIndex
CREATE INDEX "organization_roles_organization_id_idx" ON "organization_roles"("organization_id");

-- CreateIndex
CREATE INDEX "organization_roles_name_is_system_role_idx" ON "organization_roles"("name", "is_system_role");

-- CreateIndex
CREATE UNIQUE INDEX "organization_roles_organization_id_name_key" ON "organization_roles"("organization_id", "name");

-- AddForeignKey
ALTER TABLE "organization_invitations" ADD CONSTRAINT "organization_invitations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_invitations" ADD CONSTRAINT "organization_invitations_organization_role_id_fkey" FOREIGN KEY ("organization_role_id") REFERENCES "organization_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_managers" ADD CONSTRAINT "organization_managers_organization_role_id_fkey" FOREIGN KEY ("organization_role_id") REFERENCES "organization_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_roles" ADD CONSTRAINT "organization_roles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
