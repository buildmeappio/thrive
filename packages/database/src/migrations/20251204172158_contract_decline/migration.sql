-- AlterTable
ALTER TABLE "public"."examiner_profiles" ADD COLUMN     "contract_decline_reason" TEXT,
ADD COLUMN     "contract_declined_by_admin_at" TIMESTAMPTZ,
ADD COLUMN     "contract_declined_by_examiner_at" TIMESTAMPTZ;
