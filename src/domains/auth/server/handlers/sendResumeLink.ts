import prisma from "@/lib/db";
import HttpError from "@/utils/httpError";
import { emailService } from "@/server";
import { signResumeToken } from "@/lib/jwt";
import { ENV } from "@/constants/variables";
import ErrorMessages from "@/constants/ErrorMessages";

export type SendResumeLinkInput = {
  email: string;
  applicationId: string;
  firstName?: string;
  lastName?: string;
};

const sendResumeLink = async (payload: SendResumeLinkInput) => {
  try {
    if (!payload.email || !payload.applicationId) {
      throw HttpError.badRequest("Email and applicationId are required");
    }

    // Verify application exists and belongs to this email
    const application = await prisma.examinerApplication.findUnique({
      where: {
        id: payload.applicationId,
      },
    });

    if (!application) {
      throw HttpError.notFound("Application not found");
    }

    if (application.email !== payload.email) {
      throw HttpError.forbidden("Application does not belong to this email");
    }

    // Generate resume token
    const token = signResumeToken({
      email: payload.email,
      applicationId: payload.applicationId,
    });

    // Create resume link
    const baseUrl = ENV.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
    const resumeLink = `${baseUrl}/examiner/resume-application?token=${token}`;

    // Get name from payload or application
    const firstName = payload.firstName || application.firstName || "";
    const lastName = payload.lastName || application.lastName || "";

    // Send email
    await emailService.sendEmail(
      "Your Thrive Application Has Been Saved",
      "application-resume-link.html",
      {
        firstName,
        lastName,
        resumeLink,
      },
      payload.email
    );

    return {
      success: true,
      message: "Resume link sent successfully",
    };
  } catch (error) {
    throw HttpError.fromError(error, ErrorMessages.REGISTRATION_FAILED, 500);
  }
};

export default sendResumeLink;
