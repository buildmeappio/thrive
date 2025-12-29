import { randomUUID } from 'crypto';
import prisma from '@/lib/db';
import log from '@/utils/log';
import { signClaimantApprovalToken } from '@/lib/jwt';
import env from '@/config/env';

const createSecureLink = async (
  examinationId: string,
  _userType: 'claimant' | 'examiner' | 'organization' = 'claimant',
  expiresInHours: number = 168 // Default: 7 days (168 hours) for claimant availability
): Promise<string> => {
  try {
    // Get examination data to create JWT token with required payload
    const examination = await prisma.examination.findUnique({
      where: { id: examinationId },
      include: {
        case: true,
        claimant: true,
      },
    });

    if (!examination || !examination.claimant || !examination.case) {
      throw new Error('Examination, claimant, or case not found');
    }

    const claimantEmail = examination.claimant.emailAddress;
    if (!claimantEmail) {
      throw new Error('Claimant email address is required');
    }

    // Convert expiresInHours to JWT expiresIn format (e.g., "24h", "7d")
    let expiresIn: string;
    if (expiresInHours >= 168) {
      // 168 hours = 7 days
      expiresIn = `${Math.floor(expiresInHours / 24)}d`;
    } else {
      expiresIn = `${expiresInHours}h`;
    }

    // Generate JWT token with required payload (email, caseId, examinationId)
    const jwtToken = signClaimantApprovalToken(
      {
        email: claimantEmail,
        caseId: examination.caseId,
        examinationId: examination.id,
      },
      expiresIn as any
    );

    // Calculate expiration date based on expiresInHours
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    // Generate a short reference token (UUID) for database storage (fits in VarChar(255))
    // The JWT token is used in the URL for authentication, but we store a reference UUID for tracking
    const referenceToken = randomUUID();

    // Store the reference token in the database for tracking purposes
    const secureLink = await prisma.secureLink.create({
      data: {
        token: referenceToken,
        expiresAt,
        status: 'PENDING',
      },
    });

    await prisma.examinationSecureLink.create({
      data: {
        examinationId: examination.id,
        secureLinkId: secureLink.id,
      },
    });

    // Generate the secure link URL with token as query parameter
    const baseUrl = env.NEXT_PUBLIC_APP_URL || 'https://portal-dev.thriveassessmentcare.com';
    const link = `${baseUrl}${env.NEXT_PUBLIC_CLAIMANT_AVAILABILITY_URL}?token=${jwtToken}`;

    log.info(
      `Created secure link for examination ${examinationId}: ${link} (stored in DB with ID: ${secureLink.id})`
    );

    return link;
  } catch (error) {
    log.error('Error creating secure link:', error);
    throw new Error('Failed to create secure link');
  }
};

export default createSecureLink;
