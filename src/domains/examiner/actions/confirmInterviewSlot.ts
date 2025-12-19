"use server";

import { getCurrentUser } from "@/domains/auth/server/session";
import applicationService from "../server/application.service";
import interviewSlotService from "../server/interviewSlot.service";
import { sendMail } from "@/lib/email";
import { HttpError } from "@/utils/httpError";
import logger from "@/utils/logger";
import {
  generateExaminerInterviewConfirmedEmail,
  EXAMINER_INTERVIEW_CONFIRMED_SUBJECT,
} from "@/emails/examiner-status-updates";
import { checkEntityType } from "../utils/checkEntityType";

const confirmInterviewSlot = async (
  slotId: string,
  applicationId: string,
): Promise<{ success: boolean; error?: string }> => {
  const user = await getCurrentUser();
  if (!user) {
    throw HttpError.unauthorized(
      "You must be logged in to confirm interview slot",
    );
  }

  try {
    // Verify it's an application
    const entityType = await checkEntityType(applicationId);
    if (entityType !== "application") {
      throw HttpError.badRequest("Can only confirm slots for applications");
    }

    // Get application to verify it exists and get examiner details
    const application =
      await applicationService.getApplicationById(applicationId);
    if (!application) {
      throw HttpError.notFound("Application not found");
    }

    // Confirm the requested slot
    const confirmedSlot =
      await interviewSlotService.confirmRequestedInterviewSlot(
        slotId,
        applicationId,
      );

    // Send confirmation email to examiner
    try {
      if (application.email && application.firstName && application.lastName) {
        // Format date and time
        const interviewDate = new Date(
          confirmedSlot.startTime,
        ).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        const interviewTime = `${new Date(
          confirmedSlot.startTime,
        ).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })} - ${new Date(confirmedSlot.endTime).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}`;

        const htmlTemplate = generateExaminerInterviewConfirmedEmail({
          firstName: application.firstName,
          lastName: application.lastName,
          interviewDate,
          interviewTime,
          duration: String(confirmedSlot.duration),
        });

        await sendMail({
          to: application.email,
          subject: EXAMINER_INTERVIEW_CONFIRMED_SUBJECT,
          html: htmlTemplate,
        });

        logger.log(
          `✅ Interview confirmation email sent to ${application.email} for slot ${slotId}`,
        );
      }
    } catch (emailError) {
      logger.error("Failed to send interview confirmation email:", emailError);
      // Don't throw - the slot is already confirmed, email failure shouldn't fail the operation
    }

    return { success: true };
  } catch (error) {
    logger.error("Failed to confirm interview slot:", error);
    if (error instanceof HttpError) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to confirm interview slot",
    };
  }
};

export default confirmInterviewSlot;
