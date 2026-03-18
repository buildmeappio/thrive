'use server';

import { PrismaClient } from '@thrive/database';
import { HttpError } from '@/utils/httpError';
import logger from '@/utils/logger';
import { roleSchema } from '../../schemas/roleSchema';
import { ORGANIZATION_MESSAGES, APP_MESSAGES } from '@/constants/messages';
import { UpdateRoleData } from '../../types';

export default async function updateOrganizationRole(data: UpdateRoleData, prisma: PrismaClient) {
  try {
    // Validate input
    const validated = roleSchema.parse({
      name: data.name,
      key: data.key,
      description: data.description || '',
      isDefault: data.isDefault ?? false,
    });

    // Verify role exists and belongs to organization
    const existingRole = await prisma.organizationRole.findFirst({
      where: {
        id: data.roleId,
        organizationId: data.organizationId,
        deletedAt: null,
      },
    });

    if (!existingRole) {
      throw new HttpError(404, ORGANIZATION_MESSAGES.ERROR.ROLE_NOT_FOUND);
    }

    // Check if another role with the same name exists (excluding current role)
    const duplicateRoleByName = await prisma.organizationRole.findFirst({
      where: {
        organizationId: data.organizationId,
        name: validated.name.trim(),
        id: { not: data.roleId },
        deletedAt: null,
      },
    });

    if (duplicateRoleByName) {
      throw new HttpError(409, ORGANIZATION_MESSAGES.ERROR.ROLE_NAME_EXISTS);
    }

    // Check if another role with the same key exists (excluding current role)
    const duplicateRoleByKey = await prisma.organizationRole.findFirst({
      where: {
        organizationId: data.organizationId,
        key: validated.key.trim(),
        id: { not: data.roleId },
        deletedAt: null,
      },
    });

    if (duplicateRoleByKey) {
      throw new HttpError(409, ORGANIZATION_MESSAGES.ERROR.ROLE_KEY_EXISTS);
    }

    // Update role
    const role = await prisma.organizationRole.update({
      where: { id: data.roleId },
      data: {
        name: validated.name.trim(),
        key: validated.key.trim(),
        description: validated.description || null,
        isDefault: validated.isDefault,
      },
    });

    return {
      success: true,
      data: role,
    };
  } catch (error) {
    logger.error('Error updating organization role:', error);
    if (error instanceof HttpError) throw error;
    if (error instanceof Error && error.name === 'ZodError') {
      throw new HttpError(400, APP_MESSAGES.ERROR.DATABASE.VALIDATION_ERROR);
    }
    throw new HttpError(500, ORGANIZATION_MESSAGES.ERROR.FAILED_TO_UPDATE_ROLE);
  }
}
