/*
  Warnings:

  - You are about to drop the column `role_id` on the `groups` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "groups" DROP CONSTRAINT "groups_role_id_fkey";

-- DropIndex
DROP INDEX "groups_role_id_idx";

-- AlterTable
ALTER TABLE "groups" DROP COLUMN "role_id";

