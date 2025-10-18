-- CreateEnum
CREATE TYPE "public"."OrganizationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."UrgencyLevel" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "public"."ExaminationSecureLinkStatus" AS ENUM ('PENDING', 'SUBMITTED', 'INVALID');

-- CreateEnum
CREATE TYPE "public"."ClaimantPreference" AS ENUM ('IN_PERSON', 'VIRTUAL', 'EITHER');

-- CreateEnum
CREATE TYPE "public"."TimeBand" AS ENUM ('MORNING', 'AFTERNOON', 'EVENING', 'EITHER');

-- CreateTable
CREATE TABLE "public"."organization_types" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "organization_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."departments" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."roles" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification_codes" (
    "id" UUID NOT NULL,
    "code" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "account_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "verification_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."organizations" (
    "id" UUID NOT NULL,
    "type_id" UUID NOT NULL,
    "address_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "website" VARCHAR(255),
    "is_authorized" BOOLEAN NOT NULL DEFAULT false,
    "data_sharing_consent" BOOLEAN NOT NULL DEFAULT false,
    "agree_to_terms_and_privacy" BOOLEAN NOT NULL DEFAULT false,
    "status" "public"."OrganizationStatus" NOT NULL DEFAULT 'PENDING',
    "approved_by" UUID,
    "approved_at" TIMESTAMPTZ,
    "rejected_by" UUID,
    "rejected_at" TIMESTAMPTZ,
    "rejected_reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."organization_managers" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "job_title" VARCHAR(255),
    "department_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "organization_managers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" UUID NOT NULL,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255),
    "gender" VARCHAR(255),
    "date_of_birth" TIMESTAMPTZ,
    "profile_photo_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."accounts" (
    "id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."addresses" (
    "id" UUID NOT NULL,
    "address" TEXT NOT NULL,
    "street" VARCHAR(255),
    "province" VARCHAR(255),
    "city" VARCHAR(255),
    "postal_code" VARCHAR(255),
    "suite" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."claimants" (
    "id" UUID NOT NULL,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "date_of_birth" DATE,
    "gender" VARCHAR(50),
    "phone_number" VARCHAR(255),
    "email_address" VARCHAR(255),
    "related_cases_details" TEXT,
    "family_doctor_name" VARCHAR(255),
    "family_doctor_email_address" VARCHAR(255),
    "family_doctor_phone_number" VARCHAR(255),
    "family_doctor_fax_number" VARCHAR(255),
    "address_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "claimants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."legal_representatives" (
    "id" UUID NOT NULL,
    "company_name" VARCHAR(255),
    "contact_person" VARCHAR(255),
    "phone_number" VARCHAR(255),
    "fax_number" VARCHAR(255),
    "address_id" UUID,

    CONSTRAINT "legal_representatives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."insurances" (
    "id" UUID NOT NULL,
    "email_address" VARCHAR(255) NOT NULL,
    "company_name" VARCHAR(255) NOT NULL,
    "contact_person" VARCHAR(255) NOT NULL,
    "policy_number" VARCHAR(255) NOT NULL,
    "claim_number" VARCHAR(255) NOT NULL,
    "date_of_loss" TIMESTAMPTZ NOT NULL,
    "policy_holder_is_claimant" BOOLEAN NOT NULL DEFAULT false,
    "policy_holder_first_name" VARCHAR(255) NOT NULL,
    "policy_holder_last_name" VARCHAR(255) NOT NULL,
    "phone_number" VARCHAR(255) NOT NULL,
    "fax_number" VARCHAR(255) NOT NULL,
    "address_id" UUID,

    CONSTRAINT "insurances_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "public"."examinations" (
    "id" UUID NOT NULL,
    "case_number" VARCHAR(255) NOT NULL,
    "case_id" UUID NOT NULL,
    "examination_type_id" UUID NOT NULL,
    "due_date" TIMESTAMPTZ,
    "notes" TEXT,
    "additional_notes" TEXT,
    "urgency_level" "public"."UrgencyLevel",
    "examiner_id" UUID,
    "status_id" UUID NOT NULL,
    "preference" "public"."ClaimantPreference" NOT NULL,
    "support_person" BOOLEAN NOT NULL DEFAULT false,
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
CREATE TABLE "public"."claimant_availability" (
    "id" UUID NOT NULL,
    "examination_id" UUID NOT NULL,
    "claimant_id" UUID NOT NULL,
    "preference" "public"."ClaimantPreference" NOT NULL,
    "accessibility_notes" TEXT,
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
CREATE TABLE "public"."languages" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "public"."documents" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "size" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."examination_types" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "short_form" VARCHAR(255),
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "examination_types_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "public"."_prisma_seeds" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "run_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "_prisma_seeds_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "organization_types_id_key" ON "public"."organization_types"("id");

-- CreateIndex
CREATE UNIQUE INDEX "departments_id_key" ON "public"."departments"("id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_id_key" ON "public"."roles"("id");

-- CreateIndex
CREATE UNIQUE INDEX "verification_codes_id_key" ON "public"."verification_codes"("id");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_id_key" ON "public"."organizations"("id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_managers_id_key" ON "public"."organization_managers"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "public"."users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_id_key" ON "public"."accounts"("id");

-- CreateIndex
CREATE UNIQUE INDEX "addresses_id_key" ON "public"."addresses"("id");

-- CreateIndex
CREATE UNIQUE INDEX "claimants_id_key" ON "public"."claimants"("id");

-- CreateIndex
CREATE UNIQUE INDEX "legal_representatives_id_key" ON "public"."legal_representatives"("id");

-- CreateIndex
CREATE UNIQUE INDEX "insurances_id_key" ON "public"."insurances"("id");

-- CreateIndex
CREATE UNIQUE INDEX "cases_id_key" ON "public"."cases"("id");

-- CreateIndex
CREATE UNIQUE INDEX "examinations_id_key" ON "public"."examinations"("id");

-- CreateIndex
CREATE UNIQUE INDEX "examinations_case_number_key" ON "public"."examinations"("case_number");

-- CreateIndex
CREATE INDEX "examinations_case_id_idx" ON "public"."examinations"("case_id");

-- CreateIndex
CREATE INDEX "examinations_case_number_idx" ON "public"."examinations"("case_number");

-- CreateIndex
CREATE UNIQUE INDEX "examination_secure_links_id_key" ON "public"."examination_secure_links"("id");

-- CreateIndex
CREATE UNIQUE INDEX "claimant_availability_id_key" ON "public"."claimant_availability"("id");

-- CreateIndex
CREATE UNIQUE INDEX "claimant_availability_slots_id_key" ON "public"."claimant_availability_slots"("id");

-- CreateIndex
CREATE UNIQUE INDEX "examination_services_id_key" ON "public"."examination_services"("id");

-- CreateIndex
CREATE UNIQUE INDEX "examination_interpreter_id_key" ON "public"."examination_interpreter"("id");

-- CreateIndex
CREATE UNIQUE INDEX "examination_interpreter_examination_service_id_key" ON "public"."examination_interpreter"("examination_service_id");

-- CreateIndex
CREATE UNIQUE INDEX "languages_id_key" ON "public"."languages"("id");

-- CreateIndex
CREATE UNIQUE INDEX "examination_transport_id_key" ON "public"."examination_transport"("id");

-- CreateIndex
CREATE UNIQUE INDEX "examination_transport_examination_service_id_key" ON "public"."examination_transport"("examination_service_id");

-- CreateIndex
CREATE UNIQUE INDEX "case_documents_id_key" ON "public"."case_documents"("id");

-- CreateIndex
CREATE UNIQUE INDEX "case_documents_case_id_document_id_key" ON "public"."case_documents"("case_id", "document_id");

-- CreateIndex
CREATE UNIQUE INDEX "documents_id_key" ON "public"."documents"("id");

-- CreateIndex
CREATE UNIQUE INDEX "examination_types_id_key" ON "public"."examination_types"("id");

-- CreateIndex
CREATE UNIQUE INDEX "case_types_id_key" ON "public"."case_types"("id");

-- CreateIndex
CREATE UNIQUE INDEX "_prisma_seeds_id_key" ON "public"."_prisma_seeds"("id");

-- CreateIndex
CREATE UNIQUE INDEX "case_statuses_id_key" ON "public"."case_statuses"("id");

-- AddForeignKey
ALTER TABLE "public"."verification_codes" ADD CONSTRAINT "verification_codes_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organizations" ADD CONSTRAINT "organizations_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organizations" ADD CONSTRAINT "organizations_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "public"."organization_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organization_managers" ADD CONSTRAINT "organization_managers_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organization_managers" ADD CONSTRAINT "organization_managers_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organization_managers" ADD CONSTRAINT "organization_managers_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_profile_photo_id_fkey" FOREIGN KEY ("profile_photo_id") REFERENCES "public"."documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."claimants" ADD CONSTRAINT "claimants_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "public"."claimant_availability" ADD CONSTRAINT "claimant_availability_claimant_id_fkey" FOREIGN KEY ("claimant_id") REFERENCES "public"."claimants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."claimant_availability_slots" ADD CONSTRAINT "claimant_availability_slots_availability_id_fkey" FOREIGN KEY ("availability_id") REFERENCES "public"."claimant_availability"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
