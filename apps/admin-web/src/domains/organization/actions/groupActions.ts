'use server';

import { getTenantContext } from './tenant-helpers';
import getOrganizationGroups from '../server/handlers/getOrganizationGroups';
import createOrganizationGroup from '../server/handlers/createOrganizationGroup';
import updateOrganizationGroup from '../server/handlers/updateOrganizationGroup';
import deleteOrganizationGroup from '../server/handlers/deleteOrganizationGroup';

const groupActions = {
  getGroups: async (params: {
    organizationId: string;
    page?: number;
    pageSize?: number;
    search?: string;
    noPagination?: boolean;
  }) => {
    try {
      const { prisma } = await getTenantContext();
      return await getOrganizationGroups(params, prisma);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get groups',
      };
    }
  },

  createGroup: async (data: {
    organizationId: string;
    name: string;
    scopeType: 'ORG' | 'LOCATION_SET';
    locationIds?: string[];
    memberIds?: string[];
  }) => {
    try {
      const { prisma } = await getTenantContext();
      return await createOrganizationGroup(data, prisma);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create group',
      };
    }
  },

  updateGroup: async (data: {
    groupId: string;
    organizationId: string;
    name: string;
    scopeType: 'ORG' | 'LOCATION_SET';
    locationIds?: string[];
    memberIds?: string[];
  }) => {
    try {
      const { prisma } = await getTenantContext();
      return await updateOrganizationGroup(data, prisma);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update group',
      };
    }
  },

  deleteGroup: async (params: { groupId: string; organizationId: string }) => {
    try {
      const { prisma } = await getTenantContext();
      return await deleteOrganizationGroup(params, prisma);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete group',
      };
    }
  },
};

export default groupActions;
