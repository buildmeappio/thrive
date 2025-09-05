-- CreateEnum
CREATE TYPE "public"."IMEReferralStatus" AS ENUM ('PENDING', 'ASSIGNED', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."claimants" (
    "id" UUID NOT NULL,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "gender" VARCHAR(50) NOT NULL,
    "phone_number" VARCHAR(255) NOT NULL,
    "email_address" VARCHAR(255) NOT NULL,
    "address_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "claimants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ime_referrals" (
    "id" UUID NOT NULL,
    "case_number" VARCHAR(255) NOT NULL,
    "status" "public"."IMEReferralStatus" NOT NULL DEFAULT 'PENDING',
    "examiner_id" UUID NOT NULL,
    "organization_id" UUID,
    "claimant_id" UUID NOT NULL,
    "case_type_id" UUID NOT NULL,
    "exam_format_id" UUID NOT NULL,
    "requested_specialty_id" UUID NOT NULL,
    "reason_for_referral" TEXT NOT NULL,
    "body_part_concern" VARCHAR(255) NOT NULL,
    "preferred_location" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "ime_referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."referral_documents" (
    "id" UUID NOT NULL,
    "referral_id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "referral_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."case_types" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "case_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."exam_formats" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "exam_formats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."requested_specialties" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "requested_specialties_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "claimants_id_key" ON "public"."claimants"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ime_referrals_id_key" ON "public"."ime_referrals"("id");

-- CreateIndex
CREATE UNIQUE INDEX "referral_documents_id_key" ON "public"."referral_documents"("id");

-- CreateIndex
CREATE UNIQUE INDEX "referral_documents_referral_id_document_id_key" ON "public"."referral_documents"("referral_id", "document_id");

-- CreateIndex
CREATE UNIQUE INDEX "case_types_id_key" ON "public"."case_types"("id");

-- CreateIndex
CREATE UNIQUE INDEX "exam_formats_id_key" ON "public"."exam_formats"("id");

-- CreateIndex
CREATE UNIQUE INDEX "requested_specialties_id_key" ON "public"."requested_specialties"("id");

-- AddForeignKey
ALTER TABLE "public"."claimants" ADD CONSTRAINT "claimants_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ime_referrals" ADD CONSTRAINT "ime_referrals_examiner_id_fkey" FOREIGN KEY ("examiner_id") REFERENCES "public"."accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ime_referrals" ADD CONSTRAINT "ime_referrals_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ime_referrals" ADD CONSTRAINT "ime_referrals_claimant_id_fkey" FOREIGN KEY ("claimant_id") REFERENCES "public"."claimants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ime_referrals" ADD CONSTRAINT "ime_referrals_case_type_id_fkey" FOREIGN KEY ("case_type_id") REFERENCES "public"."case_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ime_referrals" ADD CONSTRAINT "ime_referrals_exam_format_id_fkey" FOREIGN KEY ("exam_format_id") REFERENCES "public"."exam_formats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ime_referrals" ADD CONSTRAINT "ime_referrals_requested_specialty_id_fkey" FOREIGN KEY ("requested_specialty_id") REFERENCES "public"."requested_specialties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."referral_documents" ADD CONSTRAINT "referral_documents_referral_id_fkey" FOREIGN KEY ("referral_id") REFERENCES "public"."ime_referrals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."referral_documents" ADD CONSTRAINT "referral_documents_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
