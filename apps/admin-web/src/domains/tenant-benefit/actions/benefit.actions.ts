'use server';

import { headers } from 'next/headers';
import masterDb from '@thrive/database-master/db';
import { getTenantDb } from '@/lib/tenant-db';
import {
  createTenantBenefitService,
  type CreateBenefitInput,
  type UpdateBenefitInput,
} from '../server/benefit.service';
import { BenefitData } from '../types/BenefitData';
import { createTenantTaxonomyService } from '@/domains/tenant-taxonomy/server/taxonomy.service';

/**
 * Extract subdomain from request headers
 */
async function extractSubdomainFromHeaders(): Promise<string | null> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const hostname = host.split(':')[0];
  const parts = hostname.split('.');
  if (parts.length >= 2 && parts[0] !== 'www' && parts[0] !== 'auth') {
    return parts[0];
  }
  return null;
}

/**
 * Get tenant database from headers
 */
async function getTenantDbFromHeaders() {
  const subdomain = await extractSubdomainFromHeaders();
  if (!subdomain) {
    return null;
  }

  const tenant = await masterDb.tenant.findUnique({
    where: { subdomain },
    select: { id: true },
  });

  if (!tenant) {
    return null;
  }

  const tenantDb = await getTenantDb(tenant.id);
  return { tenantId: tenant.id, prisma: tenantDb };
}

/**
 * Get benefits for tenant
 */
export async function getTenantBenefits(): Promise<BenefitData[]> {
  const tenantDbResult = await getTenantDbFromHeaders();
  if (!tenantDbResult) {
    throw new Error('Tenant not found');
  }

  const { prisma } = tenantDbResult;
  const benefitService = createTenantBenefitService(prisma);
  return await benefitService.getBenefits();
}

/**
 * Get a single benefit by id (tenant DB)
 */
export async function getTenantBenefitById(id: string): Promise<{
  success: boolean;
  data?: BenefitData;
  error?: string;
}> {
  try {
    const tenantDbResult = await getTenantDbFromHeaders();
    if (!tenantDbResult) {
      return { success: false, error: 'Tenant not found' };
    }
    const benefitService = createTenantBenefitService(tenantDbResult.prisma);
    const data = await benefitService.getBenefitById(id);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch benefit',
    };
  }
}

/**
 * Update benefit (tenant DB)
 */
export async function updateTenantBenefit(
  id: string,
  data: UpdateBenefitInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const tenantDbResult = await getTenantDbFromHeaders();
    if (!tenantDbResult) {
      return { success: false, error: 'Tenant not found' };
    }
    const benefitService = createTenantBenefitService(tenantDbResult.prisma);
    await benefitService.updateBenefit(id, data);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update benefit',
    };
  }
}

/**
 * Delete benefit (tenant DB)
 */
export async function deleteTenantBenefit(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const tenantDbResult = await getTenantDbFromHeaders();
    if (!tenantDbResult) {
      return { success: false, error: 'Tenant not found' };
    }
    const benefitService = createTenantBenefitService(tenantDbResult.prisma);
    await benefitService.deleteBenefit(id);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete benefit',
    };
  }
}

/**
 * Create benefit (tenant DB)
 */
export async function createTenantBenefit(
  data: CreateBenefitInput
): Promise<{ success: boolean; data?: BenefitData; error?: string }> {
  try {
    const tenantDbResult = await getTenantDbFromHeaders();
    if (!tenantDbResult) {
      return { success: false, error: 'Tenant not found' };
    }
    const benefitService = createTenantBenefitService(tenantDbResult.prisma);
    const result = await benefitService.createBenefit(data);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create benefit',
    };
  }
}

/**
 * Get examination types for tenant (for benefit form dropdown)
 */
export async function getTenantExaminationTypes(): Promise<{
  success: boolean;
  data?: { label: string; value: string }[];
  error?: string;
}> {
  try {
    const tenantDbResult = await getTenantDbFromHeaders();
    if (!tenantDbResult) {
      return { success: false, error: 'Tenant not found' };
    }
    const taxonomyService = createTenantTaxonomyService(tenantDbResult.prisma);
    const types = await taxonomyService.getTaxonomies('examinationType');
    const data = (types as { id: string; name: string }[]).map(t => ({
      label: t.name,
      value: t.id,
    }));
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch examination types',
    };
  }
}
