"use server";

import prisma from "@/lib/db";
import { ExaminerStatus } from "@prisma/client";
import emailService from "@/server/services/email.service";
import { ENV } from "@/constants/variables";
import { UserStatus } from "@/domains/auth/constants/userStatus";

/**
 * Action called when examiner declines the contract
 * Updates status to REJECTED and notifies admin
 */
export const declineContractByExaminer = async (
  examinerProfileId: string, // Can be applicationId or examinerProfileId
  examinerEmail: string,
  declineReason: string,
) => {
  try {
    // Check if this is an applicationId or examinerProfileId
    // First try to find as application
    let application = await prisma.examinerApplication.findUnique({
      where: { id: examinerProfileId },
      include: {
        address: true,
      },
    });

    let examinerName = "";
    let examinerProvince = "";
    let adminReviewUrl = "";

    if (application) {
      // Update contractDeclinedByExaminerAt on application
      application = await prisma.examinerApplication.update({
        where: { id: examinerProfileId },
        data: {
          contractDeclinedByExaminerAt: new Date(),
          contractDeclineReason: declineReason,
          status: ExaminerStatus.REJECTED,
        },
        include: {
          address: true,
        },
      });

      // Get examiner details for email
      const capitalizeFirstLetter = (str: string) => {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      };

      const firstName = capitalizeFirstLetter(application.firstName || "");
      const lastName = capitalizeFirstLetter(application.lastName || "");
      examinerName = `Dr. ${firstName} ${lastName}`;
      examinerProvince =
        application.address?.province ||
        application.provinceOfResidence ||
        "Not specified";
      adminReviewUrl = `${ENV.NEXT_PUBLIC_APP_URL}/admin/examiner/${examinerProfileId}`;
    } else {
      // Fallback: try as examinerProfileId (for backward compatibility)
      const examinerProfile = await prisma.examinerProfile.findUnique({
        where: { id: examinerProfileId },
        include: {
          account: {
            include: {
              user: true,
            },
          },
          address: true,
        },
      });

      if (!examinerProfile) {
        throw new Error("Examiner profile not found");
      }

      // Update examiner profile contract fields
      await prisma.examinerProfile.update({
        where: { id: examinerProfileId },
        data: {
          contractDeclinedByExaminerAt: new Date(),
          contractDeclineReason: declineReason,
        },
      });

      // Update user status
      await prisma.user.update({
        where: { id: examinerProfile.account.userId },
        data: {
          status: UserStatus.REJECTED,
        },
      });

      const capitalizeFirstLetter = (str: string) => {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      };

      const firstName = capitalizeFirstLetter(
        examinerProfile.account.user.firstName,
      );
      const lastName = capitalizeFirstLetter(
        examinerProfile.account.user.lastName,
      );
      examinerName = `Dr. ${firstName} ${lastName}`;
      examinerProvince = examinerProfile.address?.province || "Not specified";
      adminReviewUrl = `${ENV.NEXT_PUBLIC_APP_URL}/admin/examiner/${examinerProfileId}`;
    }

    // Admin email address
    const adminEmail = ENV.ADMIN_NOTIFICATION_EMAIL || "admin@thrivenetwork.ca";

    // Send notification email to admin
    await emailService.sendEmail(
      `Contract Declined - ${examinerName}`,
      "admin-contract-declined.html",
      {
        examinerName,
        examinerEmail,
        examinerProvince,
        declineReason,
        reviewUrl: adminReviewUrl,
      },
      adminEmail,
    );

    return {
      success: true,
      message: "Contract declined successfully",
    };
  } catch (error: unknown) {
    console.error("Error in declineContractByExaminer:", error);
    return {
      success: false,
      message:
        (error instanceof Error ? error.message : undefined) ||
        "Failed to decline contract",
    };
  }
};
