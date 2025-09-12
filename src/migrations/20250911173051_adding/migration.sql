/*
  Warnings:

  - You are about to drop the column `case_number` on the `ime_referrals` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[case_number]` on the table `cases` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `case_number` to the `cases` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."cases" ADD COLUMN     "case_number" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "public"."ime_referrals" DROP COLUMN "case_number";

-- CreateIndex
CREATE UNIQUE INDEX "cases_case_number_key" ON "public"."cases"("case_number");

-- CreateIndex
CREATE INDEX "cases_case_number_idx" ON "public"."cases"("case_number");
