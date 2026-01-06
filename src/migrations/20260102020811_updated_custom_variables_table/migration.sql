/*
  Warnings:

  - You are about to drop the column `defaultValue` on the `custom_variables` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `custom_variables` table. All the data in the column will be lost.
  - You are about to drop the column `variableType` on the `custom_variables` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "custom_variables" DROP COLUMN "defaultValue",
DROP COLUMN "isActive",
DROP COLUMN "variableType",
ADD COLUMN     "default_value" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "variable_type" TEXT NOT NULL DEFAULT 'text';
