-- AlterTable
ALTER TABLE "tenant_login_tickets" ADD COLUMN IF NOT EXISTS "first_name" VARCHAR(255);
ALTER TABLE "tenant_login_tickets" ADD COLUMN IF NOT EXISTS "last_name" VARCHAR(255);
ALTER TABLE "tenant_login_tickets" ADD COLUMN IF NOT EXISTS "email" VARCHAR(255);
