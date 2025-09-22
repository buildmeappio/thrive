/*
  Warnings:

  - You are about to drop the column `additional_notes` on the `claimant_availability` table. All the data in the column will be lost.
  - You are about to drop the column `reason` on the `examinations` table. All the data in the column will be lost.
  - You are about to drop the column `referral_id` on the `examinations` table. All the data in the column will be lost.
  - You are about to drop the `claimant_availability_interpreter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `claimant_availability_services` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `claimant_availability_transport` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `exam_types` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ime_referral_documents` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ime_referrals` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `case_id` to the `examinations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `preference` to the `examinations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."claimant_availability_interpreter" DROP CONSTRAINT "claimant_availability_interpreter_availability_service_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."claimant_availability_interpreter" DROP CONSTRAINT "claimant_availability_interpreter_language_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."claimant_availability_services" DROP CONSTRAINT "claimant_availability_services_availability_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."claimant_availability_transport" DROP CONSTRAINT "claimant_availability_transport_availability_service_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."claimant_availability_transport" DROP CONSTRAINT "claimant_availability_transport_pickup_address_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."examinations" DROP CONSTRAINT "examinations_referral_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ime_referral_documents" DROP CONSTRAINT "ime_referral_documents_document_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ime_referral_documents" DROP CONSTRAINT "ime_referral_documents_referral_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ime_referrals" DROP CONSTRAINT "ime_referrals_case_type_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ime_referrals" DROP CONSTRAINT "ime_referrals_claimant_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ime_referrals" DROP CONSTRAINT "ime_referrals_exam_type_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ime_referrals" DROP CONSTRAINT "ime_referrals_insurance_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ime_referrals" DROP CONSTRAINT "ime_referrals_legal_representative_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ime_referrals" DROP CONSTRAINT "ime_referrals_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."insurances" DROP CONSTRAINT "insurances_address_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."legal_representatives" DROP CONSTRAINT "legal_representatives_address_id_fkey";

-- DropIndex
DROP INDEX "public"."examinations_referral_id_idx";

-- AlterTable
ALTER TABLE "public"."addresses" ALTER COLUMN "street" DROP NOT NULL,
ALTER COLUMN "city" DROP NOT NULL,
ALTER COLUMN "suite" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."claimant_availability" DROP COLUMN "additional_notes";

-- AlterTable
ALTER TABLE "public"."claimants" ALTER COLUMN "date_of_birth" DROP NOT NULL,
ALTER COLUMN "gender" DROP NOT NULL,
ALTER COLUMN "phone_number" DROP NOT NULL,
ALTER COLUMN "email_address" DROP NOT NULL,
ALTER COLUMN "family_doctor_email_address" DROP NOT NULL,
ALTER COLUMN "family_doctor_fax_number" DROP NOT NULL,
ALTER COLUMN "family_doctor_name" DROP NOT NULL,
ALTER COLUMN "family_doctor_phone_number" DROP NOT NULL,
ALTER COLUMN "related_cases_details" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."examinations" DROP COLUMN "reason",
DROP COLUMN "referral_id",
ADD COLUMN     "additional_notes" TEXT,
ADD COLUMN     "case_id" UUID NOT NULL,
ADD COLUMN     "preference" "public"."ClaimantPreference" NOT NULL,
ADD COLUMN     "support_person" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "due_date" DROP NOT NULL,
ALTER COLUMN "notes" DROP NOT NULL,
ALTER COLUMN "urgency_level" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."insurances" ALTER COLUMN "address_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."legal_representatives" ALTER COLUMN "company_name" DROP NOT NULL,
ALTER COLUMN "contact_person" DROP NOT NULL,
ALTER COLUMN "phone_number" DROP NOT NULL,
ALTER COLUMN "fax_number" DROP NOT NULL,
ALTER COLUMN "address_id" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."claimant_availability_interpreter";

-- DropTable
DROP TABLE "public"."claimant_availability_services";

-- DropTable
DROP TABLE "public"."claimant_availability_transport";

-- DropTable
DROP TABLE "public"."exam_types";

-- DropTable
DROP TABLE "public"."ime_referral_documents";

-- DropTable
DROP TABLE "public"."ime_referrals";

-- CreateTable
CREATE TABLE "public"."cases" (
    "id" UUID NOT NULL,
    "organization_id" UUID,
    "claimant_id" UUID NOT NULL,
    "insurance_id" UUID,
    "legal_representative_id" UUID,
    "case_type_id" UUID,
    "reason" VARCHAR(255),
    "consent_for_submission" BOOLEAN NOT NULL DEFAULT false,
    "is_draft" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."examination_services" (
    "id" UUID NOT NULL,
    "examination_id" UUID NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "examination_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."examination_interpreter" (
    "id" UUID NOT NULL,
    "examination_service_id" UUID NOT NULL,
    "language_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "examination_interpreter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."examination_transport" (
    "id" UUID NOT NULL,
    "examination_service_id" UUID NOT NULL,
    "pickup_address_id" UUID,
    "raw_lookup" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "examination_transport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."case_documents" (
    "id" UUID NOT NULL,
    "case_id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "case_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cases_id_key" ON "public"."cases"("id");

-- CreateIndex
CREATE UNIQUE INDEX "examination_services_id_key" ON "public"."examination_services"("id");

-- CreateIndex
CREATE UNIQUE INDEX "examination_interpreter_id_key" ON "public"."examination_interpreter"("id");

-- CreateIndex
CREATE UNIQUE INDEX "examination_interpreter_examination_service_id_key" ON "public"."examination_interpreter"("examination_service_id");

-- CreateIndex
CREATE UNIQUE INDEX "examination_transport_id_key" ON "public"."examination_transport"("id");

-- CreateIndex
CREATE UNIQUE INDEX "examination_transport_examination_service_id_key" ON "public"."examination_transport"("examination_service_id");

-- CreateIndex
CREATE UNIQUE INDEX "case_documents_id_key" ON "public"."case_documents"("id");

-- CreateIndex
CREATE UNIQUE INDEX "case_documents_case_id_document_id_key" ON "public"."case_documents"("case_id", "document_id");

-- CreateIndex
CREATE INDEX "examinations_case_id_idx" ON "public"."examinations"("case_id");

-- AddForeignKey
ALTER TABLE "public"."legal_representatives" ADD CONSTRAINT "legal_representatives_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."insurances" ADD CONSTRAINT "insurances_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cases" ADD CONSTRAINT "cases_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cases" ADD CONSTRAINT "cases_claimant_id_fkey" FOREIGN KEY ("claimant_id") REFERENCES "public"."claimants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cases" ADD CONSTRAINT "cases_insurance_id_fkey" FOREIGN KEY ("insurance_id") REFERENCES "public"."insurances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cases" ADD CONSTRAINT "cases_legal_representative_id_fkey" FOREIGN KEY ("legal_representative_id") REFERENCES "public"."legal_representatives"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cases" ADD CONSTRAINT "cases_case_type_id_fkey" FOREIGN KEY ("case_type_id") REFERENCES "public"."case_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examinations" ADD CONSTRAINT "examinations_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examination_services" ADD CONSTRAINT "examination_services_examination_id_fkey" FOREIGN KEY ("examination_id") REFERENCES "public"."examinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examination_interpreter" ADD CONSTRAINT "examination_interpreter_examination_service_id_fkey" FOREIGN KEY ("examination_service_id") REFERENCES "public"."examination_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examination_interpreter" ADD CONSTRAINT "examination_interpreter_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examination_transport" ADD CONSTRAINT "examination_transport_examination_service_id_fkey" FOREIGN KEY ("examination_service_id") REFERENCES "public"."examination_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examination_transport" ADD CONSTRAINT "examination_transport_pickup_address_id_fkey" FOREIGN KEY ("pickup_address_id") REFERENCES "public"."addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."case_documents" ADD CONSTRAINT "case_documents_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."case_documents" ADD CONSTRAINT "case_documents_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
