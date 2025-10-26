import { randomUUID } from 'crypto';
import prisma from '@/lib/prisma';
import log from '@/utils/log';

interface CreateSecureLinkOptions {
  examinationId: string;
  userType: 'claimant' | 'examiner' | 'organization';
  expiresInHours?: number;
}

const createSecureLink = async (
  examinationId: string,
  userType: 'claimant' | 'examiner' | 'organization' = 'claimant',
  expiresInHours: number = 24
): Promise<string> => {
  try {
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    // Create secure link record
    const secureLink = await prisma.examinationSecureLink.create({
      data: {
        examinationId,
        token,
        expiresAt,
        status: 'PENDING',
      },
    });

    // Generate the secure link URL
    const baseUrl = 'https://portal-dev.thriveassessmentcare.com';
    const link = `${baseUrl}/claimant/availability/${secureLink.token}`;

    log.info(`Created secure link for examination ${examinationId}: ${link}`);

    return link;
  } catch (error) {
    log.error('Error creating secure link:', error);
    throw new Error('Failed to create secure link');
  }
};

export default createSecureLink;
