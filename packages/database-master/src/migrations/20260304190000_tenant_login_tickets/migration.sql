-- CreateTable
CREATE TABLE "tenant_login_tickets" (
    "id" UUID NOT NULL,
    "ticket_hash" VARCHAR(64) NOT NULL,
    "tenant_id" UUID NOT NULL,
    "keycloak_sub" VARCHAR(255) NOT NULL,
    "role" "TenantUserRole" NOT NULL,
    "next_path" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "consumed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_login_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_login_tickets_ticket_hash_key" ON "tenant_login_tickets"("ticket_hash");

-- CreateIndex
CREATE INDEX "tenant_login_tickets_tenant_id_idx" ON "tenant_login_tickets"("tenant_id");

-- CreateIndex
CREATE INDEX "tenant_login_tickets_expires_at_idx" ON "tenant_login_tickets"("expires_at");

-- AddForeignKey
ALTER TABLE "tenant_login_tickets" ADD CONSTRAINT "tenant_login_tickets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
