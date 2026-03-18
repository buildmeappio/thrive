'use server';

import { PrismaClient } from '@thrive/database';
import { HttpError } from '@/utils/httpError';
import logger from '@/utils/logger';
import { ORGANIZATION_MESSAGES } from '@/constants/messages';
import { AssignPermissionsData } from '../../types';

export default async function assignPermissionsToRole(
  data: AssignPermissionsData,
  prisma: PrismaClient
) {
  try {
    const { roleId, organizationId, permissionIds } = data;

    // Verify role exists and belongs to organization
    const role = await prisma.organizationRole.findFirst({
      where: {
        id: roleId,
        organizationId,
        deletedAt: null,
      },
    });

    if (!role) {
      throw new HttpError(404, ORGANIZATION_MESSAGES.ERROR.ROLE_NOT_FOUND);
    }

    // Verify all permissions exist
    if (permissionIds.length > 0) {
      const permissions = await prisma.permission.findMany({
        where: {
          id: { in: permissionIds },
          deletedAt: null,
        },
      });

      if (permissions.length !== permissionIds.length) {
        throw new HttpError(400, ORGANIZATION_MESSAGES.ERROR.PERMISSIONS_INVALID);
      }
    }

    // Remove existing permissions and assign new ones in transaction
    await prisma.$transaction(async tx => {
      // Remove all existing permissions
      await tx.organizationRolePermission.deleteMany({
        where: { organizationRoleId: roleId },
      });

      // Add new permissions
      if (permissionIds.length > 0) {
        await tx.organizationRolePermission.createMany({
          data: permissionIds.map(permissionId => ({
            organizationRoleId: roleId,
            permissionId,
          })),
        });
      }
    });

    return {
      success: true,
    };
  } catch (error) {
    logger.error('Error assigning permissions to role:', error);
    if (error instanceof HttpError) throw error;
    throw new HttpError(500, ORGANIZATION_MESSAGES.ERROR.FAILED_TO_ASSIGN_PERMISSIONS);
  }
}
