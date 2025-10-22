/*
  Warnings:

  - You are about to drop the column `claimant_id` on the `cases` table. All the data in the column will be lost.
  - You are about to drop the column `insurance_id` on the `cases` table. All the data in the column will be lost.
  - You are about to drop the column `legal_representative_id` on the `cases` table. All the data in the column will be lost.
  - Added the required column `claimant_id` to the `examinations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."cases" DROP CONSTRAINT "cases_claimant_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."cases" DROP CONSTRAINT "cases_insurance_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."cases" DROP CONSTRAINT "cases_legal_representative_id_fkey";

-- AlterTable
ALTER TABLE "public"."cases" DROP COLUMN "claimant_id",
DROP COLUMN "insurance_id",
DROP COLUMN "legal_representative_id";

-- AlterTable
ALTER TABLE "public"."examinations" ADD COLUMN     "claimant_id" UUID NOT NULL,
ADD COLUMN     "insurance_id" UUID,
ADD COLUMN     "legal_representative_id" UUID;

-- AddForeignKey
ALTER TABLE "public"."examinations" ADD CONSTRAINT "examinations_claimant_id_fkey" FOREIGN KEY ("claimant_id") REFERENCES "public"."claimants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examinations" ADD CONSTRAINT "examinations_insurance_id_fkey" FOREIGN KEY ("insurance_id") REFERENCES "public"."insurances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examinations" ADD CONSTRAINT "examinations_legal_representative_id_fkey" FOREIGN KEY ("legal_representative_id") REFERENCES "public"."legal_representatives"("id") ON DELETE SET NULL ON UPDATE CASCADE;
