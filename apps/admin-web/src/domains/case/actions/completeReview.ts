'use server';

import { getCurrentUser } from '@/domains/auth/server/session';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import emailService from '@/services/email.service';
import caseHandlers from '../server/handlers';
import prisma from '@/lib/db';
import { CaseDetailDtoType } from '../types/CaseDetailDtoType';
import createSecureLink from '@/utils/createSecureLink';
import logger from '@/utils/logger';

const completeReview = async (caseId: string): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  // Fetch case details
  const caseDetails = await caseHandlers.getCaseById(caseId, user.id);

  if (!caseDetails) {
    throw new Error('Case not found');
  }

  // Update case status to "Ready to be Appointment" in database
  try {
    // Find the "Ready to be Appointment" status
    const waitingStatus = await prisma.caseStatus.findFirst({
      where: {
        name: 'Ready to be Appointment',
      },
    });

    if (!waitingStatus) {
      throw new Error('Ready to be Appointment status not found in database');
    }

    // Update the examination status and set approval timestamp
    await prisma.examination.update({
      where: { id: caseId },
      data: {
        statusId: waitingStatus.id,
        approvedAt: new Date(),
      },
    });

    logger.log('✓ Case status updated to Ready to be Appointment with approval timestamp');
  } catch (dbError) {
    logger.error('⚠️ Failed to update case status:', dbError);
    throw new Error('Failed to update case status in database');
  }

  // Send approval email to claimant
  try {
    await sendApprovalEmailToClaimant(caseDetails);
    logger.log('✓ Approval email sent to claimant');
  } catch (emailError) {
    logger.error('⚠️ Failed to send approval email:', emailError);
    throw emailError;
  }

  // Revalidate pages
  revalidatePath('/dashboard');
  revalidatePath('/cases');
  revalidatePath(`/cases/${caseId}`);
};

async function sendApprovalEmailToClaimant(caseDetails: CaseDetailDtoType) {
  const claimantEmail = caseDetails.claimant?.emailAddress;
  const firstName = caseDetails.claimant?.firstName || '';
  const lastName = caseDetails.claimant?.lastName || '';
  const organizationName = caseDetails.case.organization?.name || 'Unknown Organization';

  if (!claimantEmail) {
    logger.error('Claimant email not found');
    throw new Error('Claimant email not found');
  }

  // Create secure link using the utility function
  // This will generate JWT token with correct payload (email, caseId, examinationId)
  // and store reference token in ExaminationSecureLink table
  // caseDetails.id is the examination ID
  // Link expires in 7 days (168 hours)
  const availabilityLink = await createSecureLink(caseDetails.id, 168);

  const submittedDate = caseDetails.createdAt
    ? new Date(caseDetails.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Unknown';

  const result = await emailService.sendEmail(
    `Select Your Appointment - Thrive`,
    'case-approval.html',
    {
      firstName,
      lastName,
      caseNumber: caseDetails.caseNumber,
      organizationName,
      submittedDate,
      availabilityLink,
      CDN_URL: process.env.NEXT_PUBLIC_CDN_URL || process.env.NEXT_PUBLIC_APP_URL || '',
    },
    claimantEmail
  );

  if (!result.success) {
    throw new Error((result as { success: false; error: string }).error);
  }
}

export default completeReview;
