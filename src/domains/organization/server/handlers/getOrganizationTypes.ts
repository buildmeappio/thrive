import authService from '../../../auth/server/auth.service';

const getOrganizationTypes = async () => {
  const organizationTypes = await authService.getOrganizationTypes();
  return { success: true, result: organizationTypes };
};
export default getOrganizationTypes;
