/*
  Warnings:

  - You are about to drop the column `report_turnaround_days` on the `examiner_fee_structure` table. All the data in the column will be lost.
  - You are about to drop the column `standard_ime_fee` on the `examiner_fee_structure` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."contracts" ADD COLUMN     "signed_by_examiner" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."examiner_fee_structure" DROP COLUMN "report_turnaround_days",
DROP COLUMN "standard_ime_fee";
