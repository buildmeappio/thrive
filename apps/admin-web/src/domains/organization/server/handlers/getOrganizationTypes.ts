'use server';
import { OrganizationDto, OrganizationTypeData } from '../dto/organizations.dto';
import * as OrganizationsService from '../organizations.service';
import logger from '@/utils/logger';

const getOrganizationTypes = async (): Promise<OrganizationTypeData[]> => {
  const types = await OrganizationsService.listOrganizationTypes();
  logger.log('tyes of org', types);

  return types.map(OrganizationDto.toOrganizationTypes);
};

export default getOrganizationTypes;
