'use server';

import prisma from '@/lib/db';
import { checkSuperAdmin } from '@/domains/organization/server/utils/checkSuperAdmin';
import { HttpError } from '@/utils/httpError';

interface CreateGroupData {
  name: string;
  roleId: string;
  scopeType: 'ORG' | 'LOCATION_SET';
  locationIds?: string[];
  memberIds?: string[];
}

/**
 * Create a group with optional locations and members
 */
const createGroup = async (data: CreateGroupData) => {
  try {
    const { organizationId, organizationManager } = await checkSuperAdmin();

    const { name, roleId, scopeType, locationIds = [], memberIds = [] } = data;

    if (!name || name.trim().length === 0) {
      throw new HttpError(400, 'Group name is required');
    }

    // Verify role exists and belongs to organization (or is system role)
    const role = await prisma.organizationRole.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new HttpError(404, 'Role not found');
    }

    if (!role.isSystemRole && role.organizationId !== organizationId) {
      throw new HttpError(403, 'You can only use roles from your organization');
    }

    // If LOCATION_SET scope, verify locations exist
    if (scopeType === 'LOCATION_SET' && locationIds.length === 0) {
      throw new HttpError(400, 'At least one location is required for LOCATION_SET scope');
    }

    // Verify all locations belong to organization
    if (locationIds.length > 0) {
      const locations = await prisma.location.findMany({
        where: {
          id: { in: locationIds },
          organizationId,
          deletedAt: null,
        },
      });

      if (locations.length !== locationIds.length) {
        throw new HttpError(
          400,
          'One or more locations not found or do not belong to your organization'
        );
      }
    }

    // Verify all members belong to organization
    if (memberIds.length > 0) {
      const members = await prisma.organizationManager.findMany({
        where: {
          id: { in: memberIds },
          organizationId,
          deletedAt: null,
        },
      });

      if (members.length !== memberIds.length) {
        throw new HttpError(
          400,
          'One or more members not found or do not belong to your organization'
        );
      }
    }

    // Create group in transaction
    const result = await prisma.$transaction(async tx => {
      // Create group
      const group = await tx.group.create({
        data: {
          organizationId,
          name: name.trim(),
          roleId,
          scopeType,
          createdByManagerId: organizationManager.id,
        },
      });

      // Add locations
      if (locationIds.length > 0) {
        await tx.groupLocation.createMany({
          data: locationIds.map(locationId => ({
            groupId: group.id,
            locationId,
          })),
        });
      }

      // Add members
      if (memberIds.length > 0) {
        await tx.groupMember.createMany({
          data: memberIds.map(memberId => ({
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
    if (error instanceof HttpError) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Failed to create group',
    };
  }
};

export default createGroup;
