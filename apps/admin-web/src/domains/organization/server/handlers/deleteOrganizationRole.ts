'use server';

import { PrismaClient } from '@thrive/database';
import { HttpError } from '@/utils/httpError';
import logger from '@/utils/logger';
import { ORGANIZATION_MESSAGES } from '@/constants/messages';
import { DeleteRoleParams } from '../../types';

export default async function deleteOrganizationRole(
  params: DeleteRoleParams,
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
      include: {
        _count: {
          select: {
            managers: true,
          },
        },
      },
    });

    if (!role) {
      throw new HttpError(404, ORGANIZATION_MESSAGES.ERROR.ROLE_NOT_FOUND);
    }

    // Check if role is assigned to any users
    if (role._count.managers > 0) {
      throw new HttpError(400, ORGANIZATION_MESSAGES.ERROR.ROLE_IN_USE);
    }

    // Prevent deletion of SUPER_ADMIN role
    if (role.key === 'SUPER_ADMIN') {
      throw new HttpError(400, ORGANIZATION_MESSAGES.ERROR.ROLE_SUPER_ADMIN_PROTECTED);
    }

    // Soft delete role
    await prisma.organizationRole.update({
      where: { id: roleId },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    logger.error('Error deleting organization role:', error);
    if (error instanceof HttpError) throw error;
    throw new HttpError(500, ORGANIZATION_MESSAGES.ERROR.FAILED_TO_DELETE_ROLE);
  }
}
