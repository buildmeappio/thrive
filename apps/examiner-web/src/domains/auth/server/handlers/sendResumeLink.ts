import prisma from "@/lib/db";
import HttpError from "@/utils/httpError";
import { emailService } from "@/server";
import { ENV } from "@/constants/variables";
import ErrorMessages from "@/constants/ErrorMessages";
import { SecureLinkStatus } from "@thrive/database";

export type SendResumeLinkInput = {
  email: string;
  applicationId: string;
  firstName?: string;
  lastName?: string;
  token?: string; // Optional: token from saveApplicationProgress
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

    // Get the token - either from payload or fetch the latest PENDING secure link
    let token = payload.token;

    if (!token) {
      // Fetch the latest PENDING secure link for this application
      const applicationSecureLink =
        await prisma.applicationSecureLink.findFirst({
          where: {
            applicationId: payload.applicationId,
          },
          include: {
            secureLink: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

      if (
        !applicationSecureLink ||
        applicationSecureLink.secureLink.status !== SecureLinkStatus.PENDING
      ) {
        throw HttpError.badRequest(
          "No valid secure link found for this application",
        );
      }

      token = applicationSecureLink.secureLink.token;
    }

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
      payload.email,
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
