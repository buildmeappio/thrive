-- DropForeignKey
ALTER TABLE "public"."examiner_profiles" DROP CONSTRAINT "examiner_profiles_insurance_document_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."examiner_profiles" DROP CONSTRAINT "examiner_profiles_nda_document_id_fkey";

-- AlterTable
ALTER TABLE "public"."examiner_profiles" ALTER COLUMN "nda_document_id" DROP NOT NULL,
ALTER COLUMN "insurance_document_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."examiner_profiles" ADD CONSTRAINT "examiner_profiles_nda_document_id_fkey" FOREIGN KEY ("nda_document_id") REFERENCES "public"."documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examiner_profiles" ADD CONSTRAINT "examiner_profiles_insurance_document_id_fkey" FOREIGN KEY ("insurance_document_id") REFERENCES "public"."documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
