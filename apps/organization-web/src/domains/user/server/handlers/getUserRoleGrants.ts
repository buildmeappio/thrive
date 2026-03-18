'use server';

import { HttpError } from '@/utils/httpError';

/**
 * Get all role grants for a specific user
 * NOTE: This feature was removed - user_role_grants table was dropped in migration 20260122203600
 */
const getUserRoleGrants = async (organizationManagerId: string) => {
  throw new HttpError(
    410,
    'Role grants feature has been removed. This functionality is no longer available.'
  );
};

export default getUserRoleGrants;
