-- CreateTable
CREATE TABLE "agenda_jobs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "next_run_at" TIMESTAMPTZ(6),
    "type" VARCHAR(10) NOT NULL DEFAULT 'normal',
    "locked_at" TIMESTAMPTZ(6),
    "last_finished_at" TIMESTAMPTZ(6),
    "failed_at" TIMESTAMPTZ(6),
    "fail_count" INTEGER,
    "fail_reason" TEXT,
    "repeat_timezone" VARCHAR(100),
    "last_run_at" TIMESTAMPTZ(6),
    "repeat_interval" VARCHAR(255),
    "data" JSONB DEFAULT '{}',
    "repeat_at" VARCHAR(255),
    "disabled" BOOLEAN DEFAULT false,
    "progress" REAL,
    "fork" BOOLEAN DEFAULT false,
    "last_modified_by" VARCHAR(255),
    "debounce_started_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agenda_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agenda_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "timestamp" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" VARCHAR(10) NOT NULL,
    "event" VARCHAR(30) NOT NULL,
    "job_id" VARCHAR(255),
    "job_name" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "duration" INTEGER,
    "error" TEXT,
    "fail_count" INTEGER,
    "retry_delay" INTEGER,
    "retry_attempt" INTEGER,
    "agenda_name" VARCHAR(255),
    "meta" JSONB,

    CONSTRAINT "agenda_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agenda_jobs_single_job_idx" ON "agenda_jobs"("name") WHERE ((type)::text = 'single'::text);

-- CreateIndex
CREATE INDEX "agenda_jobs_find_and_lock_idx" ON "agenda_jobs"("name", "next_run_at", "priority" DESC, "locked_at", "disabled") WHERE (disabled = false);

-- CreateIndex
CREATE INDEX "agenda_jobs_locked_at_idx" ON "agenda_jobs"("locked_at") WHERE (locked_at IS NOT NULL);

-- CreateIndex
CREATE INDEX "agenda_jobs_next_run_at_idx" ON "agenda_jobs"("next_run_at") WHERE (next_run_at IS NOT NULL);

-- CreateIndex
CREATE INDEX "agenda_logs_job_id_idx" ON "agenda_logs"("job_id", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "agenda_logs_job_name_idx" ON "agenda_logs"("job_name", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "agenda_logs_timestamp_idx" ON "agenda_logs"("timestamp" DESC);
