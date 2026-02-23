'use server';

import prisma from '@/lib/db';
import { checkSuperAdmin } from '@/domains/organization/server/utils/checkSuperAdmin';
import { HttpError } from '@/utils/httpError';

/**
 * Get all permissions for a specific role
 */
const getRolePermissions = async (roleId: string) => {
  const { organizationId } = await checkSuperAdmin();

  // Verify role exists
  const role = await prisma.organizationRole.findUnique({
    where: { id: roleId },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  if (!role) {
    throw new HttpError(404, 'Role not found');
  }

  if (!role.isSystemRole && role.organizationId !== organizationId) {
    throw new HttpError(403, 'You can only view permissions for roles in your organization');
  }

  const permissions = role.permissions.map(rp => rp.permission);

  return {
    success: true,
    data: permissions,
  };
};

export default getRolePermissions;
