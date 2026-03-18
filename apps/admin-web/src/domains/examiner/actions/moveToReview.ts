'use server';

import { getCurrentUser } from '@/domains/auth/server/session';
import { getTenantDbFromHeaders } from '@/domains/organization/actions/tenant-helpers';
import { getTenantSessionFromCookies } from '@/domains/auth/server/better-auth/tenant-session';
import { createTenantApplicationService } from '@/domains/tenant-dashboard/server/application.service';
import examinerService from '../server/examiner.service';
import applicationService from '../server/application.service';
import { sendMail } from '@/lib/email';
import { HttpError } from '@/utils/httpError';
import logger from '@/utils/logger';
import prisma from '@/lib/db';
import {
  generateExaminerInReviewEmail,
  EXAMINER_IN_REVIEW_SUBJECT,
} from '@/emails/examiner-status-updates';
import { checkEntityType } from '../utils/checkEntityType';

async function sendInReviewEmailToApplicant(application: {
  email: string;
  firstName: string | null;
  lastName: string | null;
}) {
  try {
    if (application.email && application.firstName && application.lastName) {
      const htmlTemplate = generateExaminerInReviewEmail({
        firstName: application.firstName,
        lastName: application.lastName,
      });
      await sendMail({
        to: application.email,
        subject: EXAMINER_IN_REVIEW_SUBJECT,
        html: htmlTemplate,
      });
      logger.log(`✅ Status update email sent to ${application.email}`);
    }
  } catch (emailError) {
    logger.error('Failed to send status update email:', emailError);
  }
}

const moveToReview = async (id: string) => {
  // Tenant context: when on subdomain with valid tenant session, use tenant DB
  const tenantDbResult = await getTenantDbFromHeaders();
  if (tenantDbResult) {
    const tenantSession = await getTenantSessionFromCookies(tenantDbResult.tenantId);
    if (tenantSession) {
      const tenantApplicationService = createTenantApplicationService(tenantDbResult.prisma);
      const application = await tenantApplicationService.moveApplicationToReview(id);
      await sendInReviewEmailToApplicant(application);
      return application;
    }
  }

  // Central (private) context: require central auth
  const user = await getCurrentUser();
  if (!user) {
    throw HttpError.unauthorized('You must be logged in to update status');
  }

  const entityType = await checkEntityType(id);

  if (entityType === 'application') {
    const application = await applicationService.moveApplicationToReview(id);
    await sendInReviewEmailToApplicant(application);
    return application;
  } else if (entityType === 'examiner') {
    const examiner = await examinerService.moveToReview(id);

    // Send notification email to examiner
    try {
      const examinerWithUser = await prisma.examinerProfile.findUnique({
        where: { id },
        include: {
          account: {
            include: {
              user: true,
            },
          },
        },
      });

      if (examinerWithUser?.account?.user) {
        const firstName = examinerWithUser.account.user.firstName;
        const lastName = examinerWithUser.account.user.lastName;
        const email = examinerWithUser.account.user.email;

        const htmlTemplate = generateExaminerInReviewEmail({
          firstName,
          lastName,
        });

        await sendMail({
          to: email,
          subject: EXAMINER_IN_REVIEW_SUBJECT,
          html: htmlTemplate,
        });

        logger.log(`✅ Status update email sent to ${email}`);
      }
    } catch (emailError) {
      logger.error('Failed to send status update email:', emailError);
    }

    return examiner;
  } else {
    throw HttpError.notFound('Application or examiner not found');
  }
};

export default moveToReview;
