-- CreateTable
CREATE TABLE "public"."examiner_fee_structure" (
    "id" UUID NOT NULL,
    "examiner_profile_id" UUID NOT NULL,
    "standard_ime_fee" DECIMAL(10,2) NOT NULL,
    "virtual_ime_fee" DECIMAL(10,2) NOT NULL,
    "record_review_fee" DECIMAL(10,2) NOT NULL,
    "hourly_rate" DECIMAL(10,2),
    "report_turnaround_days" INTEGER,
    "cancellation_fee" DECIMAL(10,2) NOT NULL,
    "payment_terms" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "examiner_fee_structure_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "examiner_fee_structure_examiner_profile_id_idx" ON "public"."examiner_fee_structure"("examiner_profile_id");

-- AddForeignKey
ALTER TABLE "public"."examiner_fee_structure" ADD CONSTRAINT "examiner_fee_structure_examiner_profile_id_fkey" FOREIGN KEY ("examiner_profile_id") REFERENCES "public"."examiner_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
