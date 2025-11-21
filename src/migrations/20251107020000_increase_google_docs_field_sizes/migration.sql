-- AlterTable: Increase size of Google Docs fields in contracts table
-- google_doc_id: VARCHAR(255) -> VARCHAR(500)
-- google_doc_url: VARCHAR(500) -> TEXT (unlimited)
-- drive_pdf_id: VARCHAR(255) -> VARCHAR(500)

ALTER TABLE "public"."contracts" 
  ALTER COLUMN "google_doc_id" TYPE VARCHAR(500),
  ALTER COLUMN "google_doc_url" TYPE TEXT,
  ALTER COLUMN "drive_pdf_id" TYPE VARCHAR(500);
