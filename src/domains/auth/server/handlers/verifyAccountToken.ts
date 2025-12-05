import { userService, tokenService } from "../services";
import HttpError from "@/utils/httpError";
import ErrorMessages from "@/constants/ErrorMessages";
import { log, error } from "@/utils/logger";
import prisma from "@/lib/db";
import { ExaminerStatus } from "@prisma/client";

export type VerifyAccountTokenInput = {
  token: string;
};

const verifyAccountToken = async (payload: VerifyAccountTokenInput) => {
  try {
    log("Verifying token:", payload.token);

    // Verify token and extract data (could be userId/accountId OR applicationId)
    const tokenData = tokenService.extractUserFromToken(payload.token);
    log("Extracted token data:", tokenData);

    // If applicationId exists, this is a new application flow
    if (tokenData.applicationId) {
      log("Token contains applicationId - verifying application");
      
      // Get examiner application
      const application = await prisma.examinerApplication.findUnique({
        where: {
          id: tokenData.applicationId,
        },
      });

      if (!application) {
        throw HttpError.notFound("Examiner application not found");
      }

      // Check if application is approved
      if (application.status !== ExaminerStatus.ACCEPTED) {
        throw HttpError.badRequest(
          `Application is not approved. Current status: ${application.status}`
        );
      }

      // Check if profile already exists (account already created)
      const existingProfile = await prisma.examinerProfile.findUnique({
        where: {
          applicationId: application.id,
        },
        include: {
          account: {
            include: {
              user: true,
            },
          },
        },
      });

      if (existingProfile) {
        const user = existingProfile.account.user;
        // Check if user already has a password set
        const isValidPasswordHash =
          user.password &&
          user.password.startsWith("$2b$") &&
          user.password.length >= 60;

        if (isValidPasswordHash) {
          log("User already has password set - token already used");
          throw HttpError.unauthorized(
            "Token has already been used. Please log in with your existing password."
          );
        }

        return {
          success: true,
          data: {
            user: {
              ...user,
              accountId: existingProfile.accountId,
            },
            isValid: true,
            applicationId: application.id,
          },
        };
      }

      // Application is approved but profile not created yet - return application data
      return {
        success: true,
        data: {
          application: {
            id: application.id,
            email: application.email,
            firstName: application.firstName,
            lastName: application.lastName,
          },
          isValid: true,
          applicationId: application.id,
        },
      };
    }

    // Legacy flow: userId and accountId (for existing users)
    if (tokenData.userId && tokenData.accountId) {
      log("Token contains userId/accountId - verifying user");
      
      // Check if user exists
      const user = await userService.getUserById(tokenData.userId);
      log("User found:", !!user);

      // Check if user already has a password set (token already used)
      const isValidPasswordHash =
        user.password &&
        user.password.startsWith("$2b$") &&
        user.password.length >= 60;

      if (isValidPasswordHash) {
        log("User already has password set - token already used");
        throw HttpError.unauthorized(
          "Token has already been used. Please log in with your existing password."
        );
      }

      return {
        success: true,
        data: {
          user: {
            ...user,
            accountId: tokenData.accountId,
          },
          isValid: true,
        },
      };
    }

    throw HttpError.unauthorized("Invalid token format");
  } catch (err) {
    error("Token verification error:", err);
    throw HttpError.fromError(
      err,
      ErrorMessages.FAILED_TOKEN_VERIFICATION,
      401
    );
  }
};

export default verifyAccountToken;
