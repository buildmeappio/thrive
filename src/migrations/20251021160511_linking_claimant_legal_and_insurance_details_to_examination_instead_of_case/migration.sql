/*
  Warnings:

  - You are about to drop the column `claimant_id` on the `cases` table. All the data in the column will be lost.
  - You are about to drop the column `insurance_id` on the `cases` table. All the data in the column will be lost.
  - You are about to drop the column `legal_representative_id` on the `cases` table. All the data in the column will be lost.
  - Added the required column `claimant_id` to the `examinations` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add new columns to examinations table (nullable first to allow data migration)
ALTER TABLE "public"."examinations" 
ADD COLUMN "claimant_id" UUID,
ADD COLUMN "insurance_id" UUID,
ADD COLUMN "legal_representative_id" UUID;

-- Step 2: Migrate data from cases to examinations
-- Copy claimant_id, insurance_id, and legal_representative_id from cases to all related examinations
UPDATE "public"."examinations" e
SET 
  "claimant_id" = c."claimant_id",
  "insurance_id" = c."insurance_id",
  "legal_representative_id" = c."legal_representative_id"
FROM "public"."cases" c
WHERE e."case_id" = c."id";

-- Step 3: Make claimant_id NOT NULL (as required by schema)
-- This should be safe now since we've migrated the data
ALTER TABLE "public"."examinations" 
ALTER COLUMN "claimant_id" SET NOT NULL;

-- Step 4: Add foreign key constraints to examinations
ALTER TABLE "public"."examinations" 
ADD CONSTRAINT "examinations_claimant_id_fkey" 
FOREIGN KEY ("claimant_id") REFERENCES "public"."claimants"("id") 
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."examinations" 
ADD CONSTRAINT "examinations_insurance_id_fkey" 
FOREIGN KEY ("insurance_id") REFERENCES "public"."insurances"("id") 
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."examinations" 
ADD CONSTRAINT "examinations_legal_representative_id_fkey" 
FOREIGN KEY ("legal_representative_id") REFERENCES "public"."legal_representatives"("id") 
ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 5: Drop foreign key constraints from cases table
ALTER TABLE "public"."cases" DROP CONSTRAINT IF EXISTS "cases_claimant_id_fkey";
ALTER TABLE "public"."cases" DROP CONSTRAINT IF EXISTS "cases_insurance_id_fkey";
ALTER TABLE "public"."cases" DROP CONSTRAINT IF EXISTS "cases_legal_representative_id_fkey";

-- Step 6: Finally, drop the columns from cases table (data is now safely in examinations)
ALTER TABLE "public"."cases" 
DROP COLUMN "claimant_id",
DROP COLUMN "insurance_id",
DROP COLUMN "legal_representative_id";
