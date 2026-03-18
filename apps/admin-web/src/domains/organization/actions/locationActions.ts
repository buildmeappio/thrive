'use server';

import { getTenantContext } from './tenant-helpers';
import getOrganizationLocations from '../server/handlers/getOrganizationLocations';
import createOrganizationLocation from '../server/handlers/createOrganizationLocation';
import updateOrganizationLocation from '../server/handlers/updateOrganizationLocation';
import deleteOrganizationLocation from '../server/handlers/deleteOrganizationLocation';
import toggleLocationStatus from '../server/handlers/toggleLocationStatus';

const locationActions = {
  getLocations: async (params: {
    organizationId: string;
    page?: number;
    pageSize?: number;
    search?: string;
    status?: 'active' | 'inactive' | 'all';
    noPagination?: boolean;
  }) => {
    try {
      const { prisma } = await getTenantContext();
      return await getOrganizationLocations(params, prisma);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get locations',
      };
    }
  },

  createLocation: async (data: {
    organizationId: string;
    name: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      latitude?: number;
      longitude?: number;
    };
    timezone: string;
    regionTag?: string;
    costCenterCode?: string;
    isActive?: boolean;
  }) => {
    try {
      const { prisma } = await getTenantContext();
      return await createOrganizationLocation(data, prisma);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create location',
      };
    }
  },

  updateLocation: async (data: {
    locationId: string;
    organizationId: string;
    name: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      latitude?: number;
      longitude?: number;
    };
    timezone: string;
    regionTag?: string;
    costCenterCode?: string;
    isActive?: boolean;
  }) => {
    try {
      const { prisma } = await getTenantContext();
      return await updateOrganizationLocation(data, prisma);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update location',
      };
    }
  },

  deleteLocation: async (params: { locationId: string; organizationId: string }) => {
    try {
      const { prisma } = await getTenantContext();
      return await deleteOrganizationLocation(params, prisma);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete location',
      };
    }
  },

  toggleStatus: async (params: { locationId: string; organizationId: string }) => {
    try {
      const { prisma } = await getTenantContext();
      return await toggleLocationStatus(params, prisma);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to toggle location status',
      };
    }
  },

  importLocationsFromCSV: async (params: { organizationId: string; csvText: string }) => {
    try {
      const { prisma } = await getTenantContext();
      const importLocationsFromCSV = (await import('../server/handlers/importLocationsFromCSV'))
        .default;
      return await importLocationsFromCSV(params.organizationId, params.csvText, prisma);
    } catch (error: any) {
      return {
        success: false,
        totalRows: 0,
        successful: 0,
        failed: 0,
        created: 0,
        updated: 0,
        results: [],
        errors: [
          {
            row: 0,
            name: '',
            timezone: '',
            status: 'error' as const,
            error: error.message || 'Failed to import locations',
          },
        ],
      };
    }
  },

  exportLocationsToCSV: async (params: {
    organizationId: string;
    search?: string;
    status?: 'active' | 'inactive' | 'all';
  }) => {
    try {
      const { prisma } = await getTenantContext();
      const exportLocationsToCSV = (await import('../server/handlers/exportLocationsToCSV'))
        .default;
      return await exportLocationsToCSV(params, prisma);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to export locations',
      };
    }
  },
};

export default locationActions;
