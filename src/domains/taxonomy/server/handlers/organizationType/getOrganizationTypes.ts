import organizationTypeService from '../../organizationType.service';

const getOrganizationTypes = async () => {
  const result = await organizationTypeService.getOrganizationTypes();
  return { success: true, result };
};

export default getOrganizationTypes;

