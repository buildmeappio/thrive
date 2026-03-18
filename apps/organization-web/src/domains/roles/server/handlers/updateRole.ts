'use server';

import prisma from '@/lib/db';
import { checkSuperAdmin } from '@/domains/organization/server/utils/checkSuperAdmin';
import { HttpError } from '@/utils/httpError';

interface UpdateRoleData {
  roleId: string;
  name?: string;
  description?: string;
}

/**
 * Update a custom organization role
 */
const updateRole = async (data: UpdateRoleData) => {
  try {
    const { organizationId } = await checkSuperAdmin();

    const { roleId, name, description } = data;

    // Get the role
    const role = await prisma.organizationRole.findUnique({
      where: { id: roleId },
      include: {
        managers: {
          where: { deletedAt: null },
        },
      },
    });

    if (!role) {
      throw new HttpError(404, 'Role not found');
    }

    // isSystemRole field removed from OrganizationRole model
    // All roles can now be updated (previously only custom roles could be updated)

    // Verify role belongs to this organization
    if (role.organizationId !== organizationId) {
      throw new HttpError(403, 'You can only update roles in your organization');
    }

    // If updating name, check for conflicts
    if (name && name.trim() !== role.name) {
      const normalizedName = name.trim();

      // Check if name already exists
      const existingRole = await prisma.organizationRole.findFirst({
        where: {
          organizationId,
          name: normalizedName,
          deletedAt: null,
          id: { not: roleId },
        },
      });

      if (existingRole) {
        throw new HttpError(400, 'Role with this name already exists');
      }

      // isSystemRole field removed from OrganizationRole model
      // No need to check for system role conflicts
    }

    // Update role
    const updatedRole = await prisma.organizationRole.update({
      where: { id: roleId },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
      },
    });

    return {
      success: true,
      data: updatedRole,
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
      error: 'Failed to update role',
    };
  }
};

export default updateRole;
