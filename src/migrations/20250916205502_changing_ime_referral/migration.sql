/*
  Warnings:

  - You are about to drop the column `case_id` on the `claimant_availability` table. All the data in the column will be lost.
  - You are about to drop the `case_documents` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `case_secure_links` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cases` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `exam_formats` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `examination_id` to the `claimant_availability` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ExaminationSecureLinkStatus" AS ENUM ('PENDING', 'SUBMITTED', 'INVALID');

-- DropForeignKey
ALTER TABLE "public"."case_documents" DROP CONSTRAINT "case_documents_case_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."case_documents" DROP CONSTRAINT "case_documents_document_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."case_secure_links" DROP CONSTRAINT "case_secure_links_case_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."cases" DROP CONSTRAINT "cases_assign_to_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."cases" DROP CONSTRAINT "cases_case_type_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."cases" DROP CONSTRAINT "cases_exam_format_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."cases" DROP CONSTRAINT "cases_examiner_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."cases" DROP CONSTRAINT "cases_referral_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."cases" DROP CONSTRAINT "cases_requested_specialty_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."cases" DROP CONSTRAINT "cases_status_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."claimant_availability" DROP CONSTRAINT "claimant_availability_case_id_fkey";

-- AlterTable
ALTER TABLE "public"."claimant_availability" DROP COLUMN "case_id",
ADD COLUMN     "examination_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "public"."ime_referrals" ADD COLUMN     "case_type_id" UUID,
ADD COLUMN     "exam_type_id" UUID,
ADD COLUMN     "insurance_id" UUID,
ADD COLUMN     "legal_representative_id" UUID,
ADD COLUMN     "reason" VARCHAR(255);

-- DropTable
DROP TABLE "public"."case_documents";

-- DropTable
DROP TABLE "public"."case_secure_links";

-- DropTable
DROP TABLE "public"."cases";

-- DropTable
DROP TABLE "public"."exam_formats";

-- DropEnum
DROP TYPE "public"."CaseSecureLinkStatus";

-- CreateTable
CREATE TABLE "public"."examinations" (
    "id" UUID NOT NULL,
    "case_number" VARCHAR(255) NOT NULL,
    "referral_id" UUID NOT NULL,
    "examination_type_id" UUID NOT NULL,
    "due_date" TIMESTAMPTZ,
    "notes" TEXT,
    "urgency_level" "public"."UrgencyLevel" NOT NULL,
    "reason" TEXT NOT NULL,
    "examiner_id" UUID,
    "status_id" UUID NOT NULL,
    "assign_to_id" UUID,
    "assigned_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "examinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."examination_secure_links" (
    "id" UUID NOT NULL,
    "examination_id" UUID NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "last_opened_at" TIMESTAMPTZ,
    "submitted_at" TIMESTAMPTZ,
    "status" "public"."ExaminationSecureLinkStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "examination_secure_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ime_referral_documents" (
    "id" UUID NOT NULL,
    "referral_id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "ime_referral_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."examination_types" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "examination_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "examinations_id_key" ON "public"."examinations"("id");

-- CreateIndex
CREATE UNIQUE INDEX "examinations_case_number_key" ON "public"."examinations"("case_number");

-- CreateIndex
CREATE INDEX "examinations_referral_id_idx" ON "public"."examinations"("referral_id");

-- CreateIndex
CREATE INDEX "examinations_case_number_idx" ON "public"."examinations"("case_number");

-- CreateIndex
CREATE UNIQUE INDEX "examination_secure_links_id_key" ON "public"."examination_secure_links"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ime_referral_documents_id_key" ON "public"."ime_referral_documents"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ime_referral_documents_referral_id_document_id_key" ON "public"."ime_referral_documents"("referral_id", "document_id");

-- CreateIndex
CREATE UNIQUE INDEX "examination_types_id_key" ON "public"."examination_types"("id");

-- AddForeignKey
ALTER TABLE "public"."ime_referrals" ADD CONSTRAINT "ime_referrals_case_type_id_fkey" FOREIGN KEY ("case_type_id") REFERENCES "public"."case_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ime_referrals" ADD CONSTRAINT "ime_referrals_insurance_id_fkey" FOREIGN KEY ("insurance_id") REFERENCES "public"."insurances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ime_referrals" ADD CONSTRAINT "ime_referrals_legal_representative_id_fkey" FOREIGN KEY ("legal_representative_id") REFERENCES "public"."legal_representatives"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ime_referrals" ADD CONSTRAINT "ime_referrals_exam_type_id_fkey" FOREIGN KEY ("exam_type_id") REFERENCES "public"."exam_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examinations" ADD CONSTRAINT "examinations_referral_id_fkey" FOREIGN KEY ("referral_id") REFERENCES "public"."ime_referrals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examinations" ADD CONSTRAINT "examinations_examination_type_id_fkey" FOREIGN KEY ("examination_type_id") REFERENCES "public"."examination_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examinations" ADD CONSTRAINT "examinations_examiner_id_fkey" FOREIGN KEY ("examiner_id") REFERENCES "public"."accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examinations" ADD CONSTRAINT "examinations_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "public"."case_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examinations" ADD CONSTRAINT "examinations_assign_to_id_fkey" FOREIGN KEY ("assign_to_id") REFERENCES "public"."accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examination_secure_links" ADD CONSTRAINT "examination_secure_links_examination_id_fkey" FOREIGN KEY ("examination_id") REFERENCES "public"."examinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."claimant_availability" ADD CONSTRAINT "claimant_availability_examination_id_fkey" FOREIGN KEY ("examination_id") REFERENCES "public"."examinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ime_referral_documents" ADD CONSTRAINT "ime_referral_documents_referral_id_fkey" FOREIGN KEY ("referral_id") REFERENCES "public"."ime_referrals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ime_referral_documents" ADD CONSTRAINT "ime_referral_documents_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
