'use server';

import { headers } from 'next/headers';
import masterDb from '@thrive/database-master/db';
import { getTenantDb } from '@/lib/tenant-db';
import { PrismaClient } from '@thrive/database';

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
async function getTenantDbFromHeaders(): Promise<{
  tenantId: string;
  prisma: PrismaClient;
} | null> {
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
 * Create organization for tenant (simplified - no invitations/emails)
 */
export async function createTenantOrganization(data: {
  name: string;
  type?: string;
  website?: string;
}): Promise<{ success: boolean; organizationId?: string; error?: string }> {
  try {
    const tenantDbResult = await getTenantDbFromHeaders();
    if (!tenantDbResult) {
      return { success: false, error: 'Tenant not found' };
    }

    const { prisma } = tenantDbResult;

    // Check if organization name already exists
    const existingOrg = await prisma.organization.findFirst({
      where: {
        name: data.name.trim(),
        deletedAt: null,
      },
    });

    if (existingOrg) {
      return { success: false, error: 'Organization name already exists' };
    }

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        name: data.name.trim(),
        type: data.type || null,
        website: data.website || null,
        isAuthorized: true, // Set to authorized for tenant-created organizations
        status: 'ACTIVE',
        addressId: null,
      },
    });

    return { success: true, organizationId: organization.id };
  } catch (error) {
    console.error('Error creating organization:', error);
    return { success: false, error: 'Failed to create organization' };
  }
}

/**
 * Get organization details for tenant
 */
export async function getTenantOrganizationDetails(organizationId: string): Promise<{
  success: boolean;
  organization?: {
    id: string;
    name: string;
    type: string | null;
    website: string | null;
    status: string | null;
    address: {
      id: string;
      address: string;
      street: string | null;
      province: string | null;
      city: string | null;
      postalCode: string | null;
      suite: string | null;
    } | null;
    createdAt: Date;
    updatedAt: Date;
  };
  error?: string;
}> {
  try {
    const tenantDbResult = await getTenantDbFromHeaders();
    if (!tenantDbResult) {
      return { success: false, error: 'Tenant not found' };
    }

    const { prisma } = tenantDbResult;

    const organization = await prisma.organization.findUnique({
      where: {
        id: organizationId,
        deletedAt: null,
      },
      include: {
        address: true,
      },
    });

    if (!organization) {
      return { success: false, error: 'Organization not found' };
    }

    return {
      success: true,
      organization: {
        id: organization.id,
        name: organization.name,
        type: organization.type,
        website: organization.website,
        status: organization.status,
        address: organization.address
          ? {
              id: organization.address.id,
              address: organization.address.address,
              street: organization.address.street,
              province: organization.address.province,
              city: organization.address.city,
              postalCode: organization.address.postalCode,
              suite: organization.address.suite,
            }
          : null,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
      },
    };
  } catch (error) {
    console.error('Error getting organization details:', error);
    return { success: false, error: 'Failed to get organization details' };
  }
}

/**
 * Check if organization name exists for tenant
 */
export async function checkTenantOrganizationNameExists(
  name: string
): Promise<{ exists: boolean }> {
  try {
    const tenantDbResult = await getTenantDbFromHeaders();
    if (!tenantDbResult) {
      return { exists: false };
    }

    const { prisma } = tenantDbResult;

    const existing = await prisma.organization.findFirst({
      where: {
        name: name.trim(),
        deletedAt: null,
      },
    });

    return { exists: !!existing };
  } catch (error) {
    console.error('Error checking organization name:', error);
    return { exists: false };
  }
}
