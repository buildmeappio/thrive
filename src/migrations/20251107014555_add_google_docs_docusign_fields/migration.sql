-- AlterEnum: Add DOCUSIGN to SignatureMethod
ALTER TYPE "public"."SignatureMethod" ADD VALUE 'DOCUSIGN';

-- AlterEnum: Add DECLINED and PENDING_SIGNATURE to ContractStatus
ALTER TYPE "public"."ContractStatus" ADD VALUE 'DECLINED';
ALTER TYPE "public"."ContractStatus" ADD VALUE 'PENDING_SIGNATURE';

-- AlterTable: Add Google Docs fields to template_versions
ALTER TABLE "public"."template_versions" 
  ADD COLUMN "google_doc_template_id" VARCHAR(255),
  ADD COLUMN "google_doc_folder_id" VARCHAR(255);

-- CreateIndex: Add index on google_doc_template_id
CREATE INDEX "template_versions_google_doc_template_id_idx" ON "public"."template_versions"("google_doc_template_id");

-- AlterTable: Add Google Docs and DocuSign fields to contracts
ALTER TABLE "public"."contracts" 
  ADD COLUMN "google_doc_id" VARCHAR(255),
  ADD COLUMN "google_doc_url" VARCHAR(500),
  ADD COLUMN "drive_pdf_id" VARCHAR(255),
  ADD COLUMN "docusign_envelope_id" VARCHAR(255),
  ADD COLUMN "docusign_status" VARCHAR(100);

-- CreateIndex: Add indexes on google_doc_id and docusign_envelope_id
CREATE INDEX "contracts_google_doc_id_idx" ON "public"."contracts"("google_doc_id");
CREATE INDEX "contracts_docusign_envelope_id_idx" ON "public"."contracts"("docusign_envelope_id");

-- AlterTable: Add DocuSign fields to signatures
ALTER TABLE "public"."signatures" 
  ADD COLUMN "docusign_recipient_id" VARCHAR(255),
  ADD COLUMN "docusign_signature_id" VARCHAR(255),
  ADD COLUMN "docusign_signed_at" TIMESTAMPTZ;

-- Migrate existing data: Move googleDocId and drivePdfId from JSON data field to new columns
-- This migrates data from contracts.data->>'googleDocId' to contracts.google_doc_id
-- and contracts.data->>'drivePdfId' to contracts.drive_pdf_id
UPDATE "public"."contracts" 
SET 
  "google_doc_id" = CASE 
    WHEN "data"->>'googleDocId' IS NOT NULL AND "data"->>'googleDocId' != '' 
    THEN "data"->>'googleDocId' 
    ELSE NULL 
  END,
  "drive_pdf_id" = CASE 
    WHEN "data"->>'drivePdfId' IS NOT NULL AND "data"->>'drivePdfId' != '' 
    THEN "data"->>'drivePdfId' 
    ELSE NULL 
  END
WHERE "data"->>'googleDocId' IS NOT NULL OR "data"->>'drivePdfId' IS NOT NULL;

