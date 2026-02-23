/*
  Warnings:

  - You are about to drop the column `medical_license_document_id` on the `examiner_profiles` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."examiner_profiles" DROP CONSTRAINT "examiner_profiles_medical_license_document_id_fkey";

-- AlterTable
ALTER TABLE "public"."examiner_profiles" DROP COLUMN "medical_license_document_id",
ADD COLUMN     "medical_license_document_ids" TEXT[];
