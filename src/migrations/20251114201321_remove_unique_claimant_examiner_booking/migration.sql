-- DropIndex
DROP INDEX "public"."claimant_bookings_examination_id_claimant_id_key";

-- CreateIndex
CREATE INDEX "claimant_bookings_claimant_id_idx" ON "public"."claimant_bookings"("claimant_id");
