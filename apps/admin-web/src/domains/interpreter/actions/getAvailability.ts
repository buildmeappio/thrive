'use server';

import { getTenantDbFromHeaders } from '@/domains/organization/actions/tenant-helpers';
import getAvailability, { type GetAvailabilityInput } from '../server/handlers/getAvailability';

export const getInterpreterAvailabilityAction = async (input: GetAvailabilityInput) => {
  try {
    const tenantResult = await getTenantDbFromHeaders();
    const db = tenantResult?.prisma;
    const result = await getAvailability(input, db);
    return result;
  } catch (error: any) {
    return {
      success: false as const,
      message: error.message || 'Failed to fetch availability',
    };
  }
};
