-- CreateEnum
CREATE TYPE "public"."TransporterStatus" AS ENUM ('SUSPENDED', 'ACTIVE');

-- CreateTable
CREATE TABLE "public"."transporters" (
    "id" UUID NOT NULL,
    "company_name" VARCHAR(255) NOT NULL,
    "contact_person" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "service_areas" JSONB NOT NULL,
    "vehicle_types" TEXT[],
    "fleet_info" TEXT,
    "base_address" TEXT NOT NULL,
    "status" "public"."TransporterStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "transporters_pkey" PRIMARY KEY ("id")
);
