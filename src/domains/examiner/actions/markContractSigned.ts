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
import { checkEntityType } from "../utils/checkEntityType";
import { ExaminerStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

const markContractSigned = async (id: string) => {
  const user = await getCurrentUser();
  if (!user) {
    throw HttpError.unauthorized(
      "You must be logged in to update contract status",
    );
  }

  // Check if it's an application or examiner
  const entityType = await checkEntityType(id);

  if (entityType === "application") {
    // Update application status
    const application = await prisma.examinerApplication.update({
      where: { id },
      data: {
        status: ExaminerStatus.CONTRACT_SIGNED,
        contractConfirmedByAdminAt: new Date(),
      },
    });

    // Send notification email to applicant
    try {
      const firstName = application.firstName || "";
      const lastName = application.lastName || "";
      const email = application.email;

      const htmlTemplate = generateExaminerContractSignedEmail({
        firstName,
        lastName,
      });

      await sendMail({
        to: email,
        subject: EXAMINER_CONTRACT_SIGNED_SUBJECT,
        html: htmlTemplate,
      });

      logger.log(`✅ Contract signed confirmation email sent to ${email}`);
    } catch (emailError) {
      logger.error("Failed to send contract signed email:", emailError);
    }

    revalidatePath(`/examiner/application/${id}`);
    return application;
  } else if (entityType === "examiner") {
    // Handle examiner (existing logic)
    const examiner = await examinerService.markContractSigned(id);

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

        const htmlTemplate = generateExaminerContractSignedEmail({
          firstName,
          lastName,
        });

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

    revalidatePath(`/examiner/${id}`);
    return examiner;
  } else {
    throw HttpError.notFound("Application or examiner not found");
  }
};

export default markContractSigned;
