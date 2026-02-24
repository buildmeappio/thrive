'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/domains/auth/server/session';
import examinerService from '../server/examiner.service';
import applicationService from '../server/application.service';
import emailService from '@/services/email.service';
import {
  ExaminerProfile,
  Account,
  User,
  Documents,
  ExaminerLanguage,
  Language,
  ExaminerApplication,
} from '@thrive/database';
import { HttpError } from '@/utils/httpError';
import logger from '@/utils/logger';
import { checkEntityType } from '../utils/checkEntityType';

interface ExaminerWithRelations extends ExaminerProfile {
  account: Account & {
    user: User;
  };
  resumeDocument: Documents | null;
  ndaDocument: Documents | null;
  insuranceDocument: Documents | null;
  examinerLanguages: Array<ExaminerLanguage & { language: Language }>;
}

const rejectExaminer = async (id: string, messageToExaminer: string) => {
  const user = await getCurrentUser();
  if (!user) {
    throw HttpError.unauthorized('You must be logged in to reject');
  }

  if (!messageToExaminer?.trim()) {
    throw new Error('Rejection message is required');
  }

  // Check if it's an application or examiner
  const entityType = await checkEntityType(id);

  if (entityType === 'application') {
    // Reject the application
    const application = await applicationService.rejectApplication(
      id,
      user.accountId,
      messageToExaminer.trim()
    );

    // Send rejection email
    try {
      await sendRejectionEmailToApplicant(application as any, messageToExaminer);
      logger.log('✓ Rejection email sent successfully');
    } catch (emailError) {
      logger.error('⚠️ Failed to send rejection email (but rejection succeeded):', emailError);
    }

    // Revalidate dashboard and examiner pages
    revalidatePath('/dashboard');
    revalidatePath('/examiner');

    return application;
  } else if (entityType === 'examiner') {
    // Reject the examiner
    const examiner = await examinerService.rejectExaminer(
      id,
      user.accountId,
      messageToExaminer.trim()
    );

    // Send rejection email
    try {
      await sendRejectionEmailToExaminer(examiner as any, messageToExaminer);
      logger.log('✓ Rejection email sent successfully');
    } catch (emailError) {
      logger.error('⚠️ Failed to send rejection email (but rejection succeeded):', emailError);
    }

    // Revalidate dashboard and examiner pages
    revalidatePath('/dashboard');
    revalidatePath('/examiner');

    return examiner;
  } else {
    throw HttpError.notFound('Application or examiner not found');
  }
};

async function sendRejectionEmailToApplicant(
  application: ExaminerApplication,
  rejectionMessage: string
) {
  const userEmail = application.email;
  const firstName = application.firstName;
  const lastName = application.lastName;

  if (!userEmail || !firstName || !lastName) {
    logger.error('Missing required application information for rejection email');
    return;
  }

  const result = await emailService.sendEmail(
    'Thrive Medical Examiner Application - Status Update',
    'examiner-rejection.html',
    {
      firstName,
      lastName,
      rejectionMessage,
      CDN_URL: process.env.NEXT_PUBLIC_CDN_URL || process.env.NEXT_PUBLIC_APP_URL || '',
    },
    userEmail
  );

  if (!result.success) {
    throw new Error((result as { success: false; error: string }).error);
  }
}

async function sendRejectionEmailToExaminer(
  examiner: ExaminerWithRelations,
  rejectionMessage: string
) {
  const userEmail = examiner.account?.user?.email;
  const firstName = examiner.account?.user?.firstName;
  const lastName = examiner.account?.user?.lastName;

  if (!userEmail || !firstName || !lastName) {
    logger.error('Missing required user information for rejection email');
    return;
  }

  const result = await emailService.sendEmail(
    'Thrive Medical Examiner Application - Status Update',
    'examiner-rejection.html',
    {
      firstName,
      lastName,
      rejectionMessage,
      CDN_URL: process.env.NEXT_PUBLIC_CDN_URL || process.env.NEXT_PUBLIC_APP_URL || '',
    },
    userEmail
  );

  if (!result.success) {
    throw new Error((result as { success: false; error: string }).error);
  }
}

export default rejectExaminer;
