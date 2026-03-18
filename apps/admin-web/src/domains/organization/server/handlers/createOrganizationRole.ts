'use server';

import { PrismaClient } from '@thrive/database';
import { HttpError } from '@/utils/httpError';
import logger from '@/utils/logger';
import { roleSchema } from '../../schemas/roleSchema';
import { ORGANIZATION_MESSAGES, APP_MESSAGES } from '@/constants/messages';
import { CreateRoleData } from '../../types';

export default async function createOrganizationRole(data: CreateRoleData, prisma: PrismaClient) {
  try {
    // Validate input
    const validated = roleSchema.parse({
      name: data.name,
      key: data.key,
      description: data.description || '',
      isDefault: data.isDefault ?? false,
    });

    // Verify organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: data.organizationId },
      select: { id: true },
    });

    if (!organization) {
      throw new HttpError(404, ORGANIZATION_MESSAGES.ERROR.FAILED_TO_LOAD_ORGANIZATION);
    }

    // Check if role name already exists for this organization
    const existingRoleByName = await prisma.organizationRole.findFirst({
      where: {
        organizationId: data.organizationId,
        name: validated.name.trim(),
        deletedAt: null,
      },
    });

    if (existingRoleByName) {
      throw new HttpError(409, ORGANIZATION_MESSAGES.ERROR.ROLE_NAME_EXISTS);
    }

    // Check if role key already exists for this organization
    const existingRoleByKey = await prisma.organizationRole.findFirst({
      where: {
        organizationId: data.organizationId,
        key: validated.key.trim(),
        deletedAt: null,
      },
    });

    if (existingRoleByKey) {
      throw new HttpError(409, ORGANIZATION_MESSAGES.ERROR.ROLE_KEY_EXISTS);
    }

    // Create role
    const role = await prisma.organizationRole.create({
      data: {
        organizationId: data.organizationId,
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
    logger.error('Error creating organization role:', error);
    if (error instanceof HttpError) throw error;
    if (error instanceof Error && error.name === 'ZodError') {
      throw new HttpError(400, APP_MESSAGES.ERROR.DATABASE.VALIDATION_ERROR);
    }
    throw new HttpError(500, ORGANIZATION_MESSAGES.ERROR.FAILED_TO_CREATE_ROLE);
  }
}
