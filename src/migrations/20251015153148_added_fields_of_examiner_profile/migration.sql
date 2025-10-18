-- AlterTable
ALTER TABLE "public"."examiner_profiles" ADD COLUMN     "activation_step" VARCHAR(255),
ADD COLUMN     "assessment_types" TEXT[];
