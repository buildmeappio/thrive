-- CreateEnum
CREATE TYPE "FeeStructureStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "FeeVariableType" AS ENUM ('MONEY', 'NUMBER', 'TEXT', 'BOOLEAN');

-- CreateTable
CREATE TABLE "fee_structures" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" "FeeStructureStatus" NOT NULL DEFAULT 'DRAFT',
    "created_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "fee_structures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_structure_variables" (
    "id" UUID NOT NULL,
    "fee_structure_id" UUID NOT NULL,
    "label" VARCHAR(80) NOT NULL,
    "key" VARCHAR(64) NOT NULL,
    "type" "FeeVariableType" NOT NULL,
    "default_value" JSONB,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "currency" VARCHAR(3),
    "decimals" INTEGER,
    "unit" VARCHAR(20),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "fee_structure_variables_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fee_structures_status_idx" ON "fee_structures"("status");

-- CreateIndex
CREATE INDEX "fee_structure_variables_fee_structure_id_idx" ON "fee_structure_variables"("fee_structure_id");

-- CreateIndex
CREATE UNIQUE INDEX "fee_structure_variables_fee_structure_id_key_key" ON "fee_structure_variables"("fee_structure_id", "key");

-- AddForeignKey
ALTER TABLE "fee_structure_variables" ADD CONSTRAINT "fee_structure_variables_fee_structure_id_fkey" FOREIGN KEY ("fee_structure_id") REFERENCES "fee_structures"("id") ON DELETE CASCADE ON UPDATE CASCADE;
