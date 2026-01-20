'use server';

import prisma from '@/lib/db';
import { checkSuperAdmin } from '@/domains/organization/server/utils/checkSuperAdmin';
import { HttpError } from '@/utils/httpError';

interface AssignRoleData {
  organizationManagerId: string;
  roleId: string;
}

/**
 * Assign a role to a user (OrganizationManager)
 * Enforces SUPER_ADMIN constraint (only one per organization)
 */
const assignRole = async (data: AssignRoleData) => {
  const { organizationId, organizationManager } = await checkSuperAdmin();

  const { organizationManagerId, roleId } = data;

  // Get the target manager
  const targetManager = await prisma.organizationManager.findUnique({
    where: { id: organizationManagerId },
    include: {
      organizationRole: true,
    },
  });

  if (!targetManager) {
    throw new HttpError(404, 'User not found');
  }

  if (targetManager.organizationId !== organizationId) {
    throw new HttpError(403, 'You can only assign roles to users in your organization');
  }

  // Get the role
  const role = await prisma.organizationRole.findUnique({
    where: { id: roleId },
  });

  if (!role) {
    throw new HttpError(404, 'Role not found');
  }

  if (!role.isSystemRole && role.organizationId !== organizationId) {
    throw new HttpError(403, 'You can only assign roles from your organization');
  }

  // Enforce SUPER_ADMIN constraint
  if (role.name === 'SUPER_ADMIN' && role.isSystemRole) {
    // Check if organization already has a SUPER_ADMIN
    const existingSuperAdmin = await prisma.organizationManager.findFirst({
      where: {
        organizationId,
        organizationRole: {
          name: 'SUPER_ADMIN',
          isSystemRole: true,
        },
        deletedAt: null,
        id: { not: organizationManagerId }, // Exclude current user if updating
      },
    });

    if (existingSuperAdmin) {
      throw new HttpError(
        400,
        'Organization can only have one SUPER_ADMIN. Please remove the existing SUPER_ADMIN first.'
      );
    }
  }

  // Assign role
  await prisma.organizationManager.update({
    where: { id: organizationManagerId },
    data: {
      organizationRoleId: roleId,
    },
  });

  return {
    success: true,
    message: 'Role assigned successfully',
  };
};

export default assignRole;
