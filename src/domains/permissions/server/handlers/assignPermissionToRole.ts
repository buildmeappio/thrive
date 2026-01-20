'use server';

import prisma from '@/lib/db';
import { checkSuperAdmin } from '@/domains/organization/server/utils/checkSuperAdmin';
import { HttpError } from '@/utils/httpError';

interface AssignPermissionToRoleData {
  roleId: string;
  permissionId: string;
}

/**
 * Assign a permission to a role
 */
const assignPermissionToRole = async (data: AssignPermissionToRoleData) => {
  try {
    const { organizationId } = await checkSuperAdmin();

    const { roleId, permissionId } = data;

    // Verify role exists and belongs to organization (or is system role)
    const role = await prisma.organizationRole.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new HttpError(404, 'Role not found');
    }

    if (!role.isSystemRole && role.organizationId !== organizationId) {
      throw new HttpError(403, 'You can only assign permissions to roles in your organization');
    }

    // Verify permission exists and belongs to organization
    const permission = await prisma.permission.findUnique({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new HttpError(404, 'Permission not found');
    }

    if (permission.organizationId !== organizationId) {
      throw new HttpError(403, 'You can only assign permissions from your organization');
    }

    // Assign permission to role
    await prisma.organizationRolePermission.upsert({
      where: {
        organizationRoleId_permissionId: {
          organizationRoleId: roleId,
          permissionId: permissionId,
        },
      },
      create: {
        organizationRoleId: roleId,
        permissionId: permissionId,
      },
      update: {},
    });

    return {
      success: true,
      message: 'Permission assigned to role successfully',
    };
  } catch (error) {
    if (error instanceof HttpError) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Failed to assign permission to role',
    };
  }
};

export default assignPermissionToRole;
