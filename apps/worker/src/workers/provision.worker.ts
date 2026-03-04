import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@thrive/database';
import masterDb from '@thrive/database-master/db';
import {
  createTenantDatabase,
  dropTenantDatabase,
  runTenantSeeders,
} from '@thrive/database-master/tenant-provisioning';

export type ProvisionJobData = {
  tenantId: string;
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
  const { tenantId, tenantSlug, adminFirstName, adminLastName, adminEmail } = data;

  let databaseName: string | null = null;

  const tenant = await masterDb.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant || tenant.status !== 'DRAFT') {
    throw new Error(`Tenant ${tenantId} not found or not in DRAFT status`);
  }

  try {
    await masterDb.tenant.update({
      where: { id: tenantId },
      data: { provisionStep: 'CREATING_DB' },
    });

    databaseName = await createTenantDatabase(tenantId, process.env.MASTER_DATABASE_URL!);

    await masterDb.tenant.update({
      where: { id: tenantId },
      data: { databaseName, provisionStep: 'CREATING_ADMIN' },
    });

    const tenantDbUrl = buildTenantDbUrl(process.env.MASTER_DATABASE_URL!, databaseName);
    await runTenantSeeders(tenantDbUrl);
    const tenantPrisma = createTenantPrisma(tenantDbUrl);

    try {
      let superAdminRole = await tenantPrisma.role.findFirst({
        where: { name: 'super_admin' },
      });

      if (!superAdminRole) {
        superAdminRole = await tenantPrisma.role.create({
          data: { name: 'super_admin' },
        });
      }

      const adminUser = await tenantPrisma.user.create({
        data: {
          firstName: adminFirstName,
          lastName: adminLastName,
          email: adminEmail,
          status: 'ACTIVE' as never,
        },
      });

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

    await masterDb.tenant.update({
      where: { id: tenantId },
      data: {
        status: 'ACTIVE',
        provisionStep: null,
        provisionErrorMessage: null,
      },
    });

    console.log(`[worker] Tenant ${tenantSlug} provisioned successfully`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[worker] Provisioning failed for ${tenantSlug}:`, message);

    if (databaseName) {
      try {
        await dropTenantDatabase(databaseName, process.env.MASTER_DATABASE_URL!);
        console.log(`[worker] Dropped tenant database: ${databaseName}`);
      } catch (cleanupErr) {
        console.error(`[worker] Failed to drop database ${databaseName}:`, cleanupErr);
      }
    }

    await masterDb.tenant.update({
      where: { id: tenantId },
      data: { provisionErrorMessage: message },
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
