-- AlterTable
ALTER TABLE "contracts" ADD COLUMN     "fee_structure_id" UUID,
ADD COLUMN     "field_values" JSONB;

-- CreateIndex
CREATE INDEX "contracts_fee_structure_id_idx" ON "contracts"("fee_structure_id");

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_fee_structure_id_fkey" FOREIGN KEY ("fee_structure_id") REFERENCES "fee_structures"("id") ON DELETE SET NULL ON UPDATE CASCADE;
