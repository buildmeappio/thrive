"use server";

import { getCurrentUser } from "@/domains/auth/server/session";
import examinerService from "../server/examiner.service";
import applicationService from "../server/application.service";
import { sendMail } from "@/lib/email";
import { HttpError } from "@/utils/httpError";
import logger from "@/utils/logger";
import prisma from "@/lib/db";
import {
  generateExaminerInterviewScheduledEmail,
  EXAMINER_INTERVIEW_SCHEDULED_SUBJECT,
} from "@/emails/examiner-status-updates";
import { checkEntityType } from "../utils/checkEntityType";

const scheduleInterview = async (id: string) => {
  const user = await getCurrentUser();
  if (!user) {
    throw HttpError.unauthorized("You must be logged in to schedule interview");
  }

  // Check if it's an application or examiner
  const entityType = await checkEntityType(id);
  
  if (entityType === 'application') {
    const application = await applicationService.scheduleApplicationInterview(id);
    
    // Send notification email to applicant
    try {
      if (application.email && application.firstName && application.lastName) {
        const htmlTemplate = generateExaminerInterviewScheduledEmail({ 
          firstName: application.firstName, 
          lastName: application.lastName 
        });

        await sendMail({
          to: application.email,
          subject: EXAMINER_INTERVIEW_SCHEDULED_SUBJECT,
          html: htmlTemplate,
        });

        logger.log(`✅ Interview scheduled email sent to ${application.email}`);
      }
    } catch (emailError) {
      logger.error("Failed to send interview scheduled email:", emailError);
    }

    return application;
  } else if (entityType === 'examiner') {
    const examiner = await examinerService.scheduleInterview(id);

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

        const htmlTemplate = generateExaminerInterviewScheduledEmail({ firstName, lastName });

        await sendMail({
          to: email,
          subject: EXAMINER_INTERVIEW_SCHEDULED_SUBJECT,
          html: htmlTemplate,
        });

        logger.log(`✅ Interview scheduled email sent to ${email}`);
      }
    } catch (emailError) {
      logger.error("Failed to send interview scheduled email:", emailError);
    }

    return examiner;
  } else {
    throw HttpError.notFound("Application or examiner not found");
  }
};

export default scheduleInterview;

