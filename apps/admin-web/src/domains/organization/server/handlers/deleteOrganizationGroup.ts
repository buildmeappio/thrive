'use server';

import { PrismaClient } from '@thrive/database';
import { HttpError } from '@/utils/httpError';
import logger from '@/utils/logger';
import { ORGANIZATION_MESSAGES } from '@/constants/messages';
import { DeleteGroupParams } from '../../types';

export default async function deleteOrganizationGroup(
  params: DeleteGroupParams,
  prisma: PrismaClient
) {
  try {
    const { groupId, organizationId } = params;

    // Verify group exists and belongs to organization
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        organizationId,
        deletedAt: null,
      },
    });

    if (!group) {
      throw new HttpError(404, ORGANIZATION_MESSAGES.ERROR.GROUP_NOT_FOUND);
    }

    // Soft delete group (cascade will handle related records)
    await prisma.group.update({
      where: { id: groupId },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    logger.error('Error deleting organization group:', error);
    if (error instanceof HttpError) throw error;
    throw new HttpError(500, ORGANIZATION_MESSAGES.ERROR.FAILED_TO_DELETE_GROUP);
  }
}
