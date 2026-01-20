'use server';

import prisma from '@/lib/db';
import { checkSuperAdmin } from '@/domains/organization/server/utils/checkSuperAdmin';
import { HttpError } from '@/utils/httpError';

/**
 * Revoke a role grant (UserRoleGrant)
 */
const revokeRoleException = async (grantId: string) => {
  const { organizationId } = await checkSuperAdmin();

  // Get the grant
  const grant = await prisma.userRoleGrant.findUnique({
    where: { id: grantId },
  });

  if (!grant) {
    throw new HttpError(404, 'Role grant not found');
  }

  if (grant.organizationId !== organizationId) {
    throw new HttpError(403, 'You can only revoke grants in your organization');
  }

  // Delete the grant
  await prisma.userRoleGrant.delete({
    where: { id: grantId },
  });

  return {
    success: true,
    message: 'Role grant revoked successfully',
  };
};

export default revokeRoleException;
