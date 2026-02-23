/*
  Warnings:

  - The primary key for the `user_location_memberships` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "user_location_memberships" DROP CONSTRAINT "user_location_memberships_pkey",
ADD CONSTRAINT "user_location_memberships_pkey" PRIMARY KEY ("organization_manager_id", "location_id");
