"use server";

import prisma from "@/lib/db";
import { ExaminerStatus } from "@prisma/client";
import emailService from "@/server/services/email.service";
import { ENV } from "@/constants/variables";

/**
 * Action called when examiner declines the contract
 * Updates status to REJECTED and notifies admin
 */
export const declineContractByExaminer = async (
  examinerProfileId: string,
  examinerEmail: string,
  declineReason: string
) => {
  try {
    // 1. Update examiner profile with decline timestamp, reason, and status
    const examinerProfile = await prisma.examinerProfile.update({
      where: { id: examinerProfileId },
      data: {
        contractDeclinedByExaminerAt: new Date(),
        contractDeclineReason: declineReason,
        status: ExaminerStatus.REJECTED,
      },
      include: {
        account: {
          include: {
            user: true,
          },
        },
        address: true,
      },
    });

    // 2. Get examiner details for email
    // Capitalize first letter of names
    const capitalizeFirstLetter = (str: string) => {
      if (!str) return str;
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };
    
    const firstName = capitalizeFirstLetter(examinerProfile.account.user.firstName);
    const lastName = capitalizeFirstLetter(examinerProfile.account.user.lastName);
    const examinerName = `Dr. ${firstName} ${lastName}`;
    const examinerProvince = examinerProfile.address?.province || "Not specified";

    // 3. Admin email address
    const adminEmail = ENV.ADMIN_NOTIFICATION_EMAIL || "admin@thrivenetwork.ca";

    // 4. Admin review URL
    const adminReviewUrl = `${ENV.NEXT_PUBLIC_APP_URL}/admin/examiner/${examinerProfileId}`;

    // 5. Send notification email to admin
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
      adminEmail
    );

    return {
      success: true,
      message: "Contract declined successfully",
    };
  } catch (error: any) {
    console.error("Error in declineContractByExaminer:", error);
    return {
      success: false,
      message: error?.message || "Failed to decline contract",
    };
  }
};

