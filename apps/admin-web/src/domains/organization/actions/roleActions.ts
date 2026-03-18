'use server';

import { getTenantContext } from './tenant-helpers';
import getOrganizationRoles from '../server/handlers/getOrganizationRoles';
import createOrganizationRole from '../server/handlers/createOrganizationRole';
import updateOrganizationRole from '../server/handlers/updateOrganizationRole';
import deleteOrganizationRole from '../server/handlers/deleteOrganizationRole';
import getRolePermissions from '../server/handlers/getRolePermissions';
import assignPermissionsToRole from '../server/handlers/assignPermissionsToRole';
import getSystemPermissions from '../server/handlers/getSystemPermissions';

const roleActions = {
  getRoles: async (params: {
    organizationId: string;
    page?: number;
    pageSize?: number;
    search?: string;
    noPagination?: boolean;
  }) => {
    try {
      const { prisma } = await getTenantContext();
      return await getOrganizationRoles(params, prisma);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get roles',
      };
    }
  },

  createRole: async (data: {
    organizationId: string;
    name: string;
    key: string;
    description?: string;
    isDefault?: boolean;
  }) => {
    try {
      const { prisma } = await getTenantContext();
      return await createOrganizationRole(data, prisma);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create role',
      };
    }
  },

  updateRole: async (data: {
    roleId: string;
    organizationId: string;
    name: string;
    key: string;
    description?: string;
    isDefault?: boolean;
  }) => {
    try {
      const { prisma } = await getTenantContext();
      return await updateOrganizationRole(data, prisma);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update role',
      };
    }
  },

  deleteRole: async (params: { roleId: string; organizationId: string }) => {
    try {
      const { prisma } = await getTenantContext();
      return await deleteOrganizationRole(params, prisma);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete role',
      };
    }
  },

  getRolePermissions: async (params: { roleId: string; organizationId: string }) => {
    try {
      const { prisma } = await getTenantContext();
      return await getRolePermissions(params, prisma);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get role permissions',
      };
    }
  },

  assignPermissions: async (data: {
    roleId: string;
    organizationId: string;
    permissionIds: string[];
  }) => {
    try {
      const { prisma } = await getTenantContext();
      return await assignPermissionsToRole(data, prisma);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to assign permissions',
      };
    }
  },

  getSystemPermissions: async () => {
    try {
      const { prisma } = await getTenantContext();
      return await getSystemPermissions(prisma);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get system permissions',
      };
    }
  },

  importRolesFromCSV: async (params: { organizationId: string; csvText: string }) => {
    try {
      const { prisma } = await getTenantContext();
      const importRolesFromCSV = (await import('../server/handlers/importRolesFromCSV')).default;
      return await importRolesFromCSV(params.organizationId, params.csvText, prisma);
    } catch (error: any) {
      return {
        success: false,
        totalRows: 0,
        created: 0,
        updated: 0,
        skipped: 0,
        results: [],
        errors: [
          {
            row: 0,
            name: '',
            status: 'error' as const,
            error: error.message || 'Failed to import roles',
          },
        ],
      };
    }
  },

  exportRolesToCSV: async (params: { organizationId: string; search?: string }) => {
    try {
      const { prisma } = await getTenantContext();
      const exportRolesToCSV = (await import('../server/handlers/exportRolesToCSV')).default;
      return await exportRolesToCSV(params, prisma);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to export roles',
      };
    }
  },
};

export default roleActions;
