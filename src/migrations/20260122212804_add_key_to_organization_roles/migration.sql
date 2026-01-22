/*
  Warnings:

  - A unique constraint covering the columns `[organization_id,key]` on the table `organization_roles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `organization_roles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "organization_roles" ADD "key" VARCHAR(255) ;

UPDATE "organization_roles" 
SET key = UPPER(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'))
WHERE key IS NULL;

ALTER TABLE "organization_roles" ALTER COLUMN "key" SET NOT NULL;

-- CreateIndex
CREATE INDEX "organization_roles_key_idx" ON "organization_roles"("key");

-- CreateIndex
CREATE UNIQUE INDEX "organization_roles_organization_id_key_key" ON "organization_roles"("organization_id", "key");
