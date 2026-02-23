/*
  Migration: Migrate User Status from ExaminerStatus to UserStatus
  and Preserve ExaminerProfile ACTIVE Status
  
  This migration:
  1. Creates UserStatus enum if it doesn't exist
  2. Changes users.status from ExaminerStatus to UserStatus
  3. Maps existing ExaminerStatus values to UserStatus
  4. Copies ACTIVE status from examiner_profiles to users for examiners
*/

-- Step 1: Create UserStatus enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserStatus') THEN
        CREATE TYPE "UserStatus" AS ENUM (
            'PENDING',
            'ACTIVE',
            'INACTIVE',
            'SUSPENDED',
            'REJECTED'
        );
    END IF;
END $$;

-- Step 2: Check if users.status column exists and handle accordingly
DO $$ 
DECLARE
    column_exists BOOLEAN;
BEGIN
    -- Check if the status column exists
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'status'
    ) INTO column_exists;

    IF column_exists THEN
        -- Column exists: Add temporary column and migrate data
        ALTER TABLE "public"."users" 
        ADD COLUMN IF NOT EXISTS "status_new" "UserStatus";

        -- Map existing ExaminerStatus values to UserStatus
        UPDATE "public"."users" 
        SET "status_new" = CASE 
            -- Direct mappings
            WHEN "status"::text = 'ACTIVE' THEN 'ACTIVE'::"UserStatus"
            WHEN "status"::text = 'PENDING' THEN 'PENDING'::"UserStatus"
            WHEN "status"::text = 'REJECTED' THEN 'REJECTED'::"UserStatus"
            WHEN "status"::text = 'SUSPENDED' THEN 'SUSPENDED'::"UserStatus"
            -- Map APPROVED and ACCEPTED to ACTIVE
            WHEN "status"::text = 'APPROVED' THEN 'ACTIVE'::"UserStatus"
            WHEN "status"::text = 'ACCEPTED' THEN 'ACTIVE'::"UserStatus"
            -- Map all other statuses to PENDING (default)
            ELSE 'PENDING'::"UserStatus"
        END
        WHERE "status" IS NOT NULL;

        -- Drop the old status column
        ALTER TABLE "public"."users" DROP COLUMN "status";

        -- Rename the new column to status
        ALTER TABLE "public"."users" RENAME COLUMN "status_new" TO "status";
    ELSE
        -- Column doesn't exist: Add it directly
        ALTER TABLE "public"."users" 
        ADD COLUMN "status" "UserStatus" DEFAULT 'PENDING'::"UserStatus";
    END IF;
END $$;

-- Step 3: Copy ACTIVE status from examiner_profiles to users
-- For examiners with ACTIVE status in examiner_profiles, ensure users.status is also ACTIVE
UPDATE "public"."users" u
SET "status" = 'ACTIVE'::"UserStatus"
FROM "public"."accounts" a
INNER JOIN "public"."examiner_profiles" ep ON a."id" = ep."account_id"
WHERE u."id" = a."user_id"
  AND ep."status"::text = 'ACTIVE'
  AND (u."status" IS NULL OR u."status" != 'ACTIVE'::"UserStatus");

-- Step 4: Set default PENDING for any remaining NULL values
UPDATE "public"."users" 
SET "status" = 'PENDING'::"UserStatus"
WHERE "status" IS NULL;

-- Step 5: Set default value (if not already set)
DO $$ 
BEGIN
    -- Only set default if column doesn't already have it
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'status'
        AND column_default = '''PENDING''::"UserStatus"'
    ) THEN
        ALTER TABLE "public"."users" 
        ALTER COLUMN "status" SET DEFAULT 'PENDING'::"UserStatus";
    END IF;
END $$;

-- Step 9: Add comment for documentation
COMMENT ON COLUMN "public"."users"."status" IS 'User status migrated from ExaminerStatus to UserStatus. ACTIVE status preserved from examiner_profiles.';

