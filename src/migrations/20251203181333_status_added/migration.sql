-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."ExaminerStatus" ADD VALUE 'SUBMITTED';
ALTER TYPE "public"."ExaminerStatus" ADD VALUE 'IN_REVIEW';
ALTER TYPE "public"."ExaminerStatus" ADD VALUE 'MORE_INFO_REQUESTED';
ALTER TYPE "public"."ExaminerStatus" ADD VALUE 'INTERVIEW_SCHEDULED';
ALTER TYPE "public"."ExaminerStatus" ADD VALUE 'INTERVIEW_COMPLETED';
ALTER TYPE "public"."ExaminerStatus" ADD VALUE 'CONTRACT_SENT';
ALTER TYPE "public"."ExaminerStatus" ADD VALUE 'CONTRACT_SIGNED';
ALTER TYPE "public"."ExaminerStatus" ADD VALUE 'APPROVED';
ALTER TYPE "public"."ExaminerStatus" ADD VALUE 'WITHDRAWN';
