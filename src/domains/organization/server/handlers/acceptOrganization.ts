import organizationService from '../organization.service';

const acceptOrganization = async () => {
  const result = await organizationService.acceptOrganization();
  return { success: true, result };
};

export default acceptOrganization;
