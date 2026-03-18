'use server';

import { getTenantContext } from './tenant-helpers';
import exportUsersToCSVHandler from '../server/handlers/exportUsersToCSV';

const exportUsersToCSV = async (params: {
  organizationId: string;
  search?: string;
  status?: 'active' | 'inactive' | 'all' | 'invited';
  role?: string;
}) => {
  try {
    const { prisma } = await getTenantContext();
    return await exportUsersToCSVHandler(params, prisma);
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to export users',
    };
  }
};

export default exportUsersToCSV;
