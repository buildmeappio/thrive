/*
  Warnings:

  - You are about to drop the column `organization_id` on the `permissions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[key]` on the table `permissions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "permissions" DROP CONSTRAINT "permissions_organization_id_fkey";

-- DropIndex
DROP INDEX "permissions_organization_id_idx";

-- DropIndex
DROP INDEX "permissions_organization_id_key_key";

-- AlterTable
ALTER TABLE "permissions" DROP COLUMN "organization_id";

-- CreateIndex
CREATE UNIQUE INDEX "permissions_key_key" ON "permissions"("key");
