-- DropForeignKey
ALTER TABLE "public"."cases" DROP CONSTRAINT "cases_examiner_id_fkey";

-- AlterTable
ALTER TABLE "public"."cases" ALTER COLUMN "examiner_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."cases" ADD CONSTRAINT "cases_examiner_id_fkey" FOREIGN KEY ("examiner_id") REFERENCES "public"."accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
