'use server';

import { PrismaClient } from '@thrive/database';
import { HttpError } from '@/utils/httpError';
import logger from '@/utils/logger';
import { ORGANIZATION_MESSAGES } from '@/constants/messages';
import { GetRolePermissionsParams } from '../../types';

export default async function getRolePermissions(
  params: GetRolePermissionsParams,
  prisma: PrismaClient
) {
  try {
    const { roleId, organizationId } = params;

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

    // Get role permissions
    const rolePermissions = await prisma.organizationRolePermission.findMany({
      where: {
        organizationRoleId: roleId,
      },
      include: {
        permission: {
          select: {
            id: true,
            key: true,
            description: true,
          },
        },
      },
    });

    return {
      success: true,
      data: rolePermissions.map(rp => rp.permission),
    };
  } catch (error) {
    logger.error('Error getting role permissions:', error);
    if (error instanceof HttpError) throw error;
    throw new HttpError(500, ORGANIZATION_MESSAGES.ERROR.FAILED_TO_LOAD_ROLE_PERMISSIONS);
  }
}
