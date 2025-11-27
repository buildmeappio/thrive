-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "is_login_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "must_reset_password" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "temporary_password_issued_at" TIMESTAMPTZ;
