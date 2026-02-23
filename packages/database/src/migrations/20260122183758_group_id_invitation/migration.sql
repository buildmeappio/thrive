-- AlterTable
ALTER TABLE "organization_invitations" ADD COLUMN     "group_id" UUID;

-- CreateIndex
CREATE INDEX "organization_invitations_group_id_idx" ON "organization_invitations"("group_id");

-- AddForeignKey
ALTER TABLE "organization_invitations" ADD CONSTRAINT "organization_invitations_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
