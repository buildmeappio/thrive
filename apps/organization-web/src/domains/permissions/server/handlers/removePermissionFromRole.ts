'use server';

import prisma from '@/lib/db';
import { checkSuperAdmin } from '@/domains/organization/server/utils/checkSuperAdmin';
import { HttpError } from '@/utils/httpError';

interface RemovePermissionFromRoleData {
  roleId: string;
  permissionId: string;
}

/**
 * Remove a permission from a role
 */
const removePermissionFromRole = async (data: RemovePermissionFromRoleData) => {
  try {
    const { organizationId } = await checkSuperAdmin();

    const { roleId, permissionId } = data;

    // Verify role exists
    const role = await prisma.organizationRole.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new HttpError(404, 'Role not found');
    }

    if (!role.isSystemRole && role.organizationId !== organizationId) {
      throw new HttpError(403, 'You can only modify permissions for roles in your organization');
    }

    // Remove permission from role
    await prisma.organizationRolePermission.delete({
      where: {
        organizationRoleId_permissionId: {
          organizationRoleId: roleId,
          permissionId: permissionId,
        },
      },
    });

    return {
      success: true,
      message: 'Permission removed from role successfully',
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
      error: 'Failed to remove permission from role',
    };
  }
};

export default removePermissionFromRole;
