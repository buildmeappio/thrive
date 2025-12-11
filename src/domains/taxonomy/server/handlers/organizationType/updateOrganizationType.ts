import * as organizationTypeService from '../../organizationType.service';
import { UpdateOrganizationTypeInput } from '../../../types/OrganizationType';

const updateOrganizationType = async (id: string, data: UpdateOrganizationTypeInput) => {
  const result = await organizationTypeService.updateOrganizationType(id, data);
  return { success: true, result };
};

export default updateOrganizationType;

