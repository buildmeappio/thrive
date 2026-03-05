'use server';

import { headers } from 'next/headers';
import masterDb from '@thrive/database-master/db';
import { getTenantDb } from '@/lib/tenant-db';
import { PrismaClient } from '@thrive/database';
import { ExaminerProfileDto } from '@/domains/examiner/server/dto/examiner-profile.dto';
import { ExaminerProfileData } from '@/domains/examiner/types/ExaminerProfileData';
import { getS3FileUrl } from '@/lib/s3';

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
 * Get examiner profile details for tenant
 */
export async function getTenantExaminerProfileById(examinerId: string): Promise<{
  success: boolean;
  profile?: ExaminerProfileData;
  error?: string;
}> {
  try {
    const tenantDbResult = await getTenantDbFromHeaders();
    if (!tenantDbResult) {
      return { success: false, error: 'Tenant not found' };
    }

    const { prisma } = tenantDbResult;

    // Fetch examiner profile with all relations
    const examinerProfile = await prisma.examinerProfile.findUnique({
      where: { id: examinerId, deletedAt: null },
      include: {
        account: {
          include: {
            user: {
              include: {
                profilePhoto: true,
              },
            },
          },
        },
        governmentIdDocument: true,
        resumeDocument: true,
        insuranceDocument: true,
      },
    });

    if (!examinerProfile) {
      return { success: false, error: 'Examiner profile not found' };
    }

    // Fetch availability provider data
    const availabilityProvider = await prisma.availabilityProvider.findFirst({
      where: {
        refId: examinerId,
        providerType: 'EXAMINER',
        deletedAt: null,
      },
      include: {
        weeklyHours: {
          include: {
            timeSlots: {
              orderBy: { startTime: 'asc' },
            },
          },
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    });

    // Generate presigned URLs for documents
    let profilePhotoUrl: string | undefined;
    if (examinerProfile.account.user.profilePhoto) {
      try {
        profilePhotoUrl = await getS3FileUrl(
          `examiner/${examinerProfile.account.user.profilePhoto.name}`,
          3600
        );
      } catch (error) {
        console.error('Failed to generate presigned URL for profile photo:', error);
      }
    }

    // Fetch medical license documents and generate presigned URLs
    let medicalLicenseUrls: string[] = [];
    let medicalLicenseNames: string[] = [];
    if (
      examinerProfile.medicalLicenseDocumentIds &&
      examinerProfile.medicalLicenseDocumentIds.length > 0
    ) {
      try {
        const medicalLicenseDocs = await prisma.documents.findMany({
          where: {
            id: { in: examinerProfile.medicalLicenseDocumentIds },
            deletedAt: null,
          },
        });

        const urlsAndNames = await Promise.all(
          medicalLicenseDocs.map(async doc => {
            try {
              const url = await getS3FileUrl(`examiner/${doc.name}`, 3600);
              return { url, name: doc.name };
            } catch (error) {
              console.error(
                `Failed to generate presigned URL for medical license ${doc.id}:`,
                error
              );
              return null;
            }
          })
        );

        const validDocs = urlsAndNames.filter(
          (item): item is { url: string; name: string } => item !== null
        );
        medicalLicenseUrls = validDocs.map(d => d.url);
        medicalLicenseNames = validDocs.map(d => d.name);
      } catch (error) {
        console.error('Failed to fetch medical license documents:', error);
      }
    }

    // Fetch specialty certificates documents and generate presigned URLs
    let specialtyCertificatesUrls: string[] = [];
    let specialtyCertificatesNames: string[] = [];
    if (
      examinerProfile.specialtyCertificatesDocumentIds &&
      examinerProfile.specialtyCertificatesDocumentIds.length > 0
    ) {
      try {
        const specialtyCertsDocs = await prisma.documents.findMany({
          where: {
            id: { in: examinerProfile.specialtyCertificatesDocumentIds },
            deletedAt: null,
          },
        });

        const urlsAndNames = await Promise.all(
          specialtyCertsDocs.map(async doc => {
            try {
              const url = await getS3FileUrl(`examiner/${doc.name}`, 3600);
              return { url, name: doc.name };
            } catch (error) {
              console.error(
                `Failed to generate presigned URL for specialty certificate ${doc.id}:`,
                error
              );
              return null;
            }
          })
        );

        const validDocs = urlsAndNames.filter(
          (item): item is { url: string; name: string } => item !== null
        );
        specialtyCertificatesUrls = validDocs.map(d => d.url);
        specialtyCertificatesNames = validDocs.map(d => d.name);
      } catch (error) {
        console.error('Failed to fetch specialty certificates documents:', error);
      }
    }

    // Generate presigned URLs for other documents
    let governmentIdUrl: string | undefined;
    let governmentIdName: string | undefined;
    if (examinerProfile.governmentIdDocument) {
      try {
        governmentIdUrl = await getS3FileUrl(
          `examiner/${examinerProfile.governmentIdDocument.name}`,
          3600
        );
        governmentIdName = examinerProfile.governmentIdDocument.name;
      } catch (error) {
        console.error('Failed to generate presigned URL for government ID:', error);
      }
    }

    let resumeUrl: string | undefined;
    let resumeName: string | undefined;
    if (examinerProfile.resumeDocument) {
      try {
        resumeUrl = await getS3FileUrl(`examiner/${examinerProfile.resumeDocument.name}`, 3600);
        resumeName = examinerProfile.resumeDocument.name;
      } catch (error) {
        console.error('Failed to generate presigned URL for resume:', error);
      }
    }

    let insuranceUrl: string | undefined;
    let insuranceName: string | undefined;
    if (examinerProfile.insuranceDocument) {
      try {
        insuranceUrl = await getS3FileUrl(
          `examiner/${examinerProfile.insuranceDocument.name}`,
          3600
        );
        insuranceName = examinerProfile.insuranceDocument.name;
      } catch (error) {
        console.error('Failed to generate presigned URL for insurance:', error);
      }
    }

    // Transform to ExaminerProfileData using DTO
    const profileData = ExaminerProfileDto.toExaminerProfileData(
      {
        ...examinerProfile,
        availabilityProvider: availabilityProvider || undefined,
      },
      medicalLicenseUrls,
      specialtyCertificatesUrls,
      governmentIdUrl,
      resumeUrl,
      insuranceUrl,
      profilePhotoUrl,
      medicalLicenseNames,
      specialtyCertificatesNames,
      governmentIdName,
      resumeName,
      insuranceName
    );

    return { success: true, profile: profileData };
  } catch (error) {
    console.error('Error getting examiner profile details:', error);
    return { success: false, error: 'Failed to get examiner profile details' };
  }
}
