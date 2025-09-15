import { randomUUID } from 'crypto';
import prisma from '@/shared/lib/prisma';
import emailService from '../lib/emailService';

const createSecureLink = async (caseId: string) => {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

  // 1. Create secure link record
  const secureLink = await prisma.caseSecureLink.create({
    data: {
      caseId,
      token,
      expiresAt,
    },
  });

  // 2. Fetch claimant email through referral
  const caseData = await prisma.case.findUnique({
    where: { caseNumber: caseId },
    include: {
      referral: {
        include: {
          claimant: true,
        },
      },
    },
  });

  const claimantEmail = caseData?.referral?.claimant?.emailAddress;

  if (!claimantEmail) {
    throw new Error(`No claimant email found for case ${caseId}`);
  }

  // 3. Send email with secure link
  const link = `http://localhost:3000/claimant/availability/${secureLink.token}`;

  await emailService.sendEmail(
    'Set your Availability - Thrive',
    'otp.html',
    { link },
    claimantEmail
  );

  return link;
};
export default createSecureLink;
