/*
  Migration: Change examination_secure_link to secure_link
  
  This migration preserves all data from the old examination_secure_links table
  by copying it into the new secure_links and ExaminationSecureLink tables.
*/

-- Step 1: Create the new enum (same values as the old one)
CREATE TYPE "public"."SecureLinkStatus" AS ENUM ('PENDING', 'SUBMITTED', 'INVALID');

-- Step 2: Create the new tables
CREATE TABLE "public"."application_secure_links" (
    "id" UUID NOT NULL,
    "application_id" UUID NOT NULL,
    "secure_link_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "application_secure_links_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."examination_secure_links_new" (
    "id" UUID NOT NULL,
    "examination_id" UUID NOT NULL,
    "secure_link_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "examination_secure_links_new_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."secure_links" (
    "id" UUID NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "last_opened_at" TIMESTAMPTZ,
    "submitted_at" TIMESTAMPTZ,
    "status" "public"."SecureLinkStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "secure_links_pkey" PRIMARY KEY ("id")
);

-- Step 3: Create indexes (using temporary names to avoid conflicts with old table)
CREATE UNIQUE INDEX "application_secure_links_id_key" ON "public"."application_secure_links"("id");
CREATE UNIQUE INDEX "examination_secure_links_new_id_key" ON "public"."examination_secure_links_new"("id");
CREATE UNIQUE INDEX "secure_links_id_key" ON "public"."secure_links"("id");
CREATE INDEX "secure_links_token_idx" ON "public"."secure_links"("token");
CREATE INDEX "secure_links_status_idx" ON "public"."secure_links"("status");

-- Step 4: Migrate data from examination_secure_links to the new tables
-- First, copy all secure link data to secure_links table
INSERT INTO "public"."secure_links" (
    "id",
    "token",
    "expires_at",
    "last_opened_at",
    "submitted_at",
    "status",
    "created_at",
    "updated_at",
    "deleted_at"
)
SELECT 
    "id",
    "token",
    "expires_at",
    "last_opened_at",
    "submitted_at",
    CAST("status"::text AS "public"."SecureLinkStatus"),
    "created_at",
    "updated_at",
    "deleted_at"
FROM "public"."examination_secure_links";

-- Step 5: Create the junction table entries linking examinations to secure links
-- Each row in examination_secure_links becomes a row in ExaminationSecureLink
INSERT INTO "public"."examination_secure_links_new" (
    "id",
    "examination_id",
    "secure_link_id",
    "created_at",
    "updated_at",
    "deleted_at"
)
SELECT 
    "id",
    "examination_id",
    "id" AS "secure_link_id",  -- The secure_link_id is the same as the id from examination_secure_links
    "created_at",
    "updated_at",
    "deleted_at"
FROM "public"."examination_secure_links";

-- Step 6: Add foreign key constraints after data migration
ALTER TABLE "public"."application_secure_links" ADD CONSTRAINT "application_secure_links_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."examiner_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."application_secure_links" ADD CONSTRAINT "application_secure_links_secure_link_id_fkey" FOREIGN KEY ("secure_link_id") REFERENCES "public"."secure_links"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."examination_secure_links_new" ADD CONSTRAINT "examination_secure_links_new_examination_id_fkey" FOREIGN KEY ("examination_id") REFERENCES "public"."examinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."examination_secure_links_new" ADD CONSTRAINT "examination_secure_links_new_secure_link_id_fkey" FOREIGN KEY ("secure_link_id") REFERENCES "public"."secure_links"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 7: Drop the old foreign key constraint
ALTER TABLE "public"."examination_secure_links" DROP CONSTRAINT "examination_secure_links_examination_id_fkey";

-- Step 8: Drop the old table (data has been migrated)
DROP TABLE "public"."examination_secure_links";

-- Step 9: Rename the new table to examination_secure_links
ALTER TABLE "public"."examination_secure_links_new" RENAME TO "examination_secure_links";
ALTER TABLE "public"."examination_secure_links" RENAME CONSTRAINT "examination_secure_links_new_examination_id_fkey" TO "examination_secure_links_examination_id_fkey";
ALTER TABLE "public"."examination_secure_links" RENAME CONSTRAINT "examination_secure_links_new_secure_link_id_fkey" TO "examination_secure_links_secure_link_id_fkey";
ALTER TABLE "public"."examination_secure_links" RENAME CONSTRAINT "examination_secure_links_new_pkey" TO "examination_secure_links_pkey";
-- Rename the index to match the final table name
ALTER INDEX "public"."examination_secure_links_new_id_key" RENAME TO "examination_secure_links_id_key";

-- Step 10: Drop the old enum (replaced by SecureLinkStatus)
DROP TYPE "public"."ExaminationSecureLinkStatus";
