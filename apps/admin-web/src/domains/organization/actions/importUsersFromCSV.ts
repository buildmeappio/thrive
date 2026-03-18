'use server';

import { getTenantContext } from './tenant-helpers';
import importUsersFromCSVHandler from '../server/handlers/importUsersFromCSV';

const importUsersFromCSV = async (organizationId: string, csvText: string) => {
  try {
    const { prisma } = await getTenantContext();
    return await importUsersFromCSVHandler(organizationId, csvText, prisma);
  } catch (error: any) {
    return {
      success: false,
      totalRows: 0,
      successful: 0,
      failed: 0,
      results: [],
      errors: [
        {
          row: 0,
          email: '',
          status: 'error' as const,
          error: error.message || 'Failed to import users',
        },
      ],
    };
  }
};

export default importUsersFromCSV;
