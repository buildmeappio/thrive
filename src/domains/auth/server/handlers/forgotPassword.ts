"use server";

import authService from "@/domains/auth/server/auth.service";
import { signAccountToken } from "@/lib/jwt";
import { ENV } from "@/constants/variables";
import logger from "@/utils/logger";

type ForgotPasswordData = {
  email: string;
};

export const forgotPassword = async (data: ForgotPasswordData): Promise<{ success: boolean; message: string; userExists?: boolean }> => {
  try {
    // Check if user exists
    const user = await authService.getUserWithRoleByEmail(data.email);

    // Check if user exists and has admin role
    if (!user) {
      logger.log(`Password reset requested for non-existent email: ${data.email}`);
      return {
        success: false,
        message: "If an account with that email exists, we've sent password reset instructions.",
        userExists: false,
      };
    }

    // Check if user has an admin role
    const isAdminRole = user.accounts && user.accounts.length > 0;
    if (!isAdminRole) {
      logger.log(`Password reset requested for non-admin email: ${data.email}`);
      return {
        success: false,
        message: "If an account with that email exists, we've sent password reset instructions.",
        userExists: false,
      };
    }

    // Get account and role information
    const account = user.accounts[0];
    const userId = user.id;
    const accountId = account.id;
    const roleName = account.role?.name;

    logger.log(`Generating password reset token for user: ${user.email}, userId: ${userId}, accountId: ${accountId}, role: ${roleName}`);

    // Generate password reset token with userId, accountId, role, and updatedAt timestamp (expires in 1 hour)
    // The updatedAt timestamp ensures token becomes invalid once password is changed
    const token = signAccountToken(
      {
        email: user.email,
        id: userId,
        userId: userId,
        accountId: accountId,
        adminId: accountId, // alias for accountId
        role: roleName,
        purpose: "password-reset",
        updatedAt: user.updatedAt.getTime(), // Timestamp when token was issued
      },
      "1h"
    );

    // Create reset link with /admin prefix
    const resetLink = `${ENV.NEXT_PUBLIC_APP_URL}/admin/password/reset?token=${token}`;

    // Send email using dynamic import to avoid bundling server-only modules in client
    let emailSent = false;
    let lastError: any = null;

    try {
      const { sendMail } = await import("@/lib/email");
      await sendMail({
        to: user.email,
        subject: "Reset Your Password - Thrive Admin",
        html: generatePasswordResetEmail({
          firstName: user.firstName || "there",
          resetLink,
        }),
      });
      emailSent = true;
      logger.log(`✅ Password reset email sent to ${data.email} (via sendMail)`);
    } catch (emailError) {
      console.error("Primary email method failed:", emailError);
      lastError = emailError;
      
      // Fallback to emailService if sendMail fails
      try {
        logger.log("Trying emailService fallback...");
        const emailService = (await import("@/services/email.service")).default;
        const result = await emailService.sendEmail(
          "Reset Your Password - Thrive Admin",
          "admin-password-reset.html",
          {
            firstName: user.firstName || "there",
            resetLink,
            CDN_URL: ENV.NEXT_PUBLIC_CDN_URL || "",
          },
          user.email
        );
        
        if (result.success) {
          emailSent = true;
          logger.log(`✅ Password reset email sent to ${data.email} (via emailService)`);
        } else {
          const errorMsg = (result as { success: false; error: string }).error;
          console.error("EmailService also failed:", errorMsg);
          lastError = new Error(errorMsg || "Email service failed");
        }
      } catch (fallbackError) {
        console.error("Fallback email method also failed:", fallbackError);
        lastError = fallbackError;
      }
    }

    if (!emailSent) {
      console.error(`❌ Failed to send password reset email to ${data.email}:`, lastError);
      // Still return success to prevent email enumeration, but log the error
    }

    return {
      success: true,
      message: "If an account with that email exists, we've sent password reset instructions.",
      userExists: true,
    };
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    // Return error with userExists false for unknown errors
    return {
      success: false,
      message: "If an account with that email exists, we've sent password reset instructions.",
      userExists: false,
    };
  }
};

// Generate HTML email content
function generatePasswordResetEmail({
  firstName,
  resetLink,
}: {
  firstName: string;
  resetLink: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Your Password - Thrive Admin</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
      .header {
        text-align: center;
      }
      .header img {
        width: 120px;
      }
      .body {
        margin-top: 20px;
        font-size: 16px;
        color: #333333;
      }
      .body p {
        margin-bottom: 20px;
        line-height: 1.6;
      }
      .button-container {
        text-align: center;
        margin: 30px 0;
      }
      .button {
        display: inline-block;
        padding: 14px 32px;
        background: linear-gradient(90deg, #00A8FF 0%, #01F4C8 100%);
        color: #ffffff;
        text-decoration: none;
        border-radius: 50px;
        font-weight: 600;
        font-size: 16px;
      }
      .footer {
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #e0e0e0;
        font-size: 14px;
        color: #777777;
        text-align: center;
      }
      .note {
        margin-top: 20px;
        padding: 15px;
        background-color: #f9f9f9;
        border-left: 4px solid #00A8FF;
        font-size: 14px;
        color: #555555;
      }
      .footer a {
        color: #00A8FF;
        text-decoration: none;
      }
      .footer a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img
          src="${ENV.NEXT_PUBLIC_CDN_URL}/images/thriveLogo.png"
          alt="Thrive Logo" />
      </div>
      <div class="body">
        <p>Hi ${firstName},</p>
        <p>
          We received a request to reset your password for your Thrive Admin
          account. If you made this request, click the button below to
          set a new password:
        </p>
        <div class="button-container">
          <a href="${resetLink}" class="button">Reset Your Password</a>
        </div>
        <div class="note">
          <strong>Note:</strong> This password reset link will expire in 1 hour
          for security reasons. If you didn't request a password reset, you can
          safely ignore this email.
        </div>
      </div>
      <div class="footer">
        <p>
          If you have any questions or need assistance, feel free to contact us
          at
          <a href="mailto:support@thrivenetwork.ca">support@thrivenetwork.ca</a>.
        </p>
        <p>© 2025 Thrive Assessment & Care. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
  `;
}

