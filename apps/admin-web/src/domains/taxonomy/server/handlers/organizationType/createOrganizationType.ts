import * as organizationTypeService from '../../organizationType.service';
import { CreateOrganizationTypeInput } from '../../../types/OrganizationType';

const createOrganizationType = async (data: CreateOrganizationTypeInput) => {
  const result = await organizationTypeService.createOrganizationType(data);
  return { success: true, result };
};

export default createOrganizationType;
