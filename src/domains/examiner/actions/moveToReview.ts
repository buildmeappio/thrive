"use server";

import { getCurrentUser } from "@/domains/auth/server/session";
import examinerService from "../server/examiner.service";
import { sendMail } from "@/lib/email";
import { HttpError } from "@/utils/httpError";
import logger from "@/utils/logger";
import prisma from "@/lib/db";
import {
  generateExaminerInReviewEmail,
  EXAMINER_IN_REVIEW_SUBJECT,
} from "@/emails/examiner-status-updates";

const moveToReview = async (examinerId: string) => {
  const user = await getCurrentUser();
  if (!user) {
    throw HttpError.unauthorized("You must be logged in to update examiner status");
  }

  const examiner = await examinerService.moveToReview(examinerId);

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

      const htmlTemplate = generateExaminerInReviewEmail({ firstName, lastName });

      await sendMail({
        to: email,
        subject: EXAMINER_IN_REVIEW_SUBJECT,
        html: htmlTemplate,
      });

      logger.log(`✅ Status update email sent to ${email}`);
    }
  } catch (emailError) {
    logger.error("Failed to send status update email:", emailError);
  }

  return examiner;
};

export default moveToReview;

