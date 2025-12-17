-- AlterTable
ALTER TABLE "examiner_profiles" ADD COLUMN     "accept_in_person_assessments" BOOLEAN,
ADD COLUMN     "autodeposit_enabled" BOOLEAN,
ADD COLUMN     "email_interview_requests" BOOLEAN,
ADD COLUMN     "email_marketing" BOOLEAN,
ADD COLUMN     "email_new_imes" BOOLEAN,
ADD COLUMN     "email_payment_payout" BOOLEAN,
ADD COLUMN     "government_id_document_id" UUID,
ADD COLUMN     "legal_name" VARCHAR(255),
ADD COLUMN     "max_imes_per_week" VARCHAR(20),
ADD COLUMN     "medical_license_active" BOOLEAN,
ADD COLUMN     "phipa_compliance" BOOLEAN,
ADD COLUMN     "pipeda_compliance" BOOLEAN,
ADD COLUMN     "sin" VARCHAR(9),
ADD COLUMN     "sms_notifications" BOOLEAN,
ADD COLUMN     "specialty_certificates_document_ids" TEXT[],
ADD COLUMN     "travel_to_claimants" BOOLEAN;

-- AddForeignKey
ALTER TABLE "examiner_profiles" ADD CONSTRAINT "examiner_profiles_government_id_document_id_fkey" FOREIGN KEY ("government_id_document_id") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
