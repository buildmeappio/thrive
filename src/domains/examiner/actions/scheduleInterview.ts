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
        const htmlTemplate = generateExaminerInterviewScheduledEmail({
          firstName: application.firstName,
          lastName: application.lastName,
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
