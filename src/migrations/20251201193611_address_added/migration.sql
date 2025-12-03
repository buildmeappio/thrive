-- AlterTable
ALTER TABLE "public"."examiner_profiles" ADD COLUMN     "address_id" UUID,
ALTER COLUMN "province_of_licensure" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."examiner_profiles" ADD CONSTRAINT "examiner_profiles_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
