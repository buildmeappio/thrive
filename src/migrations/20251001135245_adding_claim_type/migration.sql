-- AlterTable
ALTER TABLE "public"."claimants" ADD COLUMN     "claim_type_id" UUID;

-- CreateTable
CREATE TABLE "public"."claim_types" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "claim_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "claim_types_id_key" ON "public"."claim_types"("id");

-- AddForeignKey
ALTER TABLE "public"."claimants" ADD CONSTRAINT "claimants_claim_type_id_fkey" FOREIGN KEY ("claim_type_id") REFERENCES "public"."claim_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
