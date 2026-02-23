'use server';

import authService from '../../../auth/server/auth.service';

const getOrganizationTypes = async () => {
  const organizationTypes = await authService.getOrganizationTypes();
  return organizationTypes;
};
export default getOrganizationTypes;
