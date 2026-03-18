'use server';

import { HttpError } from '@/utils/httpError';

interface GrantRoleExceptionData {
  organizationManagerId: string;
  roleId: string;
  scopeType: 'ORG' | 'LOCATION';
  locationId?: string;
}

/**
 * Grant an additional role to a user via UserRoleGrant
 * NOTE: This feature was removed - user_role_grants table was dropped in migration 20260122203600
 */
const grantRoleException = async (data: GrantRoleExceptionData) => {
  throw new HttpError(
    410,
    'Role grants feature has been removed. This functionality is no longer available.'
  );
};

export default grantRoleException;
