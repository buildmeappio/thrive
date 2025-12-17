-- AlterTable
ALTER TABLE "public"."examiner_applications" ADD COLUMN     "cancellation_fee" DECIMAL(10,2),
ADD COLUMN     "hourly_rate" DECIMAL(10,2),
ADD COLUMN     "ime_fee" DECIMAL(10,2),
ADD COLUMN     "payment_terms" TEXT,
ADD COLUMN     "record_review_fee" DECIMAL(10,2);
