'use server';

import { getCurrentUser } from '@/domains/auth/server/session';
import applicationService from '../server/application.service';
import prisma from '@/lib/db';
import { sendMail } from '@/lib/email';
import { signExaminerApplicationToken } from '@/lib/jwt';
import {
  EXAMINER_APPROVED_SUBJECT,
  generateExaminerApprovedEmail,
} from '@/emails/examiner-approved';
import { HttpError } from '@/utils/httpError';
import logger from '@/utils/logger';
import { ExaminerStatus } from '@thrive/database';

const resendApprovedEmail = async (applicationId: string) => {
  const user = await getCurrentUser();
  if (!user) {
    throw HttpError.unauthorized('You must be logged in to resend email');
  }

  // Get the application
  const application = await prisma.examinerApplication.findUnique({
    where: { id: applicationId },
    include: {
      examinerProfile: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!application) {
    throw HttpError.notFound('Application not found');
  }

  // Check if application is approved
  if (application.status !== ExaminerStatus.APPROVED) {
    throw HttpError.badRequest('Application is not approved');
  }

  // Check if examiner has already registered (has examinerProfile)
  if (application.examinerProfile) {
    throw HttpError.badRequest('Examiner has already registered. Cannot resend approval email.');
  }

  const userEmail = application.email;
  const firstName = application.firstName;
  const lastName = application.lastName;

  if (!userEmail || !firstName || !lastName) {
    throw HttpError.badRequest('Missing required application information for email');
  }

  // Generate token with email and application ID
  const token = signExaminerApplicationToken({
    email: userEmail,
    applicationId: application.id,
  });

  const createAccountLink = `${process.env.NEXT_PUBLIC_APP_URL}/examiner/create-account?token=${token}`;

  const htmlTemplate = generateExaminerApprovedEmail({
    firstName,
    lastName,
    createAccountLink,
  });

  try {
    await sendMail({
      to: userEmail,
      subject: EXAMINER_APPROVED_SUBJECT,
      html: htmlTemplate,
    });
    logger.log('✓ Approval email resent successfully');
    return { success: true };
  } catch (emailError) {
    logger.error('Failed to resend approval email:', emailError);
    throw HttpError.fromError(emailError, 'Failed to resend approval email', 500);
  }
};

export default resendApprovedEmail;
