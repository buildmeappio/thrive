-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "keycloak_sub" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_keycloak_sub_key" ON "users"("keycloak_sub");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "users_keycloak_sub_idx" ON "users"("keycloak_sub");
