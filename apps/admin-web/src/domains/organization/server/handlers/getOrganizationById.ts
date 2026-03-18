'use server';

import { PrismaClient } from '@thrive/database';
import * as OrganizationsService from '../organizations.service';

export default async function getOrganizationById(id: string, prisma: PrismaClient) {
  const service = OrganizationsService.createTenantOrganizationService(prisma);
  return service.getOrganizationById(id);
}
