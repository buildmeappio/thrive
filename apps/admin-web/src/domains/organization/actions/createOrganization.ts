'use server';

import { redirect } from 'next/navigation';
import { getTenantSessionFromCookies } from '@/domains/auth/server/better-auth/tenant-session';
import { getTenantDbFromHeaders } from './tenant-helpers';
import { createTenantOrganizationService } from '../server/organizations.service';
import type {
  CreateOrganizationInput,
  CreateOrganizationResult,
} from '../types/CreateOrganization.types';
import { ORGANIZATION_MESSAGES } from '@/constants/messages';
import logger from '@/utils/logger';

const createOrganization = async (
  data: CreateOrganizationInput
): Promise<CreateOrganizationResult> => {
  try {
    // Get tenant database from headers
    const tenantDbResult = await getTenantDbFromHeaders();
    if (!tenantDbResult) {
      return { success: false, error: 'Tenant not found' };
    }

    const { tenantId, prisma } = tenantDbResult;

    // Get tenant from master DB to verify session
    const { default: masterDb } = await import('@thrive/database-master/db');
    const tenant = await masterDb.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return { success: false, error: 'Tenant not found' };
    }

    // Verify tenant session
    const tenantSession = await getTenantSessionFromCookies(tenant.id);
    if (!tenantSession) {
      redirect('/access-denied');
    }

    // Create service instance with tenant DB
    const organizationService = createTenantOrganizationService(prisma);

    // Create organization
    const organization = await organizationService.createOrganization(data);

    return {
      success: true,
      organizationId: organization.id,
    };
  } catch (error: any) {
    logger.error('Error creating organization:', error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: ORGANIZATION_MESSAGES.ERROR.FAILED_TO_CREATE_ORGANIZATION,
    };
  }
};

export default createOrganization;
