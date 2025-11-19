import authService from '../auth.service';

const checkOrganizationName = async (name: string): Promise<boolean> => {
  if (!name?.trim()) return false;

  return await authService.checkOrganizationExistsByName(name);
};

export default checkOrganizationName;
