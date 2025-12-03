"use server";

import { getCurrentUser } from "@/domains/auth/server/session";
import examinerService from "../server/examiner.service";
import { sendMail } from "@/lib/email";
import { HttpError } from "@/utils/httpError";
import logger from "@/utils/logger";
import prisma from "@/lib/db";
import {
  generateExaminerInterviewScheduledEmail,
  EXAMINER_INTERVIEW_SCHEDULED_SUBJECT,
} from "@/emails/examiner-status-updates";

const scheduleInterview = async (examinerId: string) => {
  const user = await getCurrentUser();
  if (!user) {
    throw HttpError.unauthorized("You must be logged in to schedule interview");
  }

  const examiner = await examinerService.scheduleInterview(examinerId);

  // Send notification email to examiner
  try {
    const examinerWithUser = await prisma.examinerProfile.findUnique({
      where: { id: examinerId },
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
};

export default scheduleInterview;

