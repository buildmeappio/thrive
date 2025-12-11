import * as organizationTypeService from '../../organizationType.service';

const getOrganizationTypeById = async (id: string) => {
  const result = await organizationTypeService.getOrganizationTypeById(id);
  return { success: true, result };
};

export default getOrganizationTypeById;

