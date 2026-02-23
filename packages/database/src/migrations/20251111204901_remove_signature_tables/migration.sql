/*
  Warnings:

  - You are about to drop the column `docusign_envelope_id` on the `contracts` table. All the data in the column will be lost.
  - You are about to drop the column `docusign_status` on the `contracts` table. All the data in the column will be lost.
  - You are about to drop the `signatures` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "public"."ExaminerStatus" ADD VALUE 'ACTIVE';

-- DropForeignKey
ALTER TABLE "public"."signatures" DROP CONSTRAINT "signatures_contract_id_fkey";

-- DropIndex
DROP INDEX "public"."contracts_docusign_envelope_id_idx";

-- AlterTable
ALTER TABLE "public"."contracts" DROP COLUMN "docusign_envelope_id",
DROP COLUMN "docusign_status";

-- DropTable
DROP TABLE "public"."signatures";

-- DropEnum
DROP TYPE "public"."SignatureMethod";
