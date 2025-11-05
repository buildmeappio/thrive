-- CreateEnum
CREATE TYPE "public"."AvailabilityBlock" AS ENUM ('MORNING', 'AFTERNOON', 'EVENING');

-- CreateTable
CREATE TABLE "public"."interpreters" (
    "id" UUID NOT NULL,
    "company_name" VARCHAR(255) NOT NULL,
    "contact_person" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "interpreters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."interpreter_languages" (
    "id" UUID NOT NULL,
    "interpreter_id" UUID NOT NULL,
    "language_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "interpreter_languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."interpreter_availability" (
    "id" UUID NOT NULL,
    "interpreter_id" UUID NOT NULL,
    "weekday" SMALLINT NOT NULL,
    "block" "public"."AvailabilityBlock" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "interpreter_availability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "interpreters_id_key" ON "public"."interpreters"("id");

-- CreateIndex
CREATE UNIQUE INDEX "interpreters_email_key" ON "public"."interpreters"("email");

-- CreateIndex
CREATE UNIQUE INDEX "interpreter_languages_id_key" ON "public"."interpreter_languages"("id");

-- CreateIndex
CREATE INDEX "interpreter_languages_language_id_idx" ON "public"."interpreter_languages"("language_id");

-- CreateIndex
CREATE UNIQUE INDEX "interpreter_languages_interpreter_id_language_id_key" ON "public"."interpreter_languages"("interpreter_id", "language_id");

-- CreateIndex
CREATE UNIQUE INDEX "interpreter_availability_id_key" ON "public"."interpreter_availability"("id");

-- CreateIndex
CREATE INDEX "interpreter_availability_interpreter_id_idx" ON "public"."interpreter_availability"("interpreter_id");

-- CreateIndex
CREATE UNIQUE INDEX "interpreter_availability_interpreter_id_weekday_block_key" ON "public"."interpreter_availability"("interpreter_id", "weekday", "block");

-- AddForeignKey
ALTER TABLE "public"."interpreter_languages" ADD CONSTRAINT "interpreter_languages_interpreter_id_fkey" FOREIGN KEY ("interpreter_id") REFERENCES "public"."interpreters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."interpreter_languages" ADD CONSTRAINT "interpreter_languages_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."interpreter_availability" ADD CONSTRAINT "interpreter_availability_interpreter_id_fkey" FOREIGN KEY ("interpreter_id") REFERENCES "public"."interpreters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
