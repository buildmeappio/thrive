/*
  Warnings:

  - You are about to drop the column `case_number` on the `ime_referrals` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[case_number]` on the table `cases` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `case_number` to the `cases` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."cases" ADD COLUMN     "case_number" VARCHAR(255);

-- Update cases table to add case number format is (IME-XXXXXXXXXX) and will be unique
WITH numbered AS (
  SELECT id,
         'IME-' || LPAD(row_number() OVER (ORDER BY id)::text, 10, '0') AS new_case_number
  FROM cases
  WHERE case_number IS NULL
)
UPDATE cases c
SET case_number = n.new_case_number
FROM numbered n
WHERE c.id = n.id;


-- Drop column case number from ime referrals table
ALTER TABLE "public"."ime_referrals" DROP COLUMN "case_number";

-- Make non null case number
ALTER TABLE "public"."cases" ALTER COLUMN "case_number" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "cases_case_number_key" ON "public"."cases"("case_number");

-- CreateIndex
CREATE INDEX "cases_case_number_idx" ON "public"."cases"("case_number");
