/*
  Warnings:

  - You are about to drop the column `base_address` on the `transporters` table. All the data in the column will be lost.
  - You are about to drop the column `fleet_info` on the `transporters` table. All the data in the column will be lost.
  - You are about to drop the column `vehicle_types` on the `transporters` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."transporters" DROP COLUMN "base_address",
DROP COLUMN "fleet_info",
DROP COLUMN "vehicle_types";
