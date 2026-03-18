'use server';

import { PrismaClient } from '@thrive/database';
import logger from '@/utils/logger';
import { generateCSV } from '@/utils/csv';
import { Prisma } from '@thrive/database';
import type { AddressFormData } from '@/types/address';

interface ExportLocationsParams {
  organizationId: string;
  search?: string;
  status?: 'active' | 'inactive' | 'all';
}

/**
 * Export locations to CSV based on current filters
 * Exports ALL matching locations (no pagination limit)
 * Flattens address JSON into separate columns
 */
const exportLocationsToCSV = async (
  params: ExportLocationsParams,
  prisma: PrismaClient
): Promise<{
  success: boolean;
  csv?: string;
  error?: string;
}> => {
  try {
    const { organizationId, search = '', status = 'all' } = params;

    // Build where clause
    const where: Prisma.LocationWhereInput = {
      organizationId,
      deletedAt: null,
    };

    // Add status filter
    if (status && status !== 'all') {
      where.isActive = status === 'active';
    }

    // Add search filter
    if (search.trim()) {
      where.OR = [
        {
          name: {
            contains: search.trim(),
            mode: 'insensitive',
          },
        },
        {
          timezone: {
            contains: search.trim(),
            mode: 'insensitive',
          },
        },
      ];
    }

    // Fetch all matching locations (no pagination)
    const locations = await prisma.location.findMany({
      where,
      select: {
        id: true,
        name: true,
        addressJson: true,
        timezone: true,
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Convert to CSV rows (flatten address JSON)
    const csvRows: Record<string, string>[] = [];

    locations.forEach(location => {
      const addressJson = location.addressJson;
      let address: AddressFormData | null = null;

      // Parse addressJson if it exists
      if (addressJson) {
        if (typeof addressJson === 'string') {
          try {
            address = JSON.parse(addressJson) as AddressFormData;
          } catch {
            address = null;
          }
        } else if (
          typeof addressJson === 'object' &&
          addressJson !== null &&
          !Array.isArray(addressJson)
        ) {
          address = addressJson as unknown as AddressFormData;
        }
      }

      csvRows.push({
        name: location.name || '',
        timezone: location.timezone || '',
        addressLine1: address?.line1 || '',
        addressLine2: address?.line2 || '',
        city: address?.city || '',
        state: address?.state || '',
        postalCode: address?.postalCode || '',
        isActive: location.isActive ? 'true' : 'false',
      });
    });

    // Generate CSV with headers
    const headers = [
      'name',
      'timezone',
      'addressLine1',
      'addressLine2',
      'city',
      'state',
      'postalCode',
      'isActive',
    ];

    const csv = generateCSV(csvRows, headers);

    return {
      success: true,
      csv,
    };
  } catch (error) {
    logger.error('Error exporting locations to CSV:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export locations',
    };
  }
};

export default exportLocationsToCSV;
