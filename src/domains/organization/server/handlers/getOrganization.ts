import authService from '../../../auth/server/auth.service';

const getOrganization = async () => {
  const organization = await authService.getOrganization();

  return { success: true, result: organization };
};
export default getOrganization;
