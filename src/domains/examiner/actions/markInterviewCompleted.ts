"use server";

import { getCurrentUser } from "@/domains/auth/server/session";
import examinerService from "../server/examiner.service";
import applicationService from "../server/application.service";
import { sendMail } from "@/lib/email";
import { HttpError } from "@/utils/httpError";
import logger from "@/utils/logger";
import prisma from "@/lib/db";
import {
  generateExaminerInterviewCompletedEmail,
  EXAMINER_INTERVIEW_COMPLETED_SUBJECT,
} from "@/emails/examiner-status-updates";
import { checkEntityType } from "../utils/checkEntityType";

const markInterviewCompleted = async (id: string) => {
  const user = await getCurrentUser();
  if (!user) {
    throw HttpError.unauthorized(
      "You must be logged in to update interview status",
    );
  }

  // Check if it's an application or examiner
  const entityType = await checkEntityType(id);

  if (entityType === "application") {
    const application =
      await applicationService.markApplicationInterviewCompleted(id);

    // Send notification email to applicant
    try {
      if (application.email && application.firstName && application.lastName) {
        const htmlTemplate = generateExaminerInterviewCompletedEmail({
          firstName: application.firstName,
          lastName: application.lastName,
        });

        await sendMail({
          to: application.email,
          subject: EXAMINER_INTERVIEW_COMPLETED_SUBJECT,
          html: htmlTemplate,
        });

        logger.log(`✅ Interview completed email sent to ${application.email}`);
      }
    } catch (emailError) {
      logger.error("Failed to send interview completed email:", emailError);
    }

    return application;
  } else if (entityType === "examiner") {
    const examiner = await examinerService.markInterviewCompleted(id);

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

        const htmlTemplate = generateExaminerInterviewCompletedEmail({
          firstName,
          lastName,
        });

        await sendMail({
          to: email,
          subject: EXAMINER_INTERVIEW_COMPLETED_SUBJECT,
          html: htmlTemplate,
        });

        logger.log(`✅ Interview completed email sent to ${email}`);
      }
    } catch (emailError) {
      logger.error("Failed to send interview completed email:", emailError);
    }

    return examiner;
  } else {
    throw HttpError.notFound("Application or examiner not found");
  }
};

export default markInterviewCompleted;
