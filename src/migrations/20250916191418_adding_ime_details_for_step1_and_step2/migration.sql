/*
  Warnings:

  - You are about to drop the `requested_specialties` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `family_doctor_email_address` to the `claimants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `family_doctor_fax_number` to the `claimants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `family_doctor_name` to the `claimants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `family_doctor_phone_number` to the `claimants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `related_cases_details` to the `claimants` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."cases" DROP CONSTRAINT "cases_requested_specialty_id_fkey";

-- AlterTable
ALTER TABLE "public"."claimants" ADD COLUMN     "family_doctor_email_address" VARCHAR(255) NOT NULL,
ADD COLUMN     "family_doctor_fax_number" VARCHAR(255) NOT NULL,
ADD COLUMN     "family_doctor_name" VARCHAR(255) NOT NULL,
ADD COLUMN     "family_doctor_phone_number" VARCHAR(255) NOT NULL,
ADD COLUMN     "related_cases_details" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."requested_specialties";

-- CreateTable
CREATE TABLE "public"."legal_representatives" (
    "id" UUID NOT NULL,
    "company_name" VARCHAR(255) NOT NULL,
    "contact_person" VARCHAR(255) NOT NULL,
    "phone_number" VARCHAR(255) NOT NULL,
    "fax_number" VARCHAR(255) NOT NULL,
    "address_id" UUID NOT NULL,

    CONSTRAINT "legal_representatives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."insurances" (
    "id" UUID NOT NULL,
    "email_address" VARCHAR(255) NOT NULL,
    "company_name" VARCHAR(255) NOT NULL,
    "contact_person" VARCHAR(255) NOT NULL,
    "policy_number" VARCHAR(255) NOT NULL,
    "claim_number" VARCHAR(255) NOT NULL,
    "date_of_loss" TIMESTAMPTZ NOT NULL,
    "policy_holder_is_claimant" BOOLEAN NOT NULL DEFAULT false,
    "policy_holder_first_name" VARCHAR(255),
    "policy_holder_last_name" VARCHAR(255),
    "phone_number" VARCHAR(255) NOT NULL,
    "fax_number" VARCHAR(255) NOT NULL,
    "address_id" UUID NOT NULL,

    CONSTRAINT "insurances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."exam_types" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "exam_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "legal_representatives_id_key" ON "public"."legal_representatives"("id");

-- CreateIndex
CREATE UNIQUE INDEX "insurances_id_key" ON "public"."insurances"("id");

-- CreateIndex
CREATE UNIQUE INDEX "insurances_email_address_key" ON "public"."insurances"("email_address");

-- CreateIndex
CREATE UNIQUE INDEX "exam_types_id_key" ON "public"."exam_types"("id");

-- AddForeignKey
ALTER TABLE "public"."legal_representatives" ADD CONSTRAINT "legal_representatives_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."insurances" ADD CONSTRAINT "insurances_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cases" ADD CONSTRAINT "cases_requested_specialty_id_fkey" FOREIGN KEY ("requested_specialty_id") REFERENCES "public"."exam_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
