/*
  Warnings:

  - You are about to drop the column `group_id` on the `organization_invitations` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "organization_invitations" DROP CONSTRAINT "organization_invitations_group_id_fkey";

-- DropIndex
DROP INDEX "organization_invitations_group_id_idx";

-- AlterTable
ALTER TABLE "organization_invitations" DROP COLUMN "group_id";

-- CreateTable
CREATE TABLE "organization_invitation_groups" (
    "invitation_id" UUID NOT NULL,
    "group_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_invitation_groups_pkey" PRIMARY KEY ("invitation_id","group_id")
);

-- CreateTable
CREATE TABLE "organization_invitation_locations" (
    "invitation_id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_invitation_locations_pkey" PRIMARY KEY ("invitation_id","location_id")
);

-- CreateIndex
CREATE INDEX "organization_invitation_groups_group_id_idx" ON "organization_invitation_groups"("group_id");

-- CreateIndex
CREATE INDEX "organization_invitation_groups_invitation_id_idx" ON "organization_invitation_groups"("invitation_id");

-- CreateIndex
CREATE INDEX "organization_invitation_locations_location_id_idx" ON "organization_invitation_locations"("location_id");

-- CreateIndex
CREATE INDEX "organization_invitation_locations_invitation_id_idx" ON "organization_invitation_locations"("invitation_id");

-- AddForeignKey
ALTER TABLE "organization_invitation_groups" ADD CONSTRAINT "organization_invitation_groups_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "organization_invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_invitation_groups" ADD CONSTRAINT "organization_invitation_groups_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_invitation_locations" ADD CONSTRAINT "organization_invitation_locations_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "organization_invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_invitation_locations" ADD CONSTRAINT "organization_invitation_locations_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
