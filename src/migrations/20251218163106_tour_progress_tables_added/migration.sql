-- CreateTable
CREATE TABLE "tour_progress" (
    "id" UUID NOT NULL,
    "examiner_profile_id" UUID NOT NULL,
    "onboarding_tour_completed" BOOLEAN NOT NULL DEFAULT false,
    "dashboard_tour_completed" BOOLEAN NOT NULL DEFAULT false,
    "onboarding_tour_skipped" BOOLEAN NOT NULL DEFAULT false,
    "dashboard_tour_skipped" BOOLEAN NOT NULL DEFAULT false,
    "onboarding_tour_completed_at" TIMESTAMPTZ,
    "dashboard_tour_completed_at" TIMESTAMPTZ,
    "onboarding_tour_started_at" TIMESTAMPTZ,
    "dashboard_tour_started_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "tour_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tour_progress_examiner_profile_id_key" ON "tour_progress"("examiner_profile_id");

-- CreateIndex
CREATE INDEX "tour_progress_examiner_profile_id_idx" ON "tour_progress"("examiner_profile_id");

-- AddForeignKey
ALTER TABLE "tour_progress" ADD CONSTRAINT "tour_progress_examiner_profile_id_fkey" FOREIGN KEY ("examiner_profile_id") REFERENCES "examiner_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
