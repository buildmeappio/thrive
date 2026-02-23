-- AlterTable
ALTER TABLE "public"."examiner_profiles" ADD COLUMN     "accept_virtual_assessments" BOOLEAN,
ADD COLUMN     "max_travel_distance" VARCHAR(255),
ADD COLUMN     "preferred_regions" VARCHAR(255);
