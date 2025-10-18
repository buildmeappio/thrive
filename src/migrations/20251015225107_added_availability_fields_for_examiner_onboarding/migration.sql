-- AlterTable
ALTER TABLE "public"."examiner_profiles" ADD COLUMN     "advance_booking" VARCHAR(20),
ADD COLUMN     "buffer_time" VARCHAR(20);

-- CreateTable
CREATE TABLE "public"."examiner_weekly_hours" (
    "id" UUID NOT NULL,
    "examiner_profile_id" UUID NOT NULL,
    "day_of_week" VARCHAR(20) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "examiner_weekly_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."examiner_weekly_time_slots" (
    "id" UUID NOT NULL,
    "weekly_hour_id" UUID NOT NULL,
    "start_time" VARCHAR(20) NOT NULL,
    "end_time" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "examiner_weekly_time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."examiner_override_hours" (
    "id" UUID NOT NULL,
    "examiner_profile_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "examiner_override_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."examiner_override_time_slots" (
    "id" UUID NOT NULL,
    "override_hour_id" UUID NOT NULL,
    "start_time" VARCHAR(20) NOT NULL,
    "end_time" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "examiner_override_time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "examiner_weekly_hours_examiner_profile_id_idx" ON "public"."examiner_weekly_hours"("examiner_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "examiner_weekly_hours_examiner_profile_id_day_of_week_key" ON "public"."examiner_weekly_hours"("examiner_profile_id", "day_of_week");

-- CreateIndex
CREATE INDEX "examiner_weekly_time_slots_weekly_hour_id_idx" ON "public"."examiner_weekly_time_slots"("weekly_hour_id");

-- CreateIndex
CREATE INDEX "examiner_override_hours_examiner_profile_id_idx" ON "public"."examiner_override_hours"("examiner_profile_id");

-- CreateIndex
CREATE INDEX "examiner_override_hours_date_idx" ON "public"."examiner_override_hours"("date");

-- CreateIndex
CREATE UNIQUE INDEX "examiner_override_hours_examiner_profile_id_date_key" ON "public"."examiner_override_hours"("examiner_profile_id", "date");

-- CreateIndex
CREATE INDEX "examiner_override_time_slots_override_hour_id_idx" ON "public"."examiner_override_time_slots"("override_hour_id");

-- AddForeignKey
ALTER TABLE "public"."examiner_weekly_hours" ADD CONSTRAINT "examiner_weekly_hours_examiner_profile_id_fkey" FOREIGN KEY ("examiner_profile_id") REFERENCES "public"."examiner_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examiner_weekly_time_slots" ADD CONSTRAINT "examiner_weekly_time_slots_weekly_hour_id_fkey" FOREIGN KEY ("weekly_hour_id") REFERENCES "public"."examiner_weekly_hours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examiner_override_hours" ADD CONSTRAINT "examiner_override_hours_examiner_profile_id_fkey" FOREIGN KEY ("examiner_profile_id") REFERENCES "public"."examiner_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examiner_override_time_slots" ADD CONSTRAINT "examiner_override_time_slots_override_hour_id_fkey" FOREIGN KEY ("override_hour_id") REFERENCES "public"."examiner_override_hours"("id") ON DELETE CASCADE ON UPDATE CASCADE;
