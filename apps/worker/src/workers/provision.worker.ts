import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@thrive/database';
import masterDb from '@thrive/database-master/db';
import {
  createTenantDatabase,
  dropTenantDatabase,
} from '@thrive/database-master/tenant-provisioning';

export type ProvisionJobData = {
  jobId: string;
  stripeSessionId: string;
  keycloakSub: string;
  tenantName: string;
  tenantSlug: string;
  logoUrl: string | null;
  stripePriceId: string | null;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  stripeSubId: string | null;
  stripeCustomerId: string | null;
};

export async function provisionTenantHandler(data: ProvisionJobData): Promise<void> {
  const {
    stripeSessionId,
    keycloakSub,
    tenantName,
    tenantSlug,
    logoUrl,
    stripePriceId,
    adminFirstName,
    adminLastName,
    adminEmail,
    stripeSubId,
    stripeCustomerId,
  } = data;

  let tenantId: string | null = null;
  let databaseName: string | null = null;

  try {
    // 1. Create Tenant record
    const tenant = await masterDb.tenant.create({
      data: {
        subdomain: tenantSlug,
        name: tenantName,
        status: 'PENDING',
        databaseName: '', // filled in after DB creation
        logoUrl: logoUrl ?? null,
      },
    });
    tenantId = tenant.id;

    // 2. Create the tenant database + run migrations
    databaseName = await createTenantDatabase(tenant.id, process.env.MASTER_DATABASE_URL!);

    // Update databaseName on tenant
    await masterDb.tenant.update({
      where: { id: tenant.id },
      data: { databaseName },
    });

    // 3. Connect to the new tenant DB and create the super admin user + role
    const tenantDbUrl = buildTenantDbUrl(process.env.MASTER_DATABASE_URL!, databaseName);
    const tenantPrisma = createTenantPrisma(tenantDbUrl);

    try {
      // Create or find the super_admin role
      let superAdminRole = await tenantPrisma.role.findFirst({
        where: { name: 'super_admin' },
      });

      if (!superAdminRole) {
        superAdminRole = await tenantPrisma.role.create({
          data: { name: 'super_admin' },
        });
      }

      // Create the admin user
      const adminUser = await tenantPrisma.user.create({
        data: {
          firstName: adminFirstName,
          lastName: adminLastName,
          email: adminEmail,
          status: 'ACTIVE' as never,
        },
      });

      // Link user to role via Account
      await tenantPrisma.account.create({
        data: {
          userId: adminUser.id,
          roleId: superAdminRole.id,
          isVerified: true,
          status: 'ACTIVE' as never,
        },
      });
    } finally {
      await tenantPrisma.$disconnect();
    }

    // 4. Create Subscription
    await masterDb.subscription.create({
      data: {
        tenantId: tenant.id,
        stripePriceId: stripePriceId ?? null,
        stripeSubscriptionId: stripeSubId ?? null,
        stripeCustomerId: stripeCustomerId ?? null,
        status: 'ACTIVE',
      },
    });

    // 5. Create TenantUser (keycloakSub → tenant, TENANT_ADMIN)
    await masterDb.tenantUser.create({
      data: {
        keycloakSub,
        tenantId: tenant.id,
        role: 'TENANT_ADMIN',
      },
    });

    // 6. Activate tenant
    await masterDb.tenant.update({
      where: { id: tenant.id },
      data: { status: 'ACTIVE' },
    });

    // 7. Mark provisioning job as COMPLETED
    await masterDb.provisioningJob.update({
      where: { stripeSessionId },
      data: { status: 'COMPLETED' },
    });

    console.log(`[worker] Tenant ${tenantSlug} provisioned successfully`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[worker] Provisioning failed for ${tenantSlug}:`, message);

    // Clean up: drop database if it was created
    if (databaseName) {
      try {
        await dropTenantDatabase(databaseName, process.env.MASTER_DATABASE_URL!);
        console.log(`[worker] Dropped tenant database: ${databaseName}`);
      } catch (cleanupErr) {
        console.error(`[worker] Failed to drop database ${databaseName}:`, cleanupErr);
        // Continue with tenant record cleanup even if DB drop fails
      }
    }

    // Clean up partial tenant record if it was created
    if (tenantId) {
      try {
        await masterDb.tenant.delete({ where: { id: tenantId } });
      } catch {
        // ignore cleanup error
      }
    }

    await masterDb.provisioningJob.update({
      where: { stripeSessionId },
      data: { status: 'FAILED', errorMessage: message },
    });

    throw err;
  }
}

function buildTenantDbUrl(baseUrl: string, databaseName: string): string {
  const match = baseUrl.match(/^(postgresql:\/\/[^/]+)\/([^?]*)(\?.*)?$/);
  if (!match) throw new Error(`Invalid MASTER_DATABASE_URL: ${baseUrl}`);
  const [, base, , query] = match;
  return `${base}/${databaseName}${query ?? ''}`;
}

function createTenantPrisma(databaseUrl: string): PrismaClient {
  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter } as never);
}
