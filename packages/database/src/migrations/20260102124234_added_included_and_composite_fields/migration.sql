-- AlterTable
ALTER TABLE "fee_structure_variables" ADD COLUMN     "composite" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "included" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reference_key" VARCHAR(64),
ADD COLUMN     "sub_fields" JSONB;
