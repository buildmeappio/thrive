-- CreateEnum
CREATE TYPE "public"."TemplateVersionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."ContractStatus" AS ENUM ('DRAFT', 'SENT', 'VIEWED', 'SIGNED');

-- CreateEnum
CREATE TYPE "public"."SignatureMethod" AS ENUM ('TYPED', 'DRAWN');

-- CreateTable
CREATE TABLE "public"."document_templates" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "display_name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "current_version_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "document_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."template_versions" (
    "id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "public"."TemplateVersionStatus" NOT NULL DEFAULT 'DRAFT',
    "locale" VARCHAR(10) NOT NULL DEFAULT 'en-CA',
    "body_html" TEXT NOT NULL,
    "variables_schema" JSONB NOT NULL,
    "default_data" JSONB NOT NULL DEFAULT '{}',
    "change_notes" TEXT,
    "preview_pdf_s3_key" VARCHAR(500),
    "checksum_sha256" VARCHAR(64) NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "template_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contracts" (
    "id" UUID NOT NULL,
    "examiner_profile_id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "template_version_id" UUID NOT NULL,
    "status" "public"."ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "data" JSONB NOT NULL,
    "data_hash" VARCHAR(64) NOT NULL,
    "unsigned_pdf_s3_key" VARCHAR(500),
    "unsigned_pdf_sha256" VARCHAR(64),
    "signed_pdf_s3_key" VARCHAR(500),
    "signed_pdf_sha256" VARCHAR(64),
    "sent_at" TIMESTAMPTZ,
    "viewed_at" TIMESTAMPTZ,
    "signed_at" TIMESTAMPTZ,
    "declined_at" TIMESTAMPTZ,
    "void_reason" TEXT,
    "access_token" VARCHAR(255),
    "access_token_expires_at" TIMESTAMPTZ,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."signatures" (
    "id" UUID NOT NULL,
    "contract_id" UUID NOT NULL,
    "signer_role" VARCHAR(50) NOT NULL,
    "signer_id" UUID,
    "signer_name" VARCHAR(255) NOT NULL,
    "signer_email" VARCHAR(255),
    "method" "public"."SignatureMethod" NOT NULL,
    "consent" BOOLEAN NOT NULL DEFAULT true,
    "signature_png_s3_key" VARCHAR(500),
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "evidence" JSONB NOT NULL DEFAULT '{}',
    "signed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "signatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contract_events" (
    "id" UUID NOT NULL,
    "contract_id" UUID NOT NULL,
    "event_type" VARCHAR(50) NOT NULL,
    "actor_role" VARCHAR(50),
    "actor_id" UUID,
    "at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "meta" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "contract_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "document_templates_slug_key" ON "public"."document_templates"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "document_templates_current_version_id_key" ON "public"."document_templates"("current_version_id");

-- CreateIndex
CREATE INDEX "template_versions_template_id_idx" ON "public"."template_versions"("template_id");

-- CreateIndex
CREATE UNIQUE INDEX "template_versions_template_id_version_key" ON "public"."template_versions"("template_id", "version");

-- CreateIndex
CREATE INDEX "contracts_examiner_profile_id_idx" ON "public"."contracts"("examiner_profile_id");

-- CreateIndex
CREATE INDEX "contracts_status_idx" ON "public"."contracts"("status");

-- CreateIndex
CREATE INDEX "contracts_template_id_idx" ON "public"."contracts"("template_id");

-- CreateIndex
CREATE INDEX "signatures_contract_id_idx" ON "public"."signatures"("contract_id");

-- CreateIndex
CREATE INDEX "contract_events_contract_id_idx" ON "public"."contract_events"("contract_id");

-- CreateIndex
CREATE INDEX "contract_events_event_type_idx" ON "public"."contract_events"("event_type");

-- AddForeignKey
ALTER TABLE "public"."document_templates" ADD CONSTRAINT "document_templates_current_version_id_fkey" FOREIGN KEY ("current_version_id") REFERENCES "public"."template_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."template_versions" ADD CONSTRAINT "template_versions_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."document_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contracts" ADD CONSTRAINT "contracts_examiner_profile_id_fkey" FOREIGN KEY ("examiner_profile_id") REFERENCES "public"."examiner_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contracts" ADD CONSTRAINT "contracts_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."document_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contracts" ADD CONSTRAINT "contracts_template_version_id_fkey" FOREIGN KEY ("template_version_id") REFERENCES "public"."template_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."signatures" ADD CONSTRAINT "signatures_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contract_events" ADD CONSTRAINT "contract_events_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
