'use server';

import { getTenantDbFromHeaders } from '@/domains/organization/actions/tenant-helpers';
import saveAvailability, { type SaveAvailabilityInput } from '../server/handlers/saveAvailability';

export const saveInterpreterAvailabilityAction = async (input: SaveAvailabilityInput) => {
  try {
    const tenantResult = await getTenantDbFromHeaders();
    const db = tenantResult?.prisma;
    const result = await saveAvailability(input, db);
    return result;
  } catch (error: any) {
    return {
      success: false as const,
      message: error.message || 'Failed to save availability',
    };
  }
};
