/*
  Warnings:

  - You are about to drop the column `type_id` on the `organizations` table. All the data in the column will be lost.

*/
-- Step 1: Add the new type column (nullable for now)
ALTER TABLE "organizations" ADD COLUMN "type" VARCHAR(255);

-- Step 2: Copy existing organization type names from organization_types table
UPDATE "organizations" o
SET "type" = ot.name
FROM "organization_types" ot
WHERE o.type_id = ot.id AND o.type_id IS NOT NULL;

-- Step 3: Drop foreign key constraints
ALTER TABLE "organizations" DROP CONSTRAINT IF EXISTS "organizations_address_id_fkey";
ALTER TABLE "organizations" DROP CONSTRAINT IF EXISTS "organizations_type_id_fkey";

-- Step 4: Drop the type_id column and make address_id optional
ALTER TABLE "organizations" DROP COLUMN "type_id";
ALTER TABLE "organizations" ALTER COLUMN "address_id" DROP NOT NULL;

-- Step 5: Re-add the address foreign key constraint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
