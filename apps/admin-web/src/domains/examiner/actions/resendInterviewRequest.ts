"use server";

import { getCurrentUser } from "@/domains/auth/server/session";
import applicationService from "../server/application.service";
import { sendMail } from "@/lib/email";
import { HttpError } from "@/utils/httpError";
import logger from "@/utils/logger";
import {
  generateExaminerInterviewRequestedEmail,
  EXAMINER_INTERVIEW_REQUESTED_SUBJECT,
} from "@/emails/examiner-status-updates";
import { checkEntityType } from "../utils/checkEntityType";
import { signExaminerScheduleInterviewToken } from "@/lib/jwt";
import { ExaminerStatus } from "@thrive/database";

const resendInterviewRequest = async (id: string) => {
  const user = await getCurrentUser();
  if (!user) {
    throw HttpError.unauthorized(
      "You must be logged in to resend interview request",
    );
  }

  // Check if it's an application or examiner
  const entityType = await checkEntityType(id);

  if (entityType === "application") {
    const application = await applicationService.getApplicationById(id);

    if (!application) {
      throw HttpError.notFound("Application not found");
    }

    // Check if application is in INTERVIEW_REQUESTED status
    if (application.status !== ExaminerStatus.INTERVIEW_REQUESTED) {
      throw HttpError.badRequest(
        "Application must be in INTERVIEW_REQUESTED status to resend the interview request",
      );
    }

    // Send notification email to applicant
    try {
      if (application.email && application.firstName && application.lastName) {
        // Generate new JWT token for interview scheduling link
        const jwtToken = signExaminerScheduleInterviewToken({
          email: application.email,
          applicationId: application.id,
        });

        // Create scheduling link
        const scheduleInterviewLink = `${process.env.NEXT_PUBLIC_APP_URL}/examiner/schedule-interview?token=${jwtToken}`;

        // Store the new link in database using ApplicationSecureLink
        await applicationService.createInterviewSchedulingLink({
          applicationId: application.id,
          expiresInDays: 30,
          token: jwtToken,
        });

        const htmlTemplate = generateExaminerInterviewRequestedEmail({
          firstName: application.firstName,
          lastName: application.lastName,
          scheduleInterviewLink,
        });

        await sendMail({
          to: application.email,
          subject: EXAMINER_INTERVIEW_REQUESTED_SUBJECT,
          html: htmlTemplate,
        });

        logger.log(`✅ Interview request email resent to ${application.email}`);
      }
    } catch (emailError) {
      logger.error("Failed to resend interview request email:", emailError);
      throw emailError;
    }

    return { success: true };
  } else if (entityType === "examiner") {
    throw HttpError.badRequest(
      "We no longer maintain examiner profile as a means to accept examiner applications",
    );
  } else {
    throw HttpError.notFound("Application or examiner not found");
  }
};

export default resendInterviewRequest;
