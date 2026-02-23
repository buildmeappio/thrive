-- AlterTable: Increase size of access_token in contracts table
-- access_token: VARCHAR(255) -> TEXT (unlimited) to support JWT tokens which can exceed 255 characters

ALTER TABLE "public"."contracts" 
  ALTER COLUMN "access_token" TYPE TEXT;

