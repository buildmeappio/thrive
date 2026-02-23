/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `examiner_profiles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[application_id]` on the table `examiner_profiles` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."examiner_profiles" DROP COLUMN "deletedAt",
ADD COLUMN     "application_id" UUID,
ADD COLUMN     "deleted_at" TIMESTAMPTZ;

-- CreateTable
CREATE TABLE "public"."examiner_applications" (
    "id" UUID NOT NULL,
    "first_name" VARCHAR(255),
    "last_name" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255),
    "province_of_residence" VARCHAR(255) NOT NULL,
    "mailing_address" TEXT NOT NULL,
    "address_id" UUID,
    "landline_number" VARCHAR(255),
    "specialties" TEXT[],
    "license_number" VARCHAR(255) NOT NULL,
    "province_of_licensure" VARCHAR(255),
    "license_expiry_date" DATE,
    "medical_license_document_ids" TEXT[],
    "resume_document_id" UUID,
    "nda_document_id" UUID,
    "insurance_document_id" UUID,
    "redacted_ime_report_document_id" UUID,
    "is_forensic_assessment_trained" BOOLEAN NOT NULL,
    "years_of_ime_experience" VARCHAR(255) NOT NULL,
    "imes_completed" VARCHAR(50),
    "currently_conducting_imes" BOOLEAN,
    "insurers_or_clinics" TEXT,
    "assessment_types" TEXT[],
    "assessment_type_other" VARCHAR(255),
    "experience_details" TEXT,
    "languages_spoken" TEXT[],
    "is_consent_to_background_verification" BOOLEAN NOT NULL,
    "agree_to_terms" BOOLEAN NOT NULL,
    "status" "public"."ExaminerStatus" NOT NULL DEFAULT 'SUBMITTED',
    "approved_by" UUID,
    "approved_at" TIMESTAMPTZ,
    "rejected_by" UUID,
    "rejected_at" TIMESTAMPTZ,
    "rejected_reason" TEXT,
    "contract_signed_by_examiner_at" TIMESTAMPTZ,
    "contract_confirmed_by_admin_at" TIMESTAMPTZ,
    "contract_declined_by_examiner_at" TIMESTAMPTZ,
    "contract_declined_by_admin_at" TIMESTAMPTZ,
    "contract_decline_reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "examiner_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "examiner_applications_email_key" ON "public"."examiner_applications"("email");

-- CreateIndex
CREATE INDEX "examiner_applications_email_idx" ON "public"."examiner_applications"("email");

-- CreateIndex
CREATE INDEX "examiner_applications_status_idx" ON "public"."examiner_applications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "examiner_profiles_application_id_key" ON "public"."examiner_profiles"("application_id");

-- CreateIndex
CREATE INDEX "examiner_profiles_application_id_idx" ON "public"."examiner_profiles"("application_id");

-- CreateIndex
CREATE INDEX "examiner_profiles_account_id_idx" ON "public"."examiner_profiles"("account_id");

-- AddForeignKey
ALTER TABLE "public"."examiner_applications" ADD CONSTRAINT "examiner_applications_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examiner_applications" ADD CONSTRAINT "examiner_applications_resume_document_id_fkey" FOREIGN KEY ("resume_document_id") REFERENCES "public"."documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examiner_applications" ADD CONSTRAINT "examiner_applications_nda_document_id_fkey" FOREIGN KEY ("nda_document_id") REFERENCES "public"."documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examiner_applications" ADD CONSTRAINT "examiner_applications_insurance_document_id_fkey" FOREIGN KEY ("insurance_document_id") REFERENCES "public"."documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examiner_applications" ADD CONSTRAINT "examiner_applications_redacted_ime_report_document_id_fkey" FOREIGN KEY ("redacted_ime_report_document_id") REFERENCES "public"."documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examiner_profiles" ADD CONSTRAINT "examiner_profiles_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."examiner_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
