'use server';

import { PrismaClient } from '@thrive/database';
import { HttpError } from '@/utils/httpError';
import logger from '@/utils/logger';
import { generateCSV } from '@/utils/csv';
import { Prisma } from '@thrive/database';

interface ExportRolesParams {
  organizationId: string;
  search?: string;
}

/**
 * Export roles to CSV based on current filters
 * Exports ALL matching roles (no pagination limit)
 * Excludes SUPER_ADMIN role
 */
const exportRolesToCSV = async (
  params: ExportRolesParams,
  prisma: PrismaClient
): Promise<{
  success: boolean;
  csv?: string;
  error?: string;
}> => {
  try {
    const { organizationId, search = '' } = params;

    // Build where clause
    const where: Prisma.OrganizationRoleWhereInput = {
      organizationId,
      deletedAt: null,
      // Exclude SUPER_ADMIN
      key: {
        not: 'SUPER_ADMIN',
        mode: 'insensitive',
      },
    };

    // Add search filter
    if (search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { key: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const roles = await prisma.organizationRole.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    const csvRows: Record<string, string>[] = roles.map(role => ({
      name: role.name || '',
      description: role.description || '',
    }));

    const headers = ['name', 'description'];

    const csv = generateCSV(csvRows, headers);

    return {
      success: true,
      csv,
    };
  } catch (error) {
    logger.error('Error exporting roles to CSV:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export roles',
    };
  }
};

export default exportRolesToCSV;
