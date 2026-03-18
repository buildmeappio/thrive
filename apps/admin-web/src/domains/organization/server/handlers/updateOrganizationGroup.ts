'use server';

import { PrismaClient } from '@thrive/database';
import { HttpError } from '@/utils/httpError';
import logger from '@/utils/logger';
import { groupSchema } from '../../schemas/groupSchema';
import { ORGANIZATION_MESSAGES, APP_MESSAGES } from '@/constants/messages';
import { UpdateGroupData } from '../../types';

export default async function updateOrganizationGroup(data: UpdateGroupData, prisma: PrismaClient) {
  try {
    // Validate input
    const validated = groupSchema.parse({
      name: data.name,
      scopeType: data.scopeType,
      locationIds: data.locationIds || [],
      memberIds: data.memberIds || [],
    });

    // Verify group exists and belongs to organization
    const existingGroup = await prisma.group.findFirst({
      where: {
        id: data.groupId,
        organizationId: data.organizationId,
        deletedAt: null,
      },
    });

    if (!existingGroup) {
      throw new HttpError(404, ORGANIZATION_MESSAGES.ERROR.GROUP_NOT_FOUND);
    }

    // If LOCATION_SET scope, verify locations exist and belong to organization
    if (validated.scopeType === 'LOCATION_SET' && validated.locationIds.length > 0) {
      const locations = await prisma.location.findMany({
        where: {
          id: { in: validated.locationIds },
          organizationId: data.organizationId,
          deletedAt: null,
        },
      });

      if (locations.length !== validated.locationIds.length) {
        throw new HttpError(400, ORGANIZATION_MESSAGES.ERROR.GROUP_LOCATIONS_INVALID);
      }
    }

    // Verify members exist and belong to organization
    if (validated.memberIds.length > 0) {
      const members = await prisma.organizationManager.findMany({
        where: {
          id: { in: validated.memberIds },
          organizationId: data.organizationId,
          deletedAt: null,
        },
      });

      if (members.length !== validated.memberIds.length) {
        throw new HttpError(400, ORGANIZATION_MESSAGES.ERROR.GROUP_MEMBERS_INVALID);
      }
    }

    // Update group in transaction
    const result = await prisma.$transaction(async tx => {
      // Update group
      const group = await tx.group.update({
        where: { id: data.groupId },
        data: {
          name: validated.name.trim(),
          scopeType: validated.scopeType,
        },
      });

      // Remove all existing location associations
      await tx.groupLocation.deleteMany({
        where: { groupId: data.groupId },
      });

      // Add new location associations if LOCATION_SET scope
      if (validated.scopeType === 'LOCATION_SET' && validated.locationIds.length > 0) {
        await tx.groupLocation.createMany({
          data: validated.locationIds.map(locationId => ({
            groupId: group.id,
            locationId,
          })),
        });
      }

      // Remove all existing member associations
      await tx.groupMember.deleteMany({
        where: { groupId: data.groupId },
      });

      // Add new member associations
      if (validated.memberIds.length > 0) {
        await tx.groupMember.createMany({
          data: validated.memberIds.map(memberId => ({
            groupId: group.id,
            organizationManagerId: memberId,
          })),
        });
      }

      return group;
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    logger.error('Error updating organization group:', error);
    if (error instanceof HttpError) throw error;
    if (error instanceof Error && error.name === 'ZodError') {
      throw new HttpError(400, APP_MESSAGES.ERROR.DATABASE.VALIDATION_ERROR);
    }
    throw new HttpError(500, ORGANIZATION_MESSAGES.ERROR.FAILED_TO_UPDATE_GROUP);
  }
}
