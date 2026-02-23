/*
  Warnings:

  - You are about to drop the `claimant_availability` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `claimant_availability_slots` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."ClaimantBookingStatus" AS ENUM ('ACCEPT', 'DECLINE', 'REQUEST_MORE_INFO');

-- DropForeignKey
ALTER TABLE "public"."claimant_availability" DROP CONSTRAINT "claimant_availability_claimant_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."claimant_availability" DROP CONSTRAINT "claimant_availability_examination_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."claimant_availability_slots" DROP CONSTRAINT "claimant_availability_slots_availability_id_fkey";

-- DropTable
DROP TABLE "public"."claimant_availability";

-- DropTable
DROP TABLE "public"."claimant_availability_slots";

-- DropEnum
DROP TYPE "public"."TimeBand";

-- CreateTable
CREATE TABLE "public"."claimant_bookings" (
    "id" UUID NOT NULL,
    "examination_id" UUID NOT NULL,
    "claimant_id" UUID NOT NULL,
    "examiner_profile_id" UUID NOT NULL,
    "booking_time" TIMESTAMPTZ NOT NULL,
    "preference" "public"."ClaimantPreference" NOT NULL,
    "accessibility_notes" TEXT,
    "consent_ack" BOOLEAN NOT NULL DEFAULT false,
    "status" "public"."ClaimantBookingStatus",
    "interpreter_id" UUID,
    "chaperone_id" UUID,
    "transporter_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "claimant_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "claimant_bookings_id_key" ON "public"."claimant_bookings"("id");

-- CreateIndex
CREATE INDEX "claimant_bookings_examination_id_idx" ON "public"."claimant_bookings"("examination_id");

-- CreateIndex
CREATE INDEX "claimant_bookings_examiner_profile_id_idx" ON "public"."claimant_bookings"("examiner_profile_id");

-- CreateIndex
CREATE INDEX "claimant_bookings_booking_time_idx" ON "public"."claimant_bookings"("booking_time");

-- CreateIndex
CREATE INDEX "claimant_bookings_status_idx" ON "public"."claimant_bookings"("status");

-- CreateIndex
CREATE UNIQUE INDEX "claimant_bookings_examination_id_claimant_id_key" ON "public"."claimant_bookings"("examination_id", "claimant_id");

-- AddForeignKey
ALTER TABLE "public"."claimant_bookings" ADD CONSTRAINT "claimant_bookings_examination_id_fkey" FOREIGN KEY ("examination_id") REFERENCES "public"."examinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."claimant_bookings" ADD CONSTRAINT "claimant_bookings_claimant_id_fkey" FOREIGN KEY ("claimant_id") REFERENCES "public"."claimants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."claimant_bookings" ADD CONSTRAINT "claimant_bookings_examiner_profile_id_fkey" FOREIGN KEY ("examiner_profile_id") REFERENCES "public"."examiner_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."claimant_bookings" ADD CONSTRAINT "claimant_bookings_interpreter_id_fkey" FOREIGN KEY ("interpreter_id") REFERENCES "public"."interpreters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."claimant_bookings" ADD CONSTRAINT "claimant_bookings_chaperone_id_fkey" FOREIGN KEY ("chaperone_id") REFERENCES "public"."chaperones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."claimant_bookings" ADD CONSTRAINT "claimant_bookings_transporter_id_fkey" FOREIGN KEY ("transporter_id") REFERENCES "public"."transporters"("id") ON DELETE SET NULL ON UPDATE CASCADE;
