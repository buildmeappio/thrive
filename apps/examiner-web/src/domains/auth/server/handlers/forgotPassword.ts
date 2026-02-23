import HttpError from "@/utils/httpError";
import { Roles } from "../../constants/roles";
import { tokenService, userService } from "../services";
import emailService from "@/server/services/email.service";
import { ENV } from "@/constants/variables";
import prisma from "@/lib/db";
import { log, error } from "@/utils/logger";

export type ForgotPasswordInput = {
  email: string;
};

const forgotPassword = async (payload: ForgotPasswordInput) => {
  // Use the same email lookup as login (no normalization, exact match)
  // This ensures consistency with how login works
  const email = payload.email.trim();

  log(`[ForgotPassword] Looking for user with email: ${email}`);

  let user;
  try {
    // Use the same method as login to find user
    user = await userService.getUserWithAccounts(email);

    // Filter to only medical examiner accounts
    const examinerAccounts = user.accounts.filter(
      (account) => account.role.name === Roles.MEDICAL_EXAMINER,
    );

    if (examinerAccounts.length === 0) {
      log(
        `[ForgotPassword] User found but no medical examiner account for: ${email}`,
      );
      log(
        `[ForgotPassword] User has ${
          user.accounts.length
        } account(s) with roles: ${user.accounts
          .map((acc) => acc.role.name)
          .join(", ")}`,
      );
      // For security, don't reveal if email exists or not
      return {
        success: true,
        message:
          "If an account with that email exists, we've sent a password reset link",
      };
    }

    log(
      `[ForgotPassword] User found: ${user.id}, email in DB: ${user.email}, sending email to: ${user.email}`,
    );
  } catch {
    // User not found - same behavior as login
    error(`[ForgotPassword] User not found for: ${email}`);
    // For security, don't reveal if email exists or not
    return {
      success: true,
      message:
        "If an account with that email exists, we've sent a password reset link",
    };
  }

  const account =
    user.accounts.find((acc) => acc.role.name === Roles.MEDICAL_EXAMINER) ||
    user.accounts[0];

  // Get examiner profile ID from the account
  // We need to query it separately since getUserWithAccounts only selects activationStep
  const examinerProfile = await prisma.examinerProfile.findFirst({
    where: {
      accountId: account.id,
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });

  if (!examinerProfile) {
    log(
      `[ForgotPassword] No examiner profile found for account: ${account.id}`,
    );
    return {
      success: true,
      message:
        "If an account with that email exists, we've sent a password reset link",
    };
  }

  // Generate password reset token with examinerId, userId, and role (using SET_PASSWORD_SECRET)
  const resetToken = tokenService.generatePasswordToken({
    email: user.email,
    id: user.id, // userId
    accountId: account.id,
    role: account.role.name,
    examinerId: examinerProfile.id, // examinerProfileId
  });

  // Create reset link (basePath /examiner should be included in the URL)
  const baseUrl = ENV.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  const resetLink = `${baseUrl}/examiner/password/reset?token=${resetToken}`;

  // Send email using the existing email service
  try {
    log(`[ForgotPassword] Attempting to send email to: ${user.email}`);
    const result = await emailService.sendEmail(
      "Reset Your Password - Thrive Examiner",
      "password-reset.html",
      {
        resetLink,
      },
      user.email,
    );

    if (!result.success) {
      error(`[ForgotPassword] Email service returned error: ${result.error}`);
      throw new Error(result.error);
    }

    log(`[ForgotPassword] ✅ Email sent successfully to: ${user.email}`);
  } catch (err) {
    error(
      `[ForgotPassword] ❌ Error sending password reset email to ${user.email}:`,
      err,
    );
    // Log the full error details
    if (error instanceof Error) {
      error(`[ForgotPassword] Error message: ${error.message}`);
      error(`[ForgotPassword] Error stack: ${error.stack}`);
    }
    throw HttpError.internalServerError(
      "Failed to send password reset email. Please try again later.",
    );
  }

  return {
    success: true,
    message:
      "If an account with that email exists, we've sent a password reset link",
  };
};

export default forgotPassword;
