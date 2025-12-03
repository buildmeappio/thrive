"use server";

import { getCurrentUser } from "@/domains/auth/server/session";
import examinerService from "../server/examiner.service";
import { sendMail } from "@/lib/email";
import { HttpError } from "@/utils/httpError";
import logger from "@/utils/logger";
import prisma from "@/lib/db";
import {
  generateExaminerContractSignedEmail,
  EXAMINER_CONTRACT_SIGNED_SUBJECT,
} from "@/emails/examiner-status-updates";

const markContractSigned = async (examinerId: string) => {
  const user = await getCurrentUser();
  if (!user) {
    throw HttpError.unauthorized("You must be logged in to update contract status");
  }

  const examiner = await examinerService.markContractSigned(examinerId);

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

      const htmlTemplate = generateExaminerContractSignedEmail({ firstName, lastName });

      await sendMail({
        to: email,
        subject: EXAMINER_CONTRACT_SIGNED_SUBJECT,
        html: htmlTemplate,
      });

      logger.log(`✅ Contract signed confirmation email sent to ${email}`);
    }
  } catch (emailError) {
    logger.error("Failed to send contract signed email:", emailError);
  }

  return examiner;
};

export default markContractSigned;

