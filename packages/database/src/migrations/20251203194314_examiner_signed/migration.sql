-- AlterTable
ALTER TABLE "public"."examiner_profiles" ADD COLUMN     "contract_confirmed_by_admin_at" TIMESTAMPTZ,
ADD COLUMN     "contract_signed_by_examiner_at" TIMESTAMPTZ;
