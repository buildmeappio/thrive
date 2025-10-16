-- AlterTable
ALTER TABLE "public"."examiner_profiles" ADD COLUMN     "account_number" VARCHAR(12),
ADD COLUMN     "cheque_mailing_address" TEXT,
ADD COLUMN     "institution_number" VARCHAR(3),
ADD COLUMN     "interac_email" VARCHAR(255),
ADD COLUMN     "payout_method" VARCHAR(20),
ADD COLUMN     "transit_number" VARCHAR(5);
