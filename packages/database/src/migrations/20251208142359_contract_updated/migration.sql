-- AlterTable
ALTER TABLE "public"."contracts" ADD COLUMN     "application_id" UUID,
ALTER COLUMN "examiner_profile_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."contracts" ADD CONSTRAINT "contracts_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."examiner_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
