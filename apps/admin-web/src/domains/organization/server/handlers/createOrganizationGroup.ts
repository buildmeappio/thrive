'use server';

import { PrismaClient } from '@thrive/database';
import { HttpError } from '@/utils/httpError';
import logger from '@/utils/logger';
import { groupSchema } from '../../schemas/groupSchema';
import { ORGANIZATION_MESSAGES, APP_MESSAGES } from '@/constants/messages';
import { CreateGroupData } from '../../types';

export default async function createOrganizationGroup(data: CreateGroupData, prisma: PrismaClient) {
  try {
    // Validate input
    const validated = groupSchema.parse({
      name: data.name,
      scopeType: data.scopeType,
      locationIds: data.locationIds || [],
      memberIds: data.memberIds || [],
    });

    // Verify organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: data.organizationId },
      select: { id: true },
    });

    if (!organization) {
      throw new HttpError(404, ORGANIZATION_MESSAGES.ERROR.FAILED_TO_LOAD_ORGANIZATION);
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

    // Create group in transaction
    const result = await prisma.$transaction(async tx => {
      // Create group
      const group = await tx.group.create({
        data: {
          organizationId: data.organizationId,
          name: validated.name.trim(),
          scopeType: validated.scopeType,
          createdByManagerId: null, // Admin-created
        },
      });

      // Add locations if LOCATION_SET scope
      if (validated.scopeType === 'LOCATION_SET' && validated.locationIds.length > 0) {
        await tx.groupLocation.createMany({
          data: validated.locationIds.map(locationId => ({
            groupId: group.id,
            locationId,
          })),
        });
      }

      // Add members
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
    logger.error('Error creating organization group:', error);
    if (error instanceof HttpError) throw error;
    if (error instanceof Error && error.name === 'ZodError') {
      throw new HttpError(400, APP_MESSAGES.ERROR.DATABASE.VALIDATION_ERROR);
    }
    throw new HttpError(500, ORGANIZATION_MESSAGES.ERROR.FAILED_TO_CREATE_GROUP);
  }
}
