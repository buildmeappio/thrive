'use server';

import prisma from '@/lib/db';
import { checkSuperAdmin } from '@/domains/organization/server/utils/checkSuperAdmin';
import { HttpError } from '@/utils/httpError';

/**
 * Revoke a role grant (UserRoleGrant)
 * NOTE: This feature was removed - user_role_grants table was dropped in migration 20260122203600
 */
const revokeRoleException = async (grantId: string) => {
  throw new HttpError(
    410,
    'Role grants feature has been removed. This functionality is no longer available.'
  );
};

export default revokeRoleException;
