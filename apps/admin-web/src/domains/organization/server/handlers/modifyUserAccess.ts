'use server';

import { PrismaClient } from '@thrive/database';
import { HttpError } from '@/utils/httpError';
import logger from '@/utils/logger';
import { ORGANIZATION_MESSAGES } from '@/constants/messages';

interface ModifyUserAccessInput {
  organizationId: string;
  userId: string;
  organizationRoleId?: string;
  groupIds?: string[];
  locationIds?: string[];
}

/**
 * Modify user access (role, groups, locations)
 */
export default async function modifyUserAccess(
  data: ModifyUserAccessInput,
  prisma: PrismaClient
): Promise<{ success: boolean; error?: string }> {
  try {
    const { organizationId, userId, organizationRoleId, groupIds, locationIds } = data;

    // Find the user's account and organization manager
    const account = await prisma.account.findFirst({
      where: {
        userId: userId,
        managers: {
          some: {
            organizationId: organizationId,
            deletedAt: null,
          },
        },
      },
      include: {
        managers: {
          where: {
            organizationId: organizationId,
            deletedAt: null,
          },
          include: {
            organizationRole: true,
          },
        },
      },
    });

    if (!account) {
      throw new HttpError(404, 'User not found');
    }

    const targetManager = account.managers[0];

    if (!targetManager) {
      throw new HttpError(404, 'User not found in organization');
    }

    // Use transaction to ensure atomicity
    await prisma.$transaction(async tx => {
      // Update role if provided
      if (organizationRoleId) {
        // Verify role exists and belongs to organization
        const role = await tx.organizationRole.findUnique({
          where: { id: organizationRoleId },
        });

        if (!role) {
          throw new HttpError(404, 'Role not found');
        }

        if (role.organizationId !== organizationId) {
          throw new HttpError(403, 'You can only assign roles from your organization');
        }

        // Enforce SUPER_ADMIN constraint
        if (role.key === 'SUPER_ADMIN') {
          const existingSuperAdmin = await tx.organizationManager.findFirst({
            where: {
              organizationId,
              organizationRole: {
                key: 'SUPER_ADMIN',
                organizationId,
              },
              deletedAt: null,
              id: { not: targetManager.id },
            },
          });

          if (existingSuperAdmin) {
            throw new HttpError(
              400,
              'Organization can only have one SUPER_ADMIN. Please remove the existing SUPER_ADMIN first.'
            );
          }
        }

        // Update role
        await tx.organizationManager.update({
          where: { id: targetManager.id },
          data: {
            organizationRoleId: organizationRoleId,
          },
        });
      }

      // Update groups if provided
      if (groupIds !== undefined) {
        // Remove all existing group memberships
        await tx.groupMember.deleteMany({
          where: {
            organizationManagerId: targetManager.id,
          },
        });

        // Add new group memberships - batch verify and create
        if (groupIds.length > 0) {
          // Verify all groups exist and belong to organization in a single query
          const validGroups = await tx.group.findMany({
            where: {
              id: { in: groupIds },
              organizationId: organizationId,
              deletedAt: null,
            },
            select: {
              id: true,
            },
          });

          // Create all memberships in batch
          if (validGroups.length > 0) {
            await tx.groupMember.createMany({
              data: validGroups.map(group => ({
                groupId: group.id,
                organizationManagerId: targetManager.id,
              })),
            });
          }

          // If some groups were invalid, return error
          if (validGroups.length !== groupIds.length) {
            throw new HttpError(
              400,
              'One or more groups not found or do not belong to this organization'
            );
          }
        }
      }

      // Update locations if provided
      if (locationIds !== undefined) {
        // Remove all existing location memberships
        await tx.userLocationMembership.deleteMany({
          where: {
            organizationManagerId: targetManager.id,
          },
        });

        // Add new location memberships - batch verify and create
        if (locationIds.length > 0) {
          // Verify all locations exist, are active, and belong to organization in a single query
          const validLocations = await tx.location.findMany({
            where: {
              id: { in: locationIds },
              organizationId: organizationId,
              deletedAt: null,
              isActive: true,
            },
            select: {
              id: true,
            },
          });

          // Create all memberships in batch
          if (validLocations.length > 0) {
            await tx.userLocationMembership.createMany({
              data: validLocations.map(location => ({
                organizationManagerId: targetManager.id,
                locationId: location.id,
              })),
            });
          }

          // If some locations were invalid, return error
          if (validLocations.length !== locationIds.length) {
            throw new HttpError(
              400,
              'One or more locations not found, inactive, or do not belong to this organization'
            );
          }
        }
      }
    });

    return { success: true };
  } catch (error) {
    logger.error('Failed to modify user access:', error);
    if (error instanceof HttpError) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: ORGANIZATION_MESSAGES.ERROR.FAILED_TO_LOAD_USERS || 'Failed to modify user access',
    };
  }
}
