-- AlterTable
ALTER TABLE "public"."contracts" ADD COLUMN     "signed_pdf_s3_key" VARCHAR(500),
ADD COLUMN     "signed_pdf_sha256" VARCHAR(64),
ADD COLUMN     "unsigned_pdf_s3_key" VARCHAR(500),
ADD COLUMN     "unsigned_pdf_sha256" VARCHAR(64);
