"use server";

import prisma from "@/lib/db";
import { HttpError } from "@/utils/httpError";
import logger from "@/utils/logger";
import { sendMail } from "@/lib/email";

/**
 * Called when examiner signs the contract (from examiner portal)
 * Updates contractSignedByExaminerAt timestamp and sends notification to admin
 */
export async function signContractByExaminer(examinerProfileId: string, _examinerEmail?: string) {
  try {
    // Update the examiner profile with contract signed timestamp
    const examiner = await prisma.examinerProfile.update({
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
      },
    });

    const examinerName = `${examiner.account.user.firstName} ${examiner.account.user.lastName}`;

    // Send email notification to admin
    const adminEmail = process.env.ADMIN_EMAIL || "admin@thrivenetwork.ca";
    const reviewLink = `${process.env.NEXT_PUBLIC_APP_URL}/examiner/${examinerProfileId}`;

    await sendMail({
      to: adminEmail,
      subject: `Contract Signed - ${examinerName}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Contract Signed Notification</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center;">
              <img src="${process.env.NEXT_PUBLIC_CDN_URL}/images/thriveLogo.png" alt="Thrive Logo" style="width: 120px;">
            </div>
            
            <div style="margin-top: 20px; font-size: 16px; color: #333333;">
              <h2 style="color: #00A8FF;">Contract Signed</h2>
              
              <p>Dr. <strong>${examinerName}</strong> has signed their Independent Medical Examiner Agreement.</p>
              
              <div style="background-color: #E8F8F5; border-left: 4px solid #01F4C8; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #00695C; font-weight: 600;">✅ Action Required</p>
                <p style="margin: 5px 0 0 0; color: #00695C;">Please review the signed contract and confirm to complete the approval process.</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${reviewLink}" style="display: inline-block; background: linear-gradient(to right, #00A8FF, #01F4C8); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: 600;">
                  Review Contract
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666666;">
                Click the button above to review the signed contract and confirm the signature.
              </p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 14px; color: #777777; text-align: center;">
              <p>© 2025 Thrive Assessment & Care. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    logger.log(`✅ Contract signed by examiner and admin notified`);

    return {
      success: true,
      message: "Contract signed successfully",
    };
  } catch (error) {
    logger.error("Error recording contract signature:", error);
    throw HttpError.fromError(error, "Failed to record contract signature");
  }
}

export default signContractByExaminer;

