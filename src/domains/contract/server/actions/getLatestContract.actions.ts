import prisma from "@/lib/db";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { S3StreamChunk } from "@/types/api";
import s3Client from "@/lib/s3-client";
import { ENV } from "@/constants/variables";
import { processContractVariables } from "../utils/processContractVariables";
import { formatFullName } from "@/utils/text";

async function streamToString(
  body: S3StreamChunk | null | undefined,
): Promise<string> {
  if (!body) return "";

  // Check if it has transformToString method (AWS SDK v3)
  if (
    typeof (body as { transformToString?: () => Promise<string> })
      .transformToString === "function"
  ) {
    return await (
      body as { transformToString: () => Promise<string> }
    ).transformToString();
  }

  // If it's a Node.js stream
  if (
    typeof (
      body as {
        on?: (event: string, callback: (chunk: Buffer) => void) => void;
      }
    ).on === "function"
  ) {
    return await new Promise<string>((resolve, reject) => {
      const chunks: Buffer[] = [];
      (
        body as {
          on: (event: string, callback: (chunk: Buffer) => void) => void;
        }
      ).on("data", (chunk: Buffer) => chunks.push(chunk));
      (
        body as {
          on: (event: string, callback: (error: Error) => void) => void;
        }
      ).on("error", reject);
      (body as { on: (event: string, callback: () => void) => void }).on(
        "end",
        () => resolve(Buffer.concat(chunks).toString("utf-8")),
      );
    });
  }

  // Fallback: try to convert Uint8Array or Buffer to string
  if (body instanceof Uint8Array || Buffer.isBuffer(body)) {
    return Buffer.from(body).toString("utf-8");
  }

  return "";
}

export async function getLatestContract(id: string) {
  try {
    // Fetch contract from database
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        examinerProfile: {
          include: {
            account: {
              include: {
                user: true,
              },
            },
            address: true,
          },
        },
        application: {
          include: {
            address: true,
          },
        },
        templateVersion: {
          select: {
            headerConfig: true,
            footerConfig: true,
            bodyHtml: true,
          },
        },
      },
    });

    if (!contract) {
      return null;
    }

    // Fetch HTML content for the contract
    let contractHtml: string | null = null;
    const htmlKey = contract.signedHtmlS3Key || contract.unsignedHtmlS3Key;
    if (htmlKey) {
      const htmlCommand = new GetObjectCommand({
        Bucket: ENV.AWS_S3_BUCKET!,
        Key: htmlKey,
      });
      const htmlResponse = await s3Client.send(htmlCommand);
      contractHtml = await streamToString(htmlResponse.Body);

      // Debug: Check if checkbox groups are in the HTML from S3
      if (contractHtml) {
        const hasCheckboxGroups =
          contractHtml.includes('data-variable-type="checkbox_group"') ||
          contractHtml.includes("data-variable-type='checkbox_group'");
        console.log(
          `📦 HTML from S3 (length: ${contractHtml.length}) contains checkbox groups: ${hasCheckboxGroups}`,
        );
        if (hasCheckboxGroups) {
          const sample = contractHtml.substring(
            0,
            Math.min(1000, contractHtml.length),
          );
          console.log(`📦 Sample of HTML from S3: ${sample}`);
        }
      }
    }

    // Process contract HTML to replace variables with their values
    if (contractHtml && contract.data) {
      const contractData = contract.data as any;
      const feeStructure = contractData.feeStructure || {};
      const examinerName =
        contractData.examinerName ||
        (contract.examinerProfile?.account?.user
          ? formatFullName(
              contract.examinerProfile.account.user.firstName,
              contract.examinerProfile.account.user.lastName,
            )
          : "") ||
        "";
      const examinerEmail =
        contract.application?.email ||
        contract.examinerProfile?.account?.user?.email ||
        "";
      const province =
        contractData.province ||
        contract.examinerProfile?.address?.province ||
        contract.application?.address?.province ||
        "";
      const city =
        contractData.city ||
        contract.examinerProfile?.address?.city ||
        contract.application?.address?.city ||
        "";

      try {
        console.log("Processing contract variables...");
        console.log("Fee structure:", feeStructure);
        console.log("Examiner data:", {
          name: examinerName,
          email: examinerEmail,
          province,
          city,
        });

        contractHtml = await processContractVariables(
          contractHtml,
          {
            IMEFee: feeStructure.IMEFee || 0,
            recordReviewFee: feeStructure.recordReviewFee || 0,
            hourlyRate: feeStructure.hourlyRate || 0,
            cancellationFee: feeStructure.cancellationFee || 0,
            paymentTerms: feeStructure.paymentTerms,
          },
          {
            name: examinerName,
            email: examinerEmail,
            province: province,
            city: city,
          },
          contract.fieldValues as Record<string, any> | null,
        );

        console.log("Contract HTML processed successfully");
      } catch (error) {
        console.error("Error processing contract variables:", error);
        // Continue with unprocessed HTML if variable processing fails
      }
    }

    // Fetch custom variables to reconstruct checkbox groups if they're missing from HTML
    const checkboxGroupsFromTemplate: Array<{
      variableKey: string;
      label: string;
      options: Array<{ label: string; value: string }>;
    }> = [];

    if (!contractHtml?.includes('data-variable-type="checkbox_group"')) {
      try {
        const customVariables = await prisma.customVariable.findMany({
          where: {
            isActive: true,
            variableType: "checkbox_group",
          },
        });

        customVariables.forEach((variable) => {
          // Only include custom variables (those starting with "custom.")
          // Exclude system variables like "thrive.*", "examiner.*", "contract.*", "fee.*"
          if (!variable.key.startsWith("custom.")) {
            console.log(
              `🚫 Filtering out non-custom variable from database: ${variable.key}`,
            );
            return;
          }

          // Also exclude custom variables that contain system namespaces (e.g., "custom.thrive.primary_discipline")
          if (
            variable.key.includes(".thrive.") ||
            variable.key.includes(".examiner.") ||
            variable.key.includes(".contract.") ||
            variable.key.includes(".fee.") ||
            variable.key.startsWith("custom.thrive.") ||
            variable.key.startsWith("custom.examiner.") ||
            variable.key.startsWith("custom.contract.") ||
            variable.key.startsWith("custom.fee.")
          ) {
            console.log(
              `🚫 Filtering out custom variable with system namespace: ${variable.key}`,
            );
            return;
          }

          if (variable.options && Array.isArray(variable.options)) {
            const options = variable.options as Array<{
              label: string;
              value: string;
            }>;
            // Remove "custom." prefix and any system namespace prefixes
            const label = variable.key
              .replace(/^custom\./, "")
              .replace(/^(thrive|examiner|contract|fee)\./, "") // Remove system namespace if present
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase());

            console.log(
              `✅ Including custom checkbox group from database: ${variable.key} (label: ${label})`,
            );
            checkboxGroupsFromTemplate.push({
              variableKey: variable.key,
              label,
              options,
            });
          }
        });
      } catch (error) {
        console.error(
          "Error fetching custom variables for checkbox groups:",
          error,
        );
      }
    }

    return {
      ...contract,
      contractHtml,
      headerConfig: contract.templateVersion?.headerConfig as any,
      footerConfig: contract.templateVersion?.footerConfig as any,
      checkboxGroupsFromTemplate,
    };
  } catch (error) {
    console.error("Error fetching contract:", error);
    throw error;
  }
}
