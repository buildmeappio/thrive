/*
  Warnings:

  - You are about to drop the column `assessment_types` on the `examiner_applications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."examiner_applications" DROP COLUMN "assessment_types",
ADD COLUMN     "assessment_type_ids" TEXT[];

-- CreateTable
CREATE TABLE "public"."assessment_types" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "assessment_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assessment_types_id_key" ON "public"."assessment_types"("id");
