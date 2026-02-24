'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/domains/auth/server/session';
import examinerService from '../server/examiner.service';
import applicationService from '../server/application.service';
import { signExaminerResubmitToken } from '@/lib/jwt';
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

const requestMoreInfo = async (id: string, message: string, documentsRequired: boolean = false) => {
  const user = await getCurrentUser();
  if (!user) {
    throw HttpError.unauthorized('You must be logged in to request more information');
  }

  if (!message?.trim()) {
    throw new Error('Request message is required');
  }

  // Check if it's an application or examiner
  const entityType = await checkEntityType(id);

  if (entityType === 'application') {
    // Update application status
    const application = await applicationService.requestMoreInfoFromApplication(
      id,
      message,
      documentsRequired
    );

    // Send request for more info email
    try {
      await sendRequestMoreInfoEmailToApplicant(application as any, message, documentsRequired);
      logger.log('✓ Request more info email sent successfully');
    } catch (emailError) {
      logger.error('⚠️ Failed to send request email:', emailError);
      throw emailError;
    }

    // Revalidate dashboard and examiner pages
    revalidatePath('/dashboard');
    revalidatePath('/examiner');

    return application;
  } else if (entityType === 'examiner') {
    // Update examiner status to INFO_REQUESTED
    const examiner = await examinerService.requestMoreInfoFromExaminer(
      id,
      message,
      documentsRequired
    );

    // Send request for more info email
    try {
      await sendRequestMoreInfoEmail(examiner as any, message, documentsRequired);
      logger.log('✓ Request more info email sent successfully');
    } catch (emailError) {
      logger.error('⚠️ Failed to send request email:', emailError);
      throw emailError;
    }

    // Revalidate dashboard and examiner pages
    revalidatePath('/dashboard');
    revalidatePath('/examiner');

    return examiner;
  } else {
    throw HttpError.notFound('Application or examiner not found');
  }
};

async function sendRequestMoreInfoEmailToApplicant(
  application: ExaminerApplication,
  requestMessage: string,
  documentsRequired: boolean = false
) {
  const userEmail = application.email;
  const firstName = application.firstName;
  const lastName = application.lastName;
  const applicationId = application.id;

  if (!userEmail || !firstName || !lastName || !applicationId) {
    logger.error('Missing required application information for request email');
    throw new Error('Missing application information');
  }

  // Generate token with application information for resubmission
  const token = signExaminerResubmitToken({
    email: userEmail,
    applicationId: applicationId,
  });

  const resubmitLink = `${process.env.NEXT_PUBLIC_APP_URL}/examiner/register?token=${token}`;

  const result = await emailService.sendEmail(
    'Thrive Medical Examiner Application - Additional Information Required',
    'examiner-request-more-info.html',
    {
      firstName,
      lastName,
      requestMessage,
      resubmitLink,
      documentsRequired,
      CDN_URL: process.env.NEXT_PUBLIC_CDN_URL || process.env.NEXT_PUBLIC_APP_URL || '',
    },
    userEmail
  );

  if (!result.success) {
    throw new Error((result as { success: false; error: string }).error);
  }
}

async function sendRequestMoreInfoEmail(
  examiner: ExaminerWithRelations,
  requestMessage: string,
  documentsRequired: boolean = false
) {
  const userEmail = examiner.account?.user?.email;
  const firstName = examiner.account?.user?.firstName;
  const lastName = examiner.account?.user?.lastName;
  const userId = examiner.account?.user?.id;
  const accountId = examiner.accountId;
  const examinerId = examiner.id;

  if (!userEmail || !firstName || !lastName || !userId || !accountId || !examinerId) {
    logger.error('Missing required user information for request email');
    throw new Error('Missing user information');
  }

  // Generate token with examiner's information for resubmission
  const token = signExaminerResubmitToken({
    email: userEmail,
    userId: userId,
    accountId: accountId,
    examinerId: examinerId,
  });

  const resubmitLink = `${process.env.NEXT_PUBLIC_APP_URL}/examiner/register?token=${token}`;

  const result = await emailService.sendEmail(
    'Thrive Medical Examiner Application - Additional Information Required',
    'examiner-request-more-info.html',
    {
      firstName,
      lastName,
      requestMessage,
      resubmitLink,
      documentsRequired,
      CDN_URL: process.env.NEXT_PUBLIC_CDN_URL || process.env.NEXT_PUBLIC_APP_URL || '',
    },
    userEmail
  );

  if (!result.success) {
    throw new Error((result as { success: false; error: string }).error);
  }
}

export default requestMoreInfo;
