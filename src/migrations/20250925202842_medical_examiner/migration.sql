-- CreateEnum
CREATE TYPE "public"."ExaminerStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."examiner_languages" (
    "id" UUID NOT NULL,
    "examiner_profile_id" UUID NOT NULL,
    "language_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "examiner_languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."examiner_profiles" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "province_of_residence" VARCHAR(255) NOT NULL,
    "mailing_address" TEXT NOT NULL,
    "specialties" TEXT[],
    "license_number" VARCHAR(255) NOT NULL,
    "province_of_licensure" VARCHAR(255) NOT NULL,
    "license_expiry_date" DATE NOT NULL,
    "medical_license_document_id" UUID NOT NULL,
    "resume_document_id" UUID NOT NULL,
    "nda_document_id" UUID NOT NULL,
    "insurance_document_id" UUID NOT NULL,
    "is_forensic_assessment_trained" BOOLEAN NOT NULL,
    "years_of_ime_experience" INTEGER NOT NULL,
    "bio" TEXT NOT NULL,
    "is_consent_to_background_verification" BOOLEAN NOT NULL,
    "agree_to_terms" BOOLEAN NOT NULL,
    "status" "public"."ExaminerStatus" NOT NULL DEFAULT 'PENDING',
    "approved_by" UUID,
    "approved_at" TIMESTAMPTZ,
    "rejected_by" UUID,
    "rejected_at" TIMESTAMPTZ,
    "rejected_reason" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "examiner_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "examiner_languages_language_id_idx" ON "public"."examiner_languages"("language_id");

-- CreateIndex
CREATE UNIQUE INDEX "examiner_languages_examiner_profile_id_language_id_key" ON "public"."examiner_languages"("examiner_profile_id", "language_id");

-- AddForeignKey
ALTER TABLE "public"."examiner_languages" ADD CONSTRAINT "examiner_languages_examiner_profile_id_fkey" FOREIGN KEY ("examiner_profile_id") REFERENCES "public"."examiner_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examiner_languages" ADD CONSTRAINT "examiner_languages_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examiner_profiles" ADD CONSTRAINT "examiner_profiles_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examiner_profiles" ADD CONSTRAINT "examiner_profiles_medical_license_document_id_fkey" FOREIGN KEY ("medical_license_document_id") REFERENCES "public"."documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examiner_profiles" ADD CONSTRAINT "examiner_profiles_resume_document_id_fkey" FOREIGN KEY ("resume_document_id") REFERENCES "public"."documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examiner_profiles" ADD CONSTRAINT "examiner_profiles_nda_document_id_fkey" FOREIGN KEY ("nda_document_id") REFERENCES "public"."documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examiner_profiles" ADD CONSTRAINT "examiner_profiles_insurance_document_id_fkey" FOREIGN KEY ("insurance_document_id") REFERENCES "public"."documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
