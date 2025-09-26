// import { randomUUID } from 'crypto';
// import prisma from '@/lib/prisma';
// import emailService from '../services/emailService';

const createSecureLink = async (examinationId: string) => {
  // const token = randomUUID();
  // const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

  // // 1. Create secure link record
  // const secureLink = await prisma.examinationSecureLink.create({
  //   data: {
  //     examinationId,
  //     token,
  //     expiresAt,
  //   },
  // });

  // // 2. Fetch claimant email through referral
  // const examinationData = await prisma.examination.findUnique({
  //   where: { caseNumber: examinationId },
  //   include: {
  //     case: {
  //       include: {
  //         claimant: true,
  //       },
  //     },
  //   },
  // });

  // const claimantEmail = examinationData?.referral?.claimant?.emailAddress;

  // if (!claimantEmail) {
  //   throw new Error(`No claimant email found for examination ${examinationId}`);
  // }

  // // 3. Send email with secure link
  // const link = `http://localhost:3000/claimant/availability/${secureLink.token}`;

  // await emailService.sendEmail(
  //   'Set your Availability - Thrive',
  //   'otp.html',
  //   { link },
  //   claimantEmail
  // );

  // return link;
  return `https://example.com/secure-link/${examinationId}`;
};
export default createSecureLink;
