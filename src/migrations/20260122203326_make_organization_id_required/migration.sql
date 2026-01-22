-- DropForeignKey
ALTER TABLE "organization_roles" DROP CONSTRAINT "organization_roles_organization_id_fkey";

-- AddForeignKey
ALTER TABLE "organization_roles" ADD CONSTRAINT "organization_roles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
