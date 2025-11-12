"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sendMail } from "@/lib/email";
import { generateContractPDF } from "@/lib/pdf-generator";

export async function sendContract(examinerProfileId: string) {
  try {
    // Get examiner details
    const examiner = await prisma.examinerProfile.findUnique({
      where: { id: examinerProfileId },
      include: {
        account: {
          include: {
            user: true,
          },
        },
        feeStructure: {
          where: {
            deletedAt: null,
          },
        },
      },
    });

    if (!examiner) {
      throw new Error("Examiner not found");
    }

    if (!examiner.feeStructure) {
      throw new Error("Fee structure not found. Please add fee structure before sending contract.");
    }

    const feeStructure = examiner.feeStructure[0];
    const examinerName = `${examiner.account.user.firstName} ${examiner.account.user.lastName}`;
    const examinerEmail = examiner.account.user.email;

    // Generate PDF
    console.log("📄 Generating contract PDF...");
    const pdfBuffer = await generateContractPDF(
      examinerName,
      examiner.provinceOfResidence,
      {
        IMEFee: Number(feeStructure.IMEFee),
        recordReviewFee: Number(feeStructure.recordReviewFee),
        hourlyRate: feeStructure.hourlyRate ? Number(feeStructure.hourlyRate) : undefined,
        cancellationFee: Number(feeStructure.cancellationFee),
        paymentTerms: feeStructure.paymentTerms,
      }
    );

    const fileName = `IME_Agreement_${examinerName.replace(/\s+/g, "_")}.pdf`;

    // Send email with PDF attachment
    console.log("📧 Sending contract email with PDF attachment...");

    await sendMail({
      to: examinerEmail,
      subject: "Your Independent Medical Examiner Agreement",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Contract Ready for Review</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center;">
              <img src="${process.env.NEXT_PUBLIC_CDN_URL}/images/thriveLogo.png" alt="Thrive Logo" style="width: 120px;">
            </div>
            
            <div style="margin-top: 20px; font-size: 16px; color: #333333;">
              <p>Hi Dr. ${examinerName},</p>
              
              <p>Your Independent Medical Examiner Agreement is ready for your review. Please find the contract attached to this email as a PDF document.</p>
              
              <div style="background-color: #E8F8F5; border-left: 4px solid #01F4C8; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #00695C; font-weight: 600;">📎 Contract Attached</p>
                <p style="margin: 5px 0 0 0; color: #00695C;">Your personalized contract PDF is attached to this email.</p>
              </div>
              
              <p><strong>What's included in your contract:</strong></p>
              <ul style="background-color: #f9f9f9; padding: 15px 15px 15px 35px; margin: 15px 0; border-radius: 5px;">
                <li>Your fee structure and payment terms</li>
                <li>Service delivery expectations</li>
                <li>Professional obligations and standards</li>
                <li>Confidentiality and privacy requirements</li>
              </ul>
              
              <p style="font-size: 14px; color: #666666;">
                <strong>Note:</strong> Please review the attached PDF carefully. You can save and print the contract for your records. The PDF can be viewed using any standard PDF reader.
              </p>
              
              <p>If you have any questions or concerns about the contract, please don't hesitate to contact us.</p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 14px; color: #777777; text-align: center;">
              <p>If you have any questions or need assistance, feel free to contact us at 
                <a href="mailto:support@thrivenetwork.ca" style="color: #00A8FF;">support@thrivenetwork.ca</a>.
              </p>
              <p style="font-size: 12px; color: #999999; margin-top: 10px;">
                © 2025 Thrive Assessment & Care. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: fileName,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    console.log(`✅ Contract email sent to ${examinerEmail}`);

    // Revalidate the examiner page
    revalidatePath(`/examiner/${examinerProfileId}`);

    return {
      success: true,
      message: "Contract sent successfully",
    };
  } catch (error) {
    console.error("Error sending contract:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send contract",
    };
  }
}

