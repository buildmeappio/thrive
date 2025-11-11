-- CreateTable
CREATE TABLE "public"."maximum_distance_travel" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "maximum_distance_travel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."years_of_experience" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "years_of_experience_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "maximum_distance_travel_id_key" ON "public"."maximum_distance_travel"("id");

-- CreateIndex
CREATE UNIQUE INDEX "years_of_experience_id_key" ON "public"."years_of_experience"("id");
