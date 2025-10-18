/*
  Warnings:

  - Made the column `claim_type_id` on table `claimants` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."claimants" DROP CONSTRAINT "claimants_claim_type_id_fkey";

-- AlterTable
ALTER TABLE "public"."claimants" ALTER COLUMN "claim_type_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."documents" ADD COLUMN     "display_name" VARCHAR(255);

-- CreateTable
CREATE TABLE "public"."examination_type_benefits" (
    "id" UUID NOT NULL,
    "examination_type_id" UUID NOT NULL,
    "benefit" VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "examination_type_benefits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."examination_selected_benefits" (
    "id" UUID NOT NULL,
    "examination_id" UUID NOT NULL,
    "benefit_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "examination_selected_benefits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "examination_type_benefits_id_key" ON "public"."examination_type_benefits"("id");

-- CreateIndex
CREATE INDEX "examination_type_benefits_examination_type_id_idx" ON "public"."examination_type_benefits"("examination_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "examination_selected_benefits_id_key" ON "public"."examination_selected_benefits"("id");

-- CreateIndex
CREATE INDEX "examination_selected_benefits_examination_id_idx" ON "public"."examination_selected_benefits"("examination_id");

-- CreateIndex
CREATE INDEX "examination_selected_benefits_benefit_id_idx" ON "public"."examination_selected_benefits"("benefit_id");

-- CreateIndex
CREATE UNIQUE INDEX "examination_selected_benefits_examination_id_benefit_id_key" ON "public"."examination_selected_benefits"("examination_id", "benefit_id");

-- AddForeignKey
ALTER TABLE "public"."claimants" ADD CONSTRAINT "claimants_claim_type_id_fkey" FOREIGN KEY ("claim_type_id") REFERENCES "public"."claim_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examination_type_benefits" ADD CONSTRAINT "examination_type_benefits_examination_type_id_fkey" FOREIGN KEY ("examination_type_id") REFERENCES "public"."examination_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examination_selected_benefits" ADD CONSTRAINT "examination_selected_benefits_examination_id_fkey" FOREIGN KEY ("examination_id") REFERENCES "public"."examinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examination_selected_benefits" ADD CONSTRAINT "examination_selected_benefits_benefit_id_fkey" FOREIGN KEY ("benefit_id") REFERENCES "public"."examination_type_benefits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
