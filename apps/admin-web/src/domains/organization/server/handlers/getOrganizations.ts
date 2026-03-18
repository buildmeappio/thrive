'use server';
import { PrismaClient } from '@thrive/database';
import { OrganizationDto } from '../dto/organizations.dto';
import * as OrganizationsService from '../organizations.service';
import { OrganizationData } from '@/domains/organization/types/OrganizationData';
import logger from '@/utils/logger';

const getOrganizations = async (prisma: PrismaClient): Promise<OrganizationData[]> => {
  const service = OrganizationsService.createTenantOrganizationService(prisma);
  const orgs = await service.listOrganizations();
  logger.log('organization list', orgs);
  return orgs.map(OrganizationDto.toOrganization);
};

export default getOrganizations;
