"use server";

import prisma from "@/lib/db";
import emailService from "@/server/services/email.service";
import { ENV } from "@/constants/variables";
import { S3Client, GetObjectCommand, S3ClientConfig } from "@aws-sdk/client-s3";
import { S3StreamChunk } from "@/types/api";

const s3Config: S3ClientConfig = {
  region: ENV.AWS_REGION!,
};

// Add credentials if available (for local development)
if (ENV.AWS_ACCESS_KEY_ID && ENV.AWS_SECRET_ACCESS_KEY) {
  s3Config.credentials = {
    accessKeyId: ENV.AWS_ACCESS_KEY_ID,
    secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
  };
}

const s3Client = new S3Client(s3Config);

// Helper function to convert S3 stream to Buffer
async function streamToBuffer(
  body: S3StreamChunk | null | undefined,
): Promise<Buffer> {
  if (!body) {
    throw new Error("S3 response body is empty");
  }

  // If it has transformToByteArray method (AWS SDK v3)
  const bodyWithTransform = body as unknown as {
    transformToByteArray?: () => Promise<Uint8Array>;
  };
  if (typeof bodyWithTransform.transformToByteArray === "function") {
    const bytes = await bodyWithTransform.transformToByteArray();
    return Buffer.from(bytes);
  }

  // If it's a Node.js stream
  const bodyWithOn = body as unknown as {
    on?: (event: string, callback: (chunk: Buffer) => void) => void;
  };
  if (typeof bodyWithOn.on === "function") {
    return await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      (
        body as unknown as {
          on: (event: string, callback: (chunk: Buffer) => void) => void;
        }
      ).on("data", (chunk: Buffer) => chunks.push(chunk));
      (
        body as unknown as {
          on: (event: string, callback: (error: Error) => void) => void;
        }
      ).on("error", reject);
      (
        body as unknown as { on: (event: string, callback: () => void) => void }
      ).on("end", () => resolve(Buffer.concat(chunks)));
    });
  }

  // For ReadableStream (Web Streams API)
  const bodyWithReader = body as unknown as {
    getReader?: () => ReadableStreamDefaultReader<Uint8Array>;
  };
  if (bodyWithReader.getReader) {
    const reader = bodyWithReader.getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    return Buffer.concat(chunks);
  }

  // Fallback: try to read as async iterator
  const chunks: Uint8Array[] = [];
  try {
    for await (const chunk of body as unknown as AsyncIterable<Uint8Array>) {
      chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  } catch {
    // If all methods fail, throw an error
    throw new Error(
      "Unable to convert S3 stream to buffer: unsupported stream type",
    );
  }
}

/**
 * Action called after examiner signs the contract
 * Updates timestamp on application and notifies admin
 * Also sends signed contract PDF to examiner
 */
export const signContractByExaminer = async (
  examinerProfileId: string, // Can be applicationId or examinerProfileId
  examinerEmail: string,
  contractId?: string,
  _signedPdfBase64?: string, // Accept base64 string from client, convert to Buffer on server
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
      examinerProvince =
        application.address?.province ||
        application.provinceOfResidence ||
        "Not specified";
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

      examinerFirstName = capitalizeFirstLetter(
        examinerProfile.account.user.firstName,
      );
      examinerLastName = capitalizeFirstLetter(
        examinerProfile.account.user.lastName,
      );
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
      adminEmail,
    );

    // Send signed contract as PDF attachment to examiner
    let contractPdfBuffer: Buffer | undefined;

    // Prefer using the base64 PDF directly (more reliable than S3 fetch)
    // The base64 PDF is generated client-side and is guaranteed to be valid
    if (_signedPdfBase64) {
      try {
        contractPdfBuffer = Buffer.from(_signedPdfBase64, "base64");

        // Validate PDF (should start with "%PDF")
        if (contractPdfBuffer.length > 4) {
          const pdfHeader = contractPdfBuffer.slice(0, 4).toString("ascii");
          if (pdfHeader !== "%PDF") {
            console.error(
              "❌ Invalid PDF from base64 - header is:",
              pdfHeader,
              "Expected: %PDF",
            );
            // Don't throw, try S3 fallback instead
            contractPdfBuffer = undefined;
          } else {
            console.log(
              "✅ Using provided base64 PDF, size:",
              contractPdfBuffer.length,
              "bytes, header:",
              pdfHeader,
            );
          }
        } else {
          console.error(
            "❌ PDF from base64 too small, size:",
            contractPdfBuffer.length,
          );
          contractPdfBuffer = undefined;
        }
      } catch (base64Error) {
        console.error("❌ Error converting base64 PDF:", base64Error);
        contractPdfBuffer = undefined;
      }
    }

    // Fallback: Try fetching from S3 if base64 PDF is not available or invalid
    if (!contractPdfBuffer && contractId) {
      try {
        // Wait a bit for S3 upload to complete
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const contract = await prisma.contract.findUnique({
          where: { id: contractId },
        });

        if (contract?.signedPdfS3Key) {
          const s3Key = contract.signedPdfS3Key;

          const getObjectCommand = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: s3Key,
          });

          const s3Response = await s3Client.send(getObjectCommand);
          if (s3Response.Body) {
            try {
              // Convert S3 stream to buffer using helper function
              const s3Buffer = await streamToBuffer(s3Response.Body);

              // Validate PDF (should start with "%PDF")
              if (s3Buffer.length > 4) {
                const pdfHeader = s3Buffer.slice(0, 4).toString("ascii");
                if (pdfHeader === "%PDF") {
                  contractPdfBuffer = s3Buffer;
                  console.log(
                    "✅ Contract PDF fetched from S3, size:",
                    contractPdfBuffer.length,
                    "bytes, header:",
                    pdfHeader,
                  );
                } else {
                  console.error(
                    "❌ Invalid PDF file in S3 - header is:",
                    pdfHeader,
                    "Expected: %PDF",
                  );
                  console.warn(
                    "⚠️ S3 file appears to be corrupted or wrong format, skipping S3 fallback",
                  );
                }
              } else {
                console.error(
                  "❌ PDF file in S3 too small, size:",
                  s3Buffer.length,
                );
              }
            } catch (bufferError) {
              console.error(
                "❌ Error converting S3 stream to buffer:",
                bufferError,
              );
            }
          } else {
            console.warn("⚠️ S3 response body is empty for key:", s3Key);
          }
        } else {
          console.warn(
            "⚠️ Contract signedPdfS3Key not found for contractId:",
            contractId,
          );
        }
      } catch (s3Error) {
        console.error("❌ Error fetching contract PDF from S3:", s3Error);
      }
    }

    // Send email to examiner with signed contract PDF attachment
    try {
      console.log("Sending contract email to examiner:", examinerEmail);

      const attachments = contractPdfBuffer
        ? [
            {
              filename: `Thrive-Contract-Signed-${contractId || "contract"}.pdf`,
              content: contractPdfBuffer,
              contentType: "application/pdf" as const,
            },
          ]
        : undefined;

      const emailResult = await emailService.sendEmail(
        "Your Signed Contract - Thrive Medical Examiner",
        "examiner-contract-signed.html",
        {
          firstName: examinerFirstName,
          lastName: examinerLastName,
        },
        examinerEmail,
        attachments,
      );

      if (emailResult.success) {
        console.log(
          `✅ Contract email sent successfully to examiner${contractPdfBuffer ? " with PDF attachment" : " (without attachment)"}`,
        );
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
      message:
        error instanceof Error
          ? error.message
          : "Failed to update contract signature status",
    };
  }
};
