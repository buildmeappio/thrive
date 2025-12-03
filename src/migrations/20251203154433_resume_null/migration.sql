-- DropForeignKey
ALTER TABLE "public"."examiner_profiles" DROP CONSTRAINT "examiner_profiles_resume_document_id_fkey";

-- AlterTable
ALTER TABLE "public"."examiner_profiles" ALTER COLUMN "resume_document_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."examiner_profiles" ADD CONSTRAINT "examiner_profiles_resume_document_id_fkey" FOREIGN KEY ("resume_document_id") REFERENCES "public"."documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
