/*
  Warnings:

  - You are about to drop the `examiner_override_hours` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `examiner_override_time_slots` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `examiner_weekly_hours` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `examiner_weekly_time_slots` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `interpreter_availability` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."ProviderType" AS ENUM ('EXAMINER', 'CHAPERONE', 'INTERPRETER', 'TRANSPORTER');

-- CreateEnum
CREATE TYPE "public"."Weekday" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- DropForeignKey
ALTER TABLE "public"."examiner_override_hours" DROP CONSTRAINT "examiner_override_hours_examiner_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."examiner_override_time_slots" DROP CONSTRAINT "examiner_override_time_slots_override_hour_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."examiner_weekly_hours" DROP CONSTRAINT "examiner_weekly_hours_examiner_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."examiner_weekly_time_slots" DROP CONSTRAINT "examiner_weekly_time_slots_weekly_hour_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."interpreter_availability" DROP CONSTRAINT "interpreter_availability_interpreter_id_fkey";

-- DropTable
DROP TABLE "public"."examiner_override_hours";

-- DropTable
DROP TABLE "public"."examiner_override_time_slots";

-- DropTable
DROP TABLE "public"."examiner_weekly_hours";

-- DropTable
DROP TABLE "public"."examiner_weekly_time_slots";

-- DropTable
DROP TABLE "public"."interpreter_availability";

-- DropEnum
DROP TYPE "public"."AvailabilityBlock";

-- CreateTable
CREATE TABLE "public"."availability_providers" (
    "id" UUID NOT NULL,
    "provider_type" "public"."ProviderType" NOT NULL,
    "ref_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "availability_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."provider_weekly_hours" (
    "id" UUID NOT NULL,
    "availability_provider_id" UUID NOT NULL,
    "day_of_week" "public"."Weekday" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "provider_weekly_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."provider_weekly_time_slots" (
    "id" UUID NOT NULL,
    "weekly_hour_id" UUID NOT NULL,
    "start_time" VARCHAR(20) NOT NULL,
    "end_time" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "provider_weekly_time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."provider_override_hours" (
    "id" UUID NOT NULL,
    "availability_provider_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "provider_override_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."provider_override_time_slots" (
    "id" UUID NOT NULL,
    "override_hour_id" UUID NOT NULL,
    "start_time" VARCHAR(20) NOT NULL,
    "end_time" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "provider_override_time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "availability_providers_ref_id_key" ON "public"."availability_providers"("ref_id");

-- CreateIndex
CREATE INDEX "provider_weekly_hours_availability_provider_id_idx" ON "public"."provider_weekly_hours"("availability_provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "provider_weekly_hours_availability_provider_id_day_of_week_key" ON "public"."provider_weekly_hours"("availability_provider_id", "day_of_week");

-- CreateIndex
CREATE INDEX "provider_weekly_time_slots_weekly_hour_id_idx" ON "public"."provider_weekly_time_slots"("weekly_hour_id");

-- CreateIndex
CREATE INDEX "provider_override_hours_availability_provider_id_idx" ON "public"."provider_override_hours"("availability_provider_id");

-- CreateIndex
CREATE INDEX "provider_override_hours_date_idx" ON "public"."provider_override_hours"("date");

-- CreateIndex
CREATE UNIQUE INDEX "provider_override_hours_availability_provider_id_date_key" ON "public"."provider_override_hours"("availability_provider_id", "date");

-- CreateIndex
CREATE INDEX "provider_override_time_slots_override_hour_id_idx" ON "public"."provider_override_time_slots"("override_hour_id");

-- AddForeignKey
ALTER TABLE "public"."availability_providers" ADD CONSTRAINT "availability_providers_examiner_ref_id_fkey" FOREIGN KEY ("ref_id") REFERENCES "public"."examiner_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."availability_providers" ADD CONSTRAINT "availability_providers_chaperone_ref_id_fkey" FOREIGN KEY ("ref_id") REFERENCES "public"."chaperones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."availability_providers" ADD CONSTRAINT "availability_providers_interpreter_ref_id_fkey" FOREIGN KEY ("ref_id") REFERENCES "public"."interpreters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."availability_providers" ADD CONSTRAINT "availability_providers_transporter_ref_id_fkey" FOREIGN KEY ("ref_id") REFERENCES "public"."transporters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."provider_weekly_hours" ADD CONSTRAINT "provider_weekly_hours_availability_provider_id_fkey" FOREIGN KEY ("availability_provider_id") REFERENCES "public"."availability_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."provider_weekly_time_slots" ADD CONSTRAINT "provider_weekly_time_slots_weekly_hour_id_fkey" FOREIGN KEY ("weekly_hour_id") REFERENCES "public"."provider_weekly_hours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."provider_override_hours" ADD CONSTRAINT "provider_override_hours_availability_provider_id_fkey" FOREIGN KEY ("availability_provider_id") REFERENCES "public"."availability_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."provider_override_time_slots" ADD CONSTRAINT "provider_override_time_slots_override_hour_id_fkey" FOREIGN KEY ("override_hour_id") REFERENCES "public"."provider_override_hours"("id") ON DELETE CASCADE ON UPDATE CASCADE;
