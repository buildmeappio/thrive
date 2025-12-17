-- CreateEnum
CREATE TYPE "InterviewSlotStatus" AS ENUM ('AVAILABLE', 'BOOKED', 'CANCELLED');

-- CreateTable
CREATE TABLE "interview_slots" (
    "id" UUID NOT NULL,
    "start_time" TIMESTAMPTZ NOT NULL,
    "end_time" TIMESTAMPTZ NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" "InterviewSlotStatus" NOT NULL DEFAULT 'AVAILABLE',
    "application_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "interview_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "interview_slots_application_id_key" ON "interview_slots"("application_id");

-- CreateIndex
CREATE INDEX "interview_slots_start_time_idx" ON "interview_slots"("start_time");

-- CreateIndex
CREATE INDEX "interview_slots_status_idx" ON "interview_slots"("status");

-- CreateIndex
CREATE INDEX "interview_slots_start_time_end_time_idx" ON "interview_slots"("start_time", "end_time");

-- AddForeignKey
ALTER TABLE "interview_slots" ADD CONSTRAINT "interview_slots_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "examiner_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
