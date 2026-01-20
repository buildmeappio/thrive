'use server';

import prisma from '@/lib/db';
import { checkSuperAdmin } from '@/domains/organization/server/utils/checkSuperAdmin';
import { HttpError } from '@/utils/httpError';

interface GrantRoleExceptionData {
  organizationManagerId: string;
  roleId: string;
  scopeType: 'ORG' | 'LOCATION';
  locationId?: string;
}

/**
 * Grant an additional role to a user via UserRoleGrant
 * This is for exceptions (e.g., giving a manager access to one extra location)
 */
const grantRoleException = async (data: GrantRoleExceptionData) => {
  const { organizationId, organizationManager } = await checkSuperAdmin();

  const { organizationManagerId, roleId, scopeType, locationId } = data;

  // Validate scope type and location
  if (scopeType === 'LOCATION' && !locationId) {
    throw new HttpError(400, 'Location ID is required for LOCATION scope');
  }

  if (scopeType === 'ORG' && locationId) {
    throw new HttpError(400, 'Location ID should not be provided for ORG scope');
  }

  // Get the target manager
  const targetManager = await prisma.organizationManager.findUnique({
    where: { id: organizationManagerId },
  });

  if (!targetManager) {
    throw new HttpError(404, 'User not found');
  }

  if (targetManager.organizationId !== organizationId) {
    throw new HttpError(403, 'You can only grant roles to users in your organization');
  }

  // Get the role
  const role = await prisma.organizationRole.findUnique({
    where: { id: roleId },
  });

  if (!role) {
    throw new HttpError(404, 'Role not found');
  }

  if (!role.isSystemRole && role.organizationId !== organizationId) {
    throw new HttpError(403, 'You can only grant roles from your organization');
  }

  // Verify location if provided
  if (locationId) {
    const location = await prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      throw new HttpError(404, 'Location not found');
    }

    if (location.organizationId !== organizationId) {
      throw new HttpError(403, 'Location does not belong to your organization');
    }
  }

  // Check if grant already exists
  const existingGrant = await prisma.userRoleGrant.findFirst({
    where: {
      organizationManagerId,
      roleId,
      scopeType,
      locationId: locationId || null,
      organizationId,
    },
  });

  if (existingGrant) {
    throw new HttpError(400, 'This role grant already exists');
  }

  // Create the grant
  await prisma.userRoleGrant.create({
    data: {
      organizationId,
      organizationManagerId,
      roleId,
      scopeType,
      locationId: locationId || null,
      grantedByManagerId: organizationManager.id,
    },
  });

  return {
    success: true,
    message: 'Role grant created successfully',
  };
};

export default grantRoleException;
