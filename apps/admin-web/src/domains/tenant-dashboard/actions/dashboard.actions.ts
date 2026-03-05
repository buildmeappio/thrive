'use server';

import { headers } from 'next/headers';
import masterDb from '@thrive/database-master/db';
import { getTenantDb } from '@/lib/tenant-db';
import { createTenantDashboardService } from '../server/dashboard.service';

/**
 * Extract subdomain from request headers
 */
function extractSubdomainFromHeaders(): string | null {
  const headersList = headers();
  const host = headersList.get('host') || '';
  const hostname = host.split(':')[0];
  const parts = hostname.split('.');
  if (parts.length >= 2 && parts[0] !== 'www' && parts[0] !== 'auth') {
    return parts[0];
  }
  return null;
}

/**
 * Get due cases count for tenant
 * Server action that gets tenant context from request headers
 */
export async function getTenantDueCasesCount(
  period: 'today' | 'tomorrow' | 'this-week'
): Promise<number> {
  try {
    const subdomain = extractSubdomainFromHeaders();
    if (!subdomain) {
      return 0;
    }

    const tenant = await masterDb.tenant.findUnique({
      where: { subdomain },
    });

    if (!tenant) {
      return 0;
    }

    const tenantDb = await getTenantDb(tenant.id);
    try {
      const dashboardService = createTenantDashboardService(tenantDb);
      return await dashboardService.getDueCasesCount(period);
    } finally {
      await tenantDb.$disconnect();
    }
  } catch (error) {
    console.error('Error fetching due cases count:', error);
    return 0;
  }
}
