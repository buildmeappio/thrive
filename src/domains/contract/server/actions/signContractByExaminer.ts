"use server";

import prisma from "@/lib/db";
import emailService from "@/server/services/email.service";
import { ENV } from "@/constants/variables";

/**
 * Action called after examiner signs the contract
 * Updates timestamp and notifies admin
 */
export const signContractByExaminer = async (
  examinerProfileId: string,
  examinerEmail: string
) => {
  try {
    // 1. Update contractSignedByExaminerAt timestamp
    const examinerProfile = await prisma.examinerProfile.update({
      where: { id: examinerProfileId },
      data: {
        contractSignedByExaminerAt: new Date(),
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
    const examinerName = `Dr. ${examinerProfile.account.user.firstName} ${examinerProfile.account.user.lastName}`;
    const examinerProvince = examinerProfile.address?.province || "Not specified";

    // 3. Admin email address
    const adminEmail = ENV.ADMIN_NOTIFICATION_EMAIL || "admin@thrivenetwork.ca";

    // 4. Admin review URL
    const adminReviewUrl = `${ENV.NEXT_PUBLIC_APP_URL}/admin/examiner/${examinerProfileId}`;

    // 5. Send notification email to admin
    await emailService.sendEmail(
      `Contract Signed - ${examinerName}`,
      "admin-contract-signed.html",
      {
        examinerName,
        examinerEmail,
        examinerProvince,
        reviewUrl: adminReviewUrl,
      },
      adminEmail
    );

    return {
      success: true,
      message: "Contract signed successfully and admin notified",
    };
  } catch (error: any) {
    console.error("Error in signContractByExaminer:", error);
    return {
      success: false,
      message: error?.message || "Failed to update contract signature status",
    };
  }
};

