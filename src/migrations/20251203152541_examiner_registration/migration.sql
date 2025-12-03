-- AlterTable
ALTER TABLE "public"."examiner_profiles" ADD COLUMN     "assessment_type_other" VARCHAR(255),
ADD COLUMN     "currently_conducting_imes" BOOLEAN,
ADD COLUMN     "imes_completed" VARCHAR(50),
ADD COLUMN     "insurers_or_clinics" TEXT,
ADD COLUMN     "redacted_ime_report_document_id" UUID;

-- AddForeignKey
ALTER TABLE "public"."examiner_profiles" ADD CONSTRAINT "examiner_profiles_redacted_ime_report_document_id_fkey" FOREIGN KEY ("redacted_ime_report_document_id") REFERENCES "public"."documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
