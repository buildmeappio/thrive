/*
  Warnings:

  - You are about to drop the column `body_part_concern` on the `ime_referrals` table. All the data in the column will be lost.
  - You are about to drop the column `case_type_id` on the `ime_referrals` table. All the data in the column will be lost.
  - You are about to drop the column `exam_format_id` on the `ime_referrals` table. All the data in the column will be lost.
  - You are about to drop the column `preferred_location` on the `ime_referrals` table. All the data in the column will be lost.
  - You are about to drop the column `reason_for_referral` on the `ime_referrals` table. All the data in the column will be lost.
  - You are about to drop the column `requested_specialty_id` on the `ime_referrals` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `ime_referrals` table. All the data in the column will be lost.
  - You are about to drop the `referral_documents` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."UrgencyLevel" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "public"."CaseSecureLinkStatus" AS ENUM ('PENDING', 'SUBMITTED', 'INVALID');

-- CreateEnum
CREATE TYPE "public"."ClaimantPreference" AS ENUM ('IN_PERSON', 'VIRTUAL', 'EITHER');

-- CreateEnum
CREATE TYPE "public"."TimeBand" AS ENUM ('MORNING', 'AFTERNOON', 'EVENING', 'EITHER');

-- DropForeignKey
ALTER TABLE "public"."ime_referrals" DROP CONSTRAINT "ime_referrals_case_type_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ime_referrals" DROP CONSTRAINT "ime_referrals_exam_format_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ime_referrals" DROP CONSTRAINT "ime_referrals_examiner_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ime_referrals" DROP CONSTRAINT "ime_referrals_requested_specialty_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."referral_documents" DROP CONSTRAINT "referral_documents_document_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."referral_documents" DROP CONSTRAINT "referral_documents_referral_id_fkey";

-- AlterTable
ALTER TABLE "public"."ime_referrals" DROP COLUMN "body_part_concern",
DROP COLUMN "case_type_id",
DROP COLUMN "exam_format_id",
DROP COLUMN "preferred_location",
DROP COLUMN "reason_for_referral",
DROP COLUMN "requested_specialty_id",
DROP COLUMN "status",
ADD COLUMN     "consent_for_submission" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_draft" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "public"."referral_documents";

-- DropEnum
DROP TYPE "public"."IMEReferralStatus";

-- CreateTable
CREATE TABLE "public"."cases" (
    "id" UUID NOT NULL,
    "referral_id" UUID NOT NULL,
    "case_type_id" UUID NOT NULL,
    "exam_format_id" UUID NOT NULL,
    "requested_specialty_id" UUID NOT NULL,
    "preferred_location" VARCHAR(255),
    "urgency_level" "public"."UrgencyLevel" NOT NULL,
    "reason" TEXT NOT NULL,
    "examiner_id" UUID NOT NULL,
    "status_id" UUID NOT NULL,
    "assign_to_id" UUID,
    "assigned_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."case_secure_links" (
    "id" UUID NOT NULL,
    "case_id" UUID NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "last_opened_at" TIMESTAMPTZ,
    "submitted_at" TIMESTAMPTZ,
    "status" "public"."CaseSecureLinkStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "case_secure_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."claimant_availability" (
    "id" UUID NOT NULL,
    "case_id" UUID NOT NULL,
    "claimant_id" UUID NOT NULL,
    "preference" "public"."ClaimantPreference" NOT NULL,
    "accessibility_notes" TEXT,
    "additional_notes" TEXT,
    "consent_ack" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "claimant_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."claimant_availability_slots" (
    "id" UUID NOT NULL,
    "availability_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "start_time" VARCHAR(255) NOT NULL,
    "end_time" VARCHAR(255) NOT NULL,
    "start" TIMESTAMPTZ NOT NULL,
    "end" TIMESTAMPTZ NOT NULL,
    "time_band" "public"."TimeBand" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "claimant_availability_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."claimant_availability_services" (
    "id" UUID NOT NULL,
    "availability_id" UUID NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "claimant_availability_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."claimant_availability_interpreter" (
    "id" UUID NOT NULL,
    "availability_service_id" UUID NOT NULL,
    "language_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "claimant_availability_interpreter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."languages" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."claimant_availability_transport" (
    "id" UUID NOT NULL,
    "availability_service_id" UUID NOT NULL,
    "pickup_address_id" UUID,
    "raw_lookup" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "claimant_availability_transport_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "public"."case_statuses" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "case_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cases_id_key" ON "public"."cases"("id");

-- CreateIndex
CREATE INDEX "cases_referral_id_idx" ON "public"."cases"("referral_id");

-- CreateIndex
CREATE UNIQUE INDEX "case_secure_links_id_key" ON "public"."case_secure_links"("id");

-- CreateIndex
CREATE UNIQUE INDEX "claimant_availability_id_key" ON "public"."claimant_availability"("id");

-- CreateIndex
CREATE UNIQUE INDEX "claimant_availability_slots_id_key" ON "public"."claimant_availability_slots"("id");

-- CreateIndex
CREATE UNIQUE INDEX "claimant_availability_services_id_key" ON "public"."claimant_availability_services"("id");

-- CreateIndex
CREATE UNIQUE INDEX "claimant_availability_interpreter_id_key" ON "public"."claimant_availability_interpreter"("id");

-- CreateIndex
CREATE UNIQUE INDEX "claimant_availability_interpreter_availability_service_id_key" ON "public"."claimant_availability_interpreter"("availability_service_id");

-- CreateIndex
CREATE UNIQUE INDEX "languages_id_key" ON "public"."languages"("id");

-- CreateIndex
CREATE UNIQUE INDEX "claimant_availability_transport_id_key" ON "public"."claimant_availability_transport"("id");

-- CreateIndex
CREATE UNIQUE INDEX "claimant_availability_transport_availability_service_id_key" ON "public"."claimant_availability_transport"("availability_service_id");

-- CreateIndex
CREATE UNIQUE INDEX "case_documents_id_key" ON "public"."case_documents"("id");

-- CreateIndex
CREATE UNIQUE INDEX "case_documents_case_id_document_id_key" ON "public"."case_documents"("case_id", "document_id");

-- CreateIndex
CREATE UNIQUE INDEX "case_statuses_id_key" ON "public"."case_statuses"("id");

-- AddForeignKey
ALTER TABLE "public"."cases" ADD CONSTRAINT "cases_referral_id_fkey" FOREIGN KEY ("referral_id") REFERENCES "public"."ime_referrals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cases" ADD CONSTRAINT "cases_case_type_id_fkey" FOREIGN KEY ("case_type_id") REFERENCES "public"."case_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cases" ADD CONSTRAINT "cases_exam_format_id_fkey" FOREIGN KEY ("exam_format_id") REFERENCES "public"."exam_formats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cases" ADD CONSTRAINT "cases_requested_specialty_id_fkey" FOREIGN KEY ("requested_specialty_id") REFERENCES "public"."requested_specialties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cases" ADD CONSTRAINT "cases_examiner_id_fkey" FOREIGN KEY ("examiner_id") REFERENCES "public"."accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cases" ADD CONSTRAINT "cases_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "public"."case_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cases" ADD CONSTRAINT "cases_assign_to_id_fkey" FOREIGN KEY ("assign_to_id") REFERENCES "public"."accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."case_secure_links" ADD CONSTRAINT "case_secure_links_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."claimant_availability" ADD CONSTRAINT "claimant_availability_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."claimant_availability" ADD CONSTRAINT "claimant_availability_claimant_id_fkey" FOREIGN KEY ("claimant_id") REFERENCES "public"."claimants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."claimant_availability_slots" ADD CONSTRAINT "claimant_availability_slots_availability_id_fkey" FOREIGN KEY ("availability_id") REFERENCES "public"."claimant_availability"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."claimant_availability_services" ADD CONSTRAINT "claimant_availability_services_availability_id_fkey" FOREIGN KEY ("availability_id") REFERENCES "public"."claimant_availability"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."claimant_availability_interpreter" ADD CONSTRAINT "claimant_availability_interpreter_availability_service_id_fkey" FOREIGN KEY ("availability_service_id") REFERENCES "public"."claimant_availability_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."claimant_availability_interpreter" ADD CONSTRAINT "claimant_availability_interpreter_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."claimant_availability_transport" ADD CONSTRAINT "claimant_availability_transport_availability_service_id_fkey" FOREIGN KEY ("availability_service_id") REFERENCES "public"."claimant_availability_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."claimant_availability_transport" ADD CONSTRAINT "claimant_availability_transport_pickup_address_id_fkey" FOREIGN KEY ("pickup_address_id") REFERENCES "public"."addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."case_documents" ADD CONSTRAINT "case_documents_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."case_documents" ADD CONSTRAINT "case_documents_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
