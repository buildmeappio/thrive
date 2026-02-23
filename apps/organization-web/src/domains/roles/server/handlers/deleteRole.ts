'use server';

import prisma from '@/lib/db';
import { checkSuperAdmin } from '@/domains/organization/server/utils/checkSuperAdmin';
import { HttpError } from '@/utils/httpError';

interface DeleteRoleData {
  roleId: string;
  reassignToRoleId?: string; // Optional: reassign users to this role
}

/**
 * Soft delete a custom organization role
 * Optionally reassign users to another role
 */
const deleteRole = async (data: DeleteRoleData) => {
  try {
    const { organizationId } = await checkSuperAdmin();

    const { roleId, reassignToRoleId } = data;

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

    // Only allow deleting custom roles
    if (role.isSystemRole) {
      throw new HttpError(400, 'Cannot delete system roles');
    }

    // Verify role belongs to this organization
    if (role.organizationId !== organizationId) {
      throw new HttpError(403, 'You can only delete roles in your organization');
    }

    // If role is assigned to users, handle reassignment
    if (role.managers.length > 0) {
      if (reassignToRoleId) {
        // Verify reassign role exists and belongs to organization
        const reassignRole = await prisma.organizationRole.findUnique({
          where: { id: reassignToRoleId },
        });

        if (!reassignRole) {
          throw new HttpError(404, 'Reassignment role not found');
        }

        if (reassignRole.organizationId !== organizationId && !reassignRole.isSystemRole) {
          throw new HttpError(403, 'Reassignment role must belong to your organization');
        }

        // Reassign all users
        await prisma.organizationManager.updateMany({
          where: {
            organizationRoleId: roleId,
            deletedAt: null,
          },
          data: {
            organizationRoleId: reassignToRoleId,
          },
        });
      } else {
        throw new HttpError(
          400,
          'Role is assigned to users. Please provide a role to reassign them to, or remove the role assignment first.'
        );
      }
    }

    // Soft delete the role
    await prisma.organizationRole.update({
      where: { id: roleId },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Role deleted successfully',
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
      error: 'Failed to delete role',
    };
  }
};

export default deleteRole;
