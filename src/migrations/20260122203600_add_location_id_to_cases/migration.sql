/*
  Warnings:

  - You are about to drop the `user_role_grants` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_role_grants" DROP CONSTRAINT "user_role_grants_granted_by_manager_id_fkey";

-- DropForeignKey
ALTER TABLE "user_role_grants" DROP CONSTRAINT "user_role_grants_location_id_fkey";

-- DropForeignKey
ALTER TABLE "user_role_grants" DROP CONSTRAINT "user_role_grants_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "user_role_grants" DROP CONSTRAINT "user_role_grants_organization_manager_id_fkey";

-- DropForeignKey
ALTER TABLE "user_role_grants" DROP CONSTRAINT "user_role_grants_role_id_fkey";

-- AlterTable
ALTER TABLE "cases" ADD COLUMN     "location_id" UUID;

-- DropTable
DROP TABLE "user_role_grants";

-- CreateIndex
CREATE INDEX "cases_location_id_idx" ON "cases"("location_id");

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
