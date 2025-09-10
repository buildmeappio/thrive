'use server';
import authService from '../../../auth/server/auth.service';

const checkOrganizationByName = async (name: string) => {
  if (!name) return false;
  const org = await authService.getOrganizationByName(name);
  return !!org;
};

export default checkOrganizationByName;
