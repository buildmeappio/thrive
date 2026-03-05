'use server';

import masterDb from '@thrive/database-master/db';
import { getS3FileUrl } from '@/lib/s3';

/**
 * Get tenant info (name and logo) by subdomain
 * Returns presigned URL for logo if it's an S3 key
 */
export async function getTenantInfo(subdomain: string) {
  if (!subdomain) {
    return null;
  }

  const tenant = await masterDb.tenant.findUnique({
    where: { subdomain },
    select: {
      id: true,
      name: true,
      logoUrl: true,
    },
  });

  if (!tenant) {
    return null;
  }

  // Convert S3 key to presigned URL if needed
  // If logoUrl is already a full URL (http/https), use it as-is
  // Otherwise, treat it as an S3 key and generate a presigned URL
  let logoUrl: string | null = null;
  if (tenant.logoUrl) {
    if (tenant.logoUrl.startsWith('http://') || tenant.logoUrl.startsWith('https://')) {
      logoUrl = tenant.logoUrl;
    } else {
      // It's an S3 key, generate presigned URL (1 hour expiration)
      try {
        logoUrl = await getS3FileUrl(tenant.logoUrl, 3600);
      } catch (error) {
        console.error('Failed to generate presigned URL for logo:', error);
        logoUrl = null;
      }
    }
  }

  return {
    id: tenant.id,
    name: tenant.name,
    logoUrl,
  };
}
