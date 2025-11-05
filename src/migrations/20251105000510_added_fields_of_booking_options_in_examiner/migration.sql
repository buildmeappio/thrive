-- AlterTable
ALTER TABLE "public"."examiner_profiles" ADD COLUMN     "appointment_duration" VARCHAR(20),
ADD COLUMN     "appointment_types" TEXT[],
ADD COLUMN     "minimum_notice_unit" VARCHAR(20),
ADD COLUMN     "minimum_notice_value" VARCHAR(20);
