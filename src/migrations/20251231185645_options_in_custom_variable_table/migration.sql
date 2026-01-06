-- AlterTable
ALTER TABLE "custom_variables" ADD COLUMN     "options" JSONB,
ADD COLUMN     "variableType" TEXT NOT NULL DEFAULT 'text';
