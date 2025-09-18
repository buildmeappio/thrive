/*
  Warnings:

  - Made the column `due_date` on table `examinations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `notes` on table `examinations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `policy_holder_first_name` on table `insurances` required. This step will fail if there are existing NULL values in that column.
  - Made the column `policy_holder_last_name` on table `insurances` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "public"."insurances_email_address_key";

-- AlterTable
ALTER TABLE "public"."addresses" ALTER COLUMN "province" DROP NOT NULL,
ALTER COLUMN "postal_code" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."examinations" ALTER COLUMN "due_date" SET NOT NULL,
ALTER COLUMN "notes" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."insurances" ALTER COLUMN "policy_holder_first_name" SET NOT NULL,
ALTER COLUMN "policy_holder_last_name" SET NOT NULL;
