/*
  Warnings:

  - The values [REPORT_SUBMITTED,REPORT_DRAFT] on the enum `ClaimantBookingStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."ReportStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'REVIEWED', 'APPROVED', 'REJECTED');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."ClaimantBookingStatus_new" AS ENUM ('PENDING', 'ACCEPT', 'DECLINE', 'REQUEST_MORE_INFO', 'DISCARDED');
ALTER TABLE "public"."claimant_bookings" ALTER COLUMN "status" TYPE "public"."ClaimantBookingStatus_new" USING ("status"::text::"public"."ClaimantBookingStatus_new");
ALTER TYPE "public"."ClaimantBookingStatus" RENAME TO "ClaimantBookingStatus_old";
ALTER TYPE "public"."ClaimantBookingStatus_new" RENAME TO "ClaimantBookingStatus";
DROP TYPE "public"."ClaimantBookingStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."reports" ADD COLUMN     "status" "public"."ReportStatus" NOT NULL DEFAULT 'DRAFT';
