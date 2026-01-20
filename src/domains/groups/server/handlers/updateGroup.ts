'use server';

import prisma from '@/lib/db';
import { checkSuperAdmin } from '@/domains/organization/server/utils/checkSuperAdmin';
import { HttpError } from '@/utils/httpError';

interface UpdateGroupData {
  groupId: string;
  name?: string;
  roleId?: string;
  scopeType?: 'ORG' | 'LOCATION_SET';
  locationIds?: string[];
  memberIds?: string[];
}

/**
 * Update a group
 */
const updateGroup = async (data: UpdateGroupData) => {
  try {
    const { organizationId } = await checkSuperAdmin();

    const { groupId, name, roleId, scopeType, locationIds, memberIds } = data;

    // Get the group
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new HttpError(404, 'Group not found');
    }

    if (group.organizationId !== organizationId) {
      throw new HttpError(403, 'You can only update groups in your organization');
    }

    // Verify role if updating
    if (roleId) {
      const role = await prisma.organizationRole.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        throw new HttpError(404, 'Role not found');
      }

      if (!role.isSystemRole && role.organizationId !== organizationId) {
        throw new HttpError(403, 'You can only use roles from your organization');
      }
    }

    // Update in transaction
    const result = await prisma.$transaction(async tx => {
      // Update group
      const updatedGroup = await tx.group.update({
        where: { id: groupId },
        data: {
          ...(name && { name: name.trim() }),
          ...(roleId && { roleId }),
          ...(scopeType && { scopeType }),
        },
      });

      // Update locations if provided
      if (locationIds !== undefined) {
        // Delete existing locations
        await tx.groupLocation.deleteMany({
          where: { groupId },
        });

        // Add new locations
        if (locationIds.length > 0) {
          // Verify locations
          const locations = await tx.location.findMany({
            where: {
              id: { in: locationIds },
              organizationId,
              deletedAt: null,
            },
          });

          if (locations.length !== locationIds.length) {
            throw new HttpError(400, 'One or more locations not found');
          }

          await tx.groupLocation.createMany({
            data: locationIds.map(locationId => ({
              groupId,
              locationId,
            })),
          });
        }
      }

      // Update members if provided
      if (memberIds !== undefined) {
        // Delete existing members
        await tx.groupMember.deleteMany({
          where: { groupId },
        });

        // Add new members
        if (memberIds.length > 0) {
          // Verify members
          const members = await tx.organizationManager.findMany({
            where: {
              id: { in: memberIds },
              organizationId,
              deletedAt: null,
            },
          });

          if (members.length !== memberIds.length) {
            throw new HttpError(400, 'One or more members not found');
          }

          await tx.groupMember.createMany({
            data: memberIds.map(memberId => ({
              groupId,
              organizationManagerId: memberId,
            })),
          });
        }
      }

      return updatedGroup;
    });

    return {
      success: true,
      data: result,
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
      error: 'Failed to update group',
    };
  }
};

export default updateGroup;
