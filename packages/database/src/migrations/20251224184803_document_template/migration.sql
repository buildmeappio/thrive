-- AlterTable
ALTER TABLE "document_templates" ADD COLUMN     "fee_structure_id" UUID;

-- CreateIndex
CREATE INDEX "document_templates_fee_structure_id_idx" ON "document_templates"("fee_structure_id");

-- AddForeignKey
ALTER TABLE "document_templates" ADD CONSTRAINT "document_templates_fee_structure_id_fkey" FOREIGN KEY ("fee_structure_id") REFERENCES "fee_structures"("id") ON DELETE SET NULL ON UPDATE CASCADE;
