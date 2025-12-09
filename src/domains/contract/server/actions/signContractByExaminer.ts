"use server";

import prisma from "@/lib/db";
import emailService from "@/server/services/email.service";
import { ENV } from "@/constants/variables";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { convertHtmlToPdf } from "../utils/htmlToPdf";
import { S3StreamChunk } from "@/types/api";

/**
 * Action called after examiner signs the contract
 * Updates timestamp on application and notifies admin
 * Also sends signed contract PDF to examiner
 */
export const signContractByExaminer = async (
  examinerProfileId: string, // Can be applicationId or examinerProfileId
  examinerEmail: string,
  contractId?: string,
  _signedPdfBase64?: string // Accept base64 string from client, convert to Buffer on server
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
    let examinerFirstName = "";
    let examinerLastName = "";
    let examinerProvince = "";
    let adminReviewUrl = "";

    if (application) {
      // Update contractSignedByExaminerAt on application
      application = await prisma.examinerApplication.update({
        where: { id: examinerProfileId },
        data: {
          contractSignedByExaminerAt: new Date(),
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
      
      examinerFirstName = capitalizeFirstLetter(application.firstName || "");
      examinerLastName = capitalizeFirstLetter(application.lastName || "");
      examinerName = `Dr. ${examinerFirstName} ${examinerLastName}`;
      examinerProvince = application.address?.province || application.provinceOfResidence || "Not specified";
      adminReviewUrl = `${ENV.NEXT_PUBLIC_APP_URL}/admin/examiner/${examinerProfileId}`;
    } else {
      // Fallback: try as examinerProfileId (for backward compatibility)
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

      const capitalizeFirstLetter = (str: string) => {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      };
      
      examinerFirstName = capitalizeFirstLetter(examinerProfile.account.user.firstName);
      examinerLastName = capitalizeFirstLetter(examinerProfile.account.user.lastName);
      examinerName = `Dr. ${examinerFirstName} ${examinerLastName}`;
      examinerProvince = examinerProfile.address?.province || "Not specified";
      adminReviewUrl = `${ENV.NEXT_PUBLIC_APP_URL}/admin/examiner/${examinerProfileId}`;
    }

    // Admin email address
    const adminEmail = ENV.ADMIN_NOTIFICATION_EMAIL || "admin@thrivenetwork.ca";

    // Send notification email to admin
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

    // Send signed contract as PDF attachment to examiner
    let contractPdfBuffer: Buffer | undefined;
    
    // Fetch the signed contract HTML from S3 and convert to PDF
    if (contractId) {
      try {
        // Wait a bit for S3 upload to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const contract = await prisma.contract.findUnique({
          where: { id: contractId },
          select: { signedHtmlS3Key: true },
        });

        if (contract?.signedHtmlS3Key) {
          const s3Key = contract.signedHtmlS3Key;
          const s3Client = new S3Client({
            region: process.env.AWS_REGION,
          });

          const getObjectCommand = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: s3Key,
          });

import { S3StreamChunk } from "@/types/api";

          const s3Response = await s3Client.send(getObjectCommand);
          if (s3Response.Body) {
            const chunks: Uint8Array[] = [];
            for await (const chunk of s3Response.Body as S3StreamChunk) {
              chunks.push(chunk);
            }
            const fileBuffer = Buffer.concat(chunks);
            
            // Check if file is already PDF or HTML
            const isPdf = s3Key.endsWith('.pdf');
            const isHtml = s3Key.endsWith('.html');
            
            if (isPdf) {
              // Already PDF, use as is
              contractPdfBuffer = fileBuffer;
              console.log("✅ Contract PDF fetched from S3, size:", contractPdfBuffer.length);
            } else if (isHtml) {
              // Convert HTML to PDF
              console.log("📄 Converting HTML contract to PDF...");
              const htmlContent = fileBuffer.toString('utf-8');
              contractPdfBuffer = await convertHtmlToPdf(htmlContent);
              console.log("✅ Contract HTML converted to PDF, size:", contractPdfBuffer.length);
            } else {
              // Try to parse as HTML
              try {
                const htmlContent = fileBuffer.toString('utf-8');
                contractPdfBuffer = await convertHtmlToPdf(htmlContent);
                console.log("✅ Contract converted to PDF, size:", contractPdfBuffer.length);
              } catch (convertError) {
                console.error("❌ Error converting contract to PDF:", convertError);
              }
            }
          } else {
            console.warn("⚠️ S3 response body is empty for key:", s3Key);
          }
        } else {
          console.warn("⚠️ Contract signedHtmlS3Key not found for contractId:", contractId);
        }
      } catch (s3Error) {
        console.error("❌ Error fetching contract from S3:", s3Error);
        // Continue without attachment if fetch fails
      }
    }

    // Send email to examiner with signed contract PDF attachment
    try {
      console.log("Sending contract email to examiner:", examinerEmail);
      
      const attachments = contractPdfBuffer ? [
        {
          filename: `Thrive-Contract-Signed-${contractId || "contract"}.pdf`,
          content: contractPdfBuffer,
          contentType: "application/pdf" as const,
        },
      ] : undefined;

      const emailResult = await emailService.sendEmail(
        "Your Signed Contract - Thrive Medical Examiner",
        "examiner-contract-signed.html",
        {
          firstName: examinerFirstName,
          lastName: examinerLastName,
        },
        examinerEmail,
        attachments
      );
      
      if (emailResult.success) {
        console.log(`✅ Contract email sent successfully to examiner${contractPdfBuffer ? " with PDF attachment" : " (without attachment)"}`);
      } else {
        console.error("❌ Failed to send contract email:", emailResult.error);
      }
    } catch (emailError) {
      console.error("❌ Error sending contract email to examiner:", emailError);
      // Don't fail the whole operation if email fails
    }

    return {
      success: true,
      message: "Contract signed successfully and admin notified",
    };
  } catch (error: unknown) {
    console.error("Error in signContractByExaminer:", error);
    return {
      success: false,
      message: error?.message || "Failed to update contract signature status",
    };
  }
};

