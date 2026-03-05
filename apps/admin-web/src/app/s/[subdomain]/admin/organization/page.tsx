import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import masterDb from '@thrive/database-master/db';
import { getTenantSessionFromCookies } from '@/domains/auth/server/better-auth/tenant-session';
import { getTenantDb } from '@/lib/tenant-db';
import { createTenantOrganizationService } from '@/domains/tenant-dashboard/server/organization.service';
import TenantOrganizationPageContent from '@/domains/tenant-dashboard/components/organization/OrganizationPageContent';
import { OrganizationData } from '@/domains/organization/types/OrganizationData';
import { OrganizationDto } from '@/domains/organization/server/dto/organizations.dto';

export const metadata: Metadata = {
  title: 'Organizations | Thrive Admin',
  description: 'Organizations',
};

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ subdomain: string }>;
};

/**
 * Tenant-specific organization page
 */
const Page = async ({ params }: Props) => {
  const { subdomain } = await params;

  // Get tenant from master DB
  const tenant = await masterDb.tenant.findUnique({
    where: { subdomain },
  });

  if (!tenant) {
    redirect('/access-denied');
  }

  // Get tenant session from cookies
  const tenantSession = await getTenantSessionFromCookies(tenant.id);
  if (!tenantSession) {
    redirect('/access-denied');
  }

  // Get tenant database connection
  const tenantDb = await getTenantDb(tenant.id);

  // Create tenant organization service
  const organizationService = createTenantOrganizationService(tenantDb);

  // Fetch organization data
  const [orgs, types] = await Promise.all([
    organizationService.getOrganizations(),
    organizationService.getOrganizationTypes(),
  ]);

  // Transform to OrganizationData format using DTO
  const organizationsData: OrganizationData[] = orgs.map(org =>
    OrganizationDto.toOrganization({
      id: org.id,
      name: org.name,
      website: org.website,
      type: org.type,
      address: org.address
        ? {
            id: org.address.id,
            address: org.address.address || '',
            street: org.address.street,
            province: org.address.province,
            city: org.address.city,
            postalCode: org.address.postalCode,
            suite: org.address.suite,
            createdAt: org.address.createdAt,
            updatedAt: org.address.updatedAt,
            deletedAt: org.address.deletedAt,
          }
        : null,
      manager: org.manager.map(m => ({
        account: m.account
          ? {
              user: m.account.user
                ? {
                    email: m.account.user.email,
                    firstName: m.account.user.firstName,
                    lastName: m.account.user.lastName,
                  }
                : undefined,
            }
          : undefined,
      })),
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    })
  );

  const typeNames = types.map(t => t.name);

  return <TenantOrganizationPageContent data={organizationsData} types={typeNames} />;
};

export default Page;
