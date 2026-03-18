'use server';
import { PrismaClient } from '@thrive/database';
import { OrganizationDto, OrganizationTypeData } from '../dto/organizations.dto';
import * as OrganizationsService from '../organizations.service';
import logger from '@/utils/logger';

const getOrganizationTypes = async (prisma: PrismaClient): Promise<OrganizationTypeData[]> => {
  const service = OrganizationsService.createTenantOrganizationService(prisma);
  const types = await service.listOrganizationTypes();
  logger.log('tyes of org', types);

  return types.map(OrganizationDto.toOrganizationTypes);
};

export default getOrganizationTypes;
