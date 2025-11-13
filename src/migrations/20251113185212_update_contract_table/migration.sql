/*
  Warnings:

  - You are about to drop the column `drive_pdf_id` on the `contracts` table. All the data in the column will be lost.
  - You are about to drop the column `signed_pdf_s3_key` on the `contracts` table. All the data in the column will be lost.
  - You are about to drop the column `signed_pdf_sha256` on the `contracts` table. All the data in the column will be lost.
  - You are about to drop the column `unsigned_pdf_s3_key` on the `contracts` table. All the data in the column will be lost.
  - You are about to drop the column `unsigned_pdf_sha256` on the `contracts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."contracts" DROP COLUMN "drive_pdf_id",
DROP COLUMN "signed_pdf_s3_key",
DROP COLUMN "signed_pdf_sha256",
DROP COLUMN "unsigned_pdf_s3_key",
DROP COLUMN "unsigned_pdf_sha256",
ADD COLUMN     "drive_html_id" VARCHAR(500),
ADD COLUMN     "signed_html_s3_key" VARCHAR(500),
ADD COLUMN     "signed_html_sha256" VARCHAR(64),
ADD COLUMN     "unsigned_html_s3_key" VARCHAR(500),
ADD COLUMN     "unsigned_html_sha256" VARCHAR(64);
