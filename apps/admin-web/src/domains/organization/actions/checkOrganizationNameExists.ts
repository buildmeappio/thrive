'use server';

import { redirect } from 'next/navigation';
import { getTenantSessionFromCookies } from '@/domains/auth/server/better-auth/tenant-session';
import { getTenantDbFromHeaders } from './tenant-helpers';
import { createTenantOrganizationService } from '../server/organizations.service';

const checkOrganizationNameExists = async (name: string) => {
  // Get tenant database from headers
  const tenantDbResult = await getTenantDbFromHeaders();
  if (!tenantDbResult) {
    return { exists: false };
  }

  const { tenantId, prisma } = tenantDbResult;

  // Get tenant from master DB to verify session
  const { default: masterDb } = await import('@thrive/database-master/db');
  const tenant = await masterDb.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) {
    return { exists: false };
  }

  // Verify tenant session
  const tenantSession = await getTenantSessionFromCookies(tenant.id);
  if (!tenantSession) {
    redirect('/access-denied');
  }

  // Create service instance with tenant DB
  const organizationService = createTenantOrganizationService(prisma);

  // Check if name exists
  const exists = await organizationService.checkOrganizationNameExists(name);
  return { exists };
};

export default checkOrganizationNameExists;
