/*
  Warnings:

  - You are about to drop the column `virtual_ime_fee` on the `examiner_fee_structure` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."examiner_fee_structure" DROP COLUMN "virtual_ime_fee",
ADD COLUMN     "ime_fee" DECIMAL(10,2);
