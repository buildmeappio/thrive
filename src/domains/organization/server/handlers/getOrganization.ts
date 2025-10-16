import authService from '../../../auth/server/auth.service';

const getOrganization = async (userId: string) => {
  const organization = await authService.getOrganization(userId);

  return { success: true, result: organization };
};
export default getOrganization;
