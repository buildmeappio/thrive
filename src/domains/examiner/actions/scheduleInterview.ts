"use server";

import { getCurrentUser } from "@/domains/auth/server/session";
import applicationService from "../server/application.service";
import { sendMail } from "@/lib/email";
import { HttpError } from "@/utils/httpError";
import logger from "@/utils/logger";
import {
  generateExaminerInterviewScheduledEmail,
  EXAMINER_INTERVIEW_SCHEDULED_SUBJECT,
} from "@/emails/examiner-status-updates";
import { checkEntityType } from "../utils/checkEntityType";
import { signExaminerScheduleInterviewToken } from "@/lib/jwt";

const scheduleInterview = async (id: string) => {
  const user = await getCurrentUser();
  if (!user) {
    throw HttpError.unauthorized("You must be logged in to schedule interview");
  }

  // Check if it's an application or examiner
  const entityType = await checkEntityType(id);

  if (entityType === "application") {
    const application = await applicationService.scheduleApplicationInterview(
      id
    );

    // Send notification email to applicant
    try {
      if (application.email && application.firstName && application.lastName) {
        // Generate JWT token for interview scheduling link
        const jwtToken = signExaminerScheduleInterviewToken({
          email: application.email,
          applicationId: application.id,
        });

        // Create scheduling link
        const scheduleInterviewLink = `${process.env.NEXT_PUBLIC_APP_URL}/examiner/schedule-interview?token=${jwtToken}`;

        // Store the link in database using ApplicationSecureLink
        await applicationService.createInterviewSchedulingLink({
          applicationId: application.id,
          expiresInDays: 30,
          token: jwtToken,
        });

        const htmlTemplate = generateExaminerInterviewScheduledEmail({
          firstName: application.firstName,
          lastName: application.lastName,
          scheduleInterviewLink,
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
  } else if (entityType === "examiner") {
    throw HttpError.badRequest(
      "We no longer maintain examiner profile as a means to accept examiner applications"
    );
  } else {
    throw HttpError.notFound("Application or examiner not found");
  }
};

export default scheduleInterview;
