import prisma from "@/lib/db";
import { ContractStatus, Prisma } from "@prisma/client";
import { HttpError } from "@/utils/httpError";
import {
  ContractListItem,
  ContractData,
  CreateContractInput,
  UpdateContractFieldsInput,
  PreviewContractResult,
  ListContractsInput,
} from "../types/contract.types";
import {
  parsePlaceholders,
  extractRequiredFeeVariables,
  validateFeeStructureCompatibility,
} from "@/domains/contract-templates/utils/placeholderParser";
import {
  generateContractFromTemplate,
  type ContractData as GoogleDocsContractData,
} from "@/lib/google-docs";
import logger from "@/utils/logger";
import { formatFullName } from "@/utils/text";
import { getAllVariablesMap } from "@/domains/custom-variables/server/customVariable.service";
import { uploadToS3 } from "@/lib/s3";

// List contracts with optional filters
export const listContracts = async (
  input: ListContractsInput,
): Promise<ContractListItem[]> => {
  const { status, search, templateId, examinerProfileId, applicationId } =
    input;

  const where: Prisma.ContractWhereInput = {};

  if (status && status !== "ALL") {
    where.status = status as ContractStatus;
  }

  if (templateId) {
    where.templateId = templateId;
  }

  if (examinerProfileId) {
    where.examinerProfileId = examinerProfileId;
  }

  if (applicationId) {
    where.applicationId = applicationId;
  }

  if (search && search.trim()) {
    // Search in examiner name or contract data
    where.OR = [
      {
        examinerProfile: {
          account: {
            user: {
              OR: [
                { firstName: { contains: search.trim(), mode: "insensitive" } },
                { lastName: { contains: search.trim(), mode: "insensitive" } },
              ],
            },
          },
        },
      },
      {
        application: {
          OR: [
            { firstName: { contains: search.trim(), mode: "insensitive" } },
            { lastName: { contains: search.trim(), mode: "insensitive" } },
          ],
        },
      },
    ];
  }

  const contracts = await prisma.contract.findMany({
    where,
    include: {
      examinerProfile: {
        include: {
          account: {
            include: {
              user: true,
            },
          },
        },
      },
      application: true,
      template: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return contracts.map((contract) => {
    let examinerName: string | null = null;
    if (contract.examinerProfile?.account?.user) {
      const user = contract.examinerProfile.account.user;
      examinerName = formatFullName(user.firstName, user.lastName);
    } else if (contract.application) {
      examinerName = formatFullName(
        contract.application.firstName,
        contract.application.lastName,
      );
    }

    return {
      id: contract.id,
      examinerProfileId: contract.examinerProfileId,
      applicationId: contract.applicationId,
      templateId: contract.templateId,
      templateVersionId: contract.templateVersionId,
      feeStructureId: contract.feeStructureId,
      status: contract.status,
      examinerName,
      templateName: contract.template.displayName,
      updatedAt: contract.updatedAt.toISOString(),
    };
  });
};

// Get a single contract with full details
export const getContract = async (id: string): Promise<ContractData> => {
  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      template: {
        select: {
          id: true,
          displayName: true,
          slug: true,
        },
      },
      templateVersion: {
        select: {
          id: true,
          version: true,
          bodyHtml: true,
          googleDocTemplateId: true,
          googleDocFolderId: true,
        },
      },
      feeStructure: {
        include: {
          variables: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          },
        },
      },
    },
  });

  if (!contract) {
    throw HttpError.notFound("Contract not found");
  }

  return {
    id: contract.id,
    examinerProfileId: contract.examinerProfileId,
    applicationId: contract.applicationId,
    templateId: contract.templateId,
    templateVersionId: contract.templateVersionId,
    feeStructureId: contract.feeStructureId,
    status: contract.status,
    data: contract.data,
    fieldValues: contract.fieldValues || {},
    sentAt: contract.sentAt?.toISOString() || null,
    signedAt: contract.signedAt?.toISOString() || null,
    createdAt: contract.createdAt.toISOString(),
    updatedAt: contract.updatedAt.toISOString(),
    template: {
      id: contract.template.id,
      displayName: contract.template.displayName,
      slug: contract.template.slug,
    },
    templateVersion: {
      id: contract.templateVersion.id,
      version: contract.templateVersion.version,
      bodyHtml: contract.templateVersion.bodyHtml,
      googleDocTemplateId: contract.templateVersion.googleDocTemplateId,
      googleDocFolderId: contract.templateVersion.googleDocFolderId,
    },
    feeStructure: contract.feeStructure
      ? {
          id: contract.feeStructure.id,
          name: contract.feeStructure.name,
          variables: contract.feeStructure.variables.map((v) => ({
            id: v.id,
            label: v.label,
            key: v.key,
            type: v.type,
            defaultValue: v.defaultValue,
            required: v.required,
            currency: v.currency,
            decimals: v.decimals,
            unit: v.unit,
          })),
        }
      : null,
  };
};

// Create a new contract
export const createContract = async (
  input: CreateContractInput,
  createdBy: string,
): Promise<{ id: string }> => {
  // Get template version
  const templateVersion = await prisma.templateVersion.findUnique({
    where: { id: input.templateVersionId },
    include: {
      template: true,
    },
  });

  if (!templateVersion) {
    throw HttpError.notFound("Template version not found");
  }

  // Get fee structure
  const feeStructure = await prisma.feeStructure.findUnique({
    where: { id: input.feeStructureId },
    include: {
      variables: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!feeStructure) {
    throw HttpError.notFound("Fee structure not found");
  }

  // Validate fee structure compatibility with template
  const templateContent = templateVersion.bodyHtml;
  const requiredFeeVars = extractRequiredFeeVariables(templateContent);

  if (requiredFeeVars.size > 0) {
    const compatibility = validateFeeStructureCompatibility(
      requiredFeeVars,
      feeStructure.variables,
    );

    if (!compatibility.compatible) {
      throw HttpError.badRequest(
        `Fee structure is missing required variables: ${compatibility.missingVariables
          .map((v) => `fees.${v}`)
          .join(", ")}`,
      );
    }
  }

  // Get examiner name for contract data
  let examinerName = "";
  if (input.examinerProfileId) {
    const examiner = await prisma.examinerProfile.findUnique({
      where: { id: input.examinerProfileId },
      include: {
        account: {
          include: {
            user: true,
          },
        },
      },
    });
    if (examiner?.account?.user) {
      examinerName = formatFullName(
        examiner.account.user.firstName,
        examiner.account.user.lastName,
      );
    }
  } else if (input.applicationId) {
    const application = await prisma.examinerApplication.findUnique({
      where: { id: input.applicationId },
    });
    if (application) {
      examinerName = formatFullName(
        application.firstName,
        application.lastName,
      );
    }
  }

  // Prepare contract data (for internal use)
  const contractData = {
    examiner: input.fieldValues.examiner || {},
    contract: input.fieldValues.contract || {},
    thrive: input.fieldValues.thrive || input.fieldValues.org || {},
    fees: {},
  };

  // Add fee structure variables to fees
  for (const variable of feeStructure.variables) {
    const overrideValue = input.fieldValues.fees_overrides?.[variable.key];
    contractData.fees[variable.key] =
      overrideValue !== undefined ? overrideValue : variable.defaultValue;
  }

  // Prepare examiner-web compatible data structure
  // Map fee structure to the format expected by examiner-web
  const feeStructureData: {
    IMEFee: number;
    recordReviewFee: number;
    hourlyRate: number;
    cancellationFee: number;
    paymentTerms: string;
  } = {
    IMEFee: 0,
    recordReviewFee: 0,
    hourlyRate: 0,
    cancellationFee: 0,
    paymentTerms: "",
  };

  // Map fee structure variables to examiner-web format
  for (const variable of feeStructure.variables) {
    const overrideValue = input.fieldValues.fees_overrides?.[variable.key];
    const defaultValue =
      overrideValue !== undefined ? overrideValue : variable.defaultValue;
    const numValue =
      typeof defaultValue === "number"
        ? defaultValue
        : parseFloat(String(defaultValue || 0));

    const key = variable.key.toLowerCase();
    if (key.includes("ime") || key.includes("base_exam")) {
      feeStructureData.IMEFee = numValue;
    } else if (key.includes("record") || key.includes("review")) {
      feeStructureData.recordReviewFee = numValue;
    } else if (key.includes("hourly") || key.includes("rate")) {
      feeStructureData.hourlyRate = numValue;
    } else if (key.includes("cancellation") || key.includes("cancel")) {
      feeStructureData.cancellationFee = numValue;
    } else if (key.includes("payment") || key.includes("terms")) {
      feeStructureData.paymentTerms = String(defaultValue || "");
    }
  }

  // Store both formats in data field
  const fullContractData = {
    ...contractData,
    // Examiner-web compatible format
    examinerName,
    province:
      input.fieldValues.examiner?.province ||
      input.fieldValues.contract?.province ||
      "",
    effectiveDate:
      input.fieldValues.contract?.effective_date ||
      new Date().toISOString().split("T")[0],
    feeStructure: feeStructureData,
  };

  // Validate that either examinerProfileId or applicationId is provided, but not both
  if (!input.examinerProfileId && !input.applicationId) {
    throw HttpError.badRequest(
      "Either examinerProfileId or applicationId must be provided",
    );
  }

  if (input.examinerProfileId && input.applicationId) {
    throw HttpError.badRequest(
      "Cannot provide both examinerProfileId and applicationId",
    );
  }

  // Verify the examiner profile or application exists
  if (input.examinerProfileId) {
    const examiner = await prisma.examinerProfile.findUnique({
      where: { id: input.examinerProfileId },
    });
    if (!examiner) {
      throw HttpError.notFound("Examiner profile not found");
    }
  }

  if (input.applicationId) {
    const application = await prisma.examinerApplication.findUnique({
      where: { id: input.applicationId },
    });
    if (!application) {
      throw HttpError.notFound("Application not found");
    }
  }

  // Create contract
  const contract = await prisma.contract.create({
    data: {
      examinerProfileId: input.examinerProfileId || null,
      applicationId: input.applicationId || null,
      templateId: templateVersion.templateId,
      templateVersionId: input.templateVersionId,
      feeStructureId: input.feeStructureId,
      status: "DRAFT",
      data: fullContractData as any,
      fieldValues: input.fieldValues as any,
      dataHash: "",
      createdBy,
    },
  });

  return { id: contract.id };
};

// Update contract fields
export const updateContractFields = async (
  input: UpdateContractFieldsInput,
): Promise<{ id: string }> => {
  const contract = await prisma.contract.findUnique({
    where: { id: input.id },
    include: {
      feeStructure: {
        include: {
          variables: true,
        },
      },
    },
  });

  if (!contract) {
    throw HttpError.notFound("Contract not found");
  }

  // Merge with existing fieldValues
  const existingFieldValues = (contract.fieldValues as any) || {};
  const updatedFieldValues = {
    ...existingFieldValues,
    ...input.fieldValues,
  };

  // Update contract
  await prisma.contract.update({
    where: { id: input.id },
    data: {
      fieldValues: updatedFieldValues as any,
    },
  });

  return { id: input.id };
};

// Update contract fee structure
export const updateContractFeeStructure = async (
  contractId: string,
  feeStructureId: string,
): Promise<{ id: string }> => {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      templateVersion: {
        include: {
          template: true,
        },
      },
    },
  });

  if (!contract) {
    throw HttpError.notFound("Contract not found");
  }

  // Get new fee structure
  const feeStructure = await prisma.feeStructure.findUnique({
    where: { id: feeStructureId },
    include: {
      variables: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!feeStructure) {
    throw HttpError.notFound("Fee structure not found");
  }

  // Validate fee structure compatibility with template
  const templateContent = contract.templateVersion.bodyHtml;
  const requiredFeeVars = extractRequiredFeeVariables(templateContent);

  if (requiredFeeVars.size > 0) {
    const compatibility = validateFeeStructureCompatibility(
      requiredFeeVars,
      feeStructure.variables,
    );

    if (!compatibility.compatible) {
      throw HttpError.badRequest(
        `Fee structure is missing required variables: ${compatibility.missingVariables
          .map((v) => `fees.${v}`)
          .join(", ")}`,
      );
    }
  }

  // Get existing field values
  const existingFieldValues = (contract.fieldValues as any) || {};
  const existingFeesOverrides = existingFieldValues.fees_overrides || {};

  // Prepare new contract data with updated fee structure
  const contractData = {
    examiner: existingFieldValues.examiner || {},
    contract: existingFieldValues.contract || {},
    thrive: existingFieldValues.thrive || existingFieldValues.org || {},
    fees: {},
  };

  // Add fee structure variables to fees
  for (const variable of feeStructure.variables) {
    const overrideValue = existingFeesOverrides[variable.key];
    contractData.fees[variable.key] =
      overrideValue !== undefined ? overrideValue : variable.defaultValue;
  }

  // Prepare examiner-web compatible data structure
  const feeStructureData: {
    IMEFee: number;
    recordReviewFee: number;
    hourlyRate: number;
    cancellationFee: number;
    paymentTerms: string;
  } = {
    IMEFee: 0,
    recordReviewFee: 0,
    hourlyRate: 0,
    cancellationFee: 0,
    paymentTerms: "",
  };

  // Map fee structure variables to examiner-web format
  for (const variable of feeStructure.variables) {
    const overrideValue = existingFeesOverrides[variable.key];
    const defaultValue =
      overrideValue !== undefined ? overrideValue : variable.defaultValue;
    const numValue =
      typeof defaultValue === "number"
        ? defaultValue
        : parseFloat(String(defaultValue || 0));

    const key = variable.key.toLowerCase();
    if (key.includes("ime") || key.includes("base_exam")) {
      feeStructureData.IMEFee = numValue;
    } else if (key.includes("record") || key.includes("review")) {
      feeStructureData.recordReviewFee = numValue;
    } else if (key.includes("hourly") || key.includes("rate")) {
      feeStructureData.hourlyRate = numValue;
    } else if (key.includes("cancellation") || key.includes("cancel")) {
      feeStructureData.cancellationFee = numValue;
    } else if (key.includes("payment") || key.includes("terms")) {
      feeStructureData.paymentTerms = String(defaultValue || "");
    }
  }

  // Get examiner name
  let examinerName = "";
  if (contract.examinerProfileId) {
    const examiner = await prisma.examinerProfile.findUnique({
      where: { id: contract.examinerProfileId },
      include: {
        account: {
          include: {
            user: true,
          },
        },
      },
    });
    if (examiner?.account?.user) {
      examinerName = formatFullName(
        examiner.account.user.firstName,
        examiner.account.user.lastName,
      );
    }
  } else if (contract.applicationId) {
    const application = await prisma.examinerApplication.findUnique({
      where: { id: contract.applicationId },
    });
    if (application) {
      examinerName = formatFullName(
        application.firstName,
        application.lastName,
      );
    }
  }

  // Store both formats in data field
  const fullContractData = {
    ...contractData,
    examinerName,
    province:
      existingFieldValues.examiner?.province ||
      existingFieldValues.contract?.province ||
      "",
    effectiveDate:
      existingFieldValues.contract?.effective_date ||
      new Date().toISOString().split("T")[0],
    feeStructure: feeStructureData,
  };

  // Update contract
  await prisma.contract.update({
    where: { id: contractId },
    data: {
      feeStructureId: feeStructureId,
      data: fullContractData as any,
      // Keep existing fieldValues but update fees_overrides if needed
      fieldValues: {
        ...existingFieldValues,
        fees_overrides: existingFeesOverrides,
      } as any,
    },
  });

  return { id: contractId };
};

// Preview contract (render with placeholders)
export const previewContract = async (
  contractId: string,
): Promise<PreviewContractResult> => {
  const contract = await getContract(contractId);

  // Get all values for placeholder replacement
  const values: Record<string, string | number | boolean> = {};

  // Add examiner values
  if (contract.fieldValues && typeof contract.fieldValues === "object") {
    const fv = contract.fieldValues as any;
    if (fv.examiner) {
      for (const [key, value] of Object.entries(fv.examiner)) {
        values[`examiner.${key}`] = String(value);
      }
    }

    // Add signature date_time from contract.signedAt if available
    if (contract.signedAt) {
      const signatureDateTime = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(new Date(contract.signedAt));
      values["examiner.signature_date_time"] = signatureDateTime;
    }

    // Add contract values
    if (fv.contract) {
      for (const [key, value] of Object.entries(fv.contract)) {
        values[`contract.${key}`] = String(value);
      }
    }

    // Add thrive values (defaults)
    if (fv.thrive) {
      for (const [key, value] of Object.entries(fv.thrive)) {
        values[`thrive.${key}`] = String(value);
      }
    } else if (fv.org) {
      // Backward compatibility: support old "org" namespace
      for (const [key, value] of Object.entries(fv.org)) {
        values[`thrive.${key}`] = String(value);
      }
    }

    // Add all variables from database (system + custom)
    const dbVariablesMap = await getAllVariablesMap();
    Object.assign(values, dbVariablesMap);

    // Override with fieldValues if provided
    if (fv.thrive) {
      for (const [key, value] of Object.entries(fv.thrive)) {
        values[`thrive.${key}`] = String(value);
      }
    } else if (fv.org) {
      // Backward compatibility: support old "org" namespace
      for (const [key, value] of Object.entries(fv.org)) {
        values[`thrive.${key}`] = String(value);
      }
    }

    // Add fees values
    if (contract.feeStructure) {
      for (const variable of contract.feeStructure.variables) {
        const overrideValue = fv.fees_overrides?.[variable.key];
        const defaultValue =
          overrideValue !== undefined ? overrideValue : variable.defaultValue;

        // Format based on type
        let formattedValue: string;
        if (variable.type === "MONEY") {
          const numValue =
            typeof defaultValue === "number"
              ? defaultValue
              : parseFloat(String(defaultValue || 0));
          formattedValue = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: variable.currency || "USD",
            minimumFractionDigits: variable.decimals || 2,
            maximumFractionDigits: variable.decimals || 2,
          }).format(numValue);
        } else if (variable.type === "NUMBER") {
          const numValue =
            typeof defaultValue === "number"
              ? defaultValue
              : parseFloat(String(defaultValue || 0));
          formattedValue = numValue.toFixed(variable.decimals || 0);
        } else {
          formattedValue = String(defaultValue || "");
        }

        values[`fees.${variable.key}`] = formattedValue;
      }
    }
  } else {
    // No fieldValues, load all variables from database
    const dbVariablesMap = await getAllVariablesMap();
    Object.assign(values, dbVariablesMap);

    // Add signature date_time from contract.signedAt if available
    if (contract.signedAt) {
      const signatureDateTime = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(new Date(contract.signedAt));
      values["examiner.signature_date_time"] = signatureDateTime;
    }

    // Add custom variables
    const customVariablesMap = await getAllVariablesMap();
    Object.assign(values, customVariablesMap);

    if (contract.feeStructure) {
      for (const variable of contract.feeStructure.variables) {
        let formattedValue: string;
        if (variable.type === "MONEY") {
          const numValue =
            typeof variable.defaultValue === "number"
              ? variable.defaultValue
              : parseFloat(String(variable.defaultValue || 0));
          formattedValue = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: variable.currency || "USD",
            minimumFractionDigits: variable.decimals || 2,
            maximumFractionDigits: variable.decimals || 2,
          }).format(numValue);
        } else if (variable.type === "NUMBER") {
          const numValue =
            typeof variable.defaultValue === "number"
              ? variable.defaultValue
              : parseFloat(String(variable.defaultValue || 0));
          formattedValue = numValue.toFixed(variable.decimals || 0);
        } else {
          formattedValue = String(variable.defaultValue || "");
        }
        values[`fees.${variable.key}`] = formattedValue;
      }
    }
  }

  // Check if template uses Google Docs
  const usesGoogleDocs =
    contract.templateVersion.googleDocTemplateId &&
    contract.templateVersion.googleDocFolderId;

  let renderedHtml: string;
  const missingPlaceholders: string[] = [];

  if (usesGoogleDocs) {
    // Generate preview from Google Docs template
    try {
      // Get examiner data for Google Docs format
      const fv = (contract.fieldValues as any) || {};
      const examinerName = fv.examiner?.name || "Examiner";
      const province = fv.examiner?.province || fv.contract?.province || "";
      const effectiveDate = fv.contract?.effective_date
        ? new Date(fv.contract.effective_date as string)
        : new Date();

      // Build fee structure for Google Docs (old format)
      const feeStructure: GoogleDocsContractData["feeStructure"] = {
        IMEFee: 0,
        recordReviewFee: 0,
        cancellationFee: 0,
        paymentTerms: "",
      };

      if (contract.feeStructure) {
        // Map fee structure variables to Google Docs format
        for (const variable of contract.feeStructure.variables) {
          const overrideValue = fv.fees_overrides?.[variable.key];
          const defaultValue =
            overrideValue !== undefined ? overrideValue : variable.defaultValue;
          const numValue =
            typeof defaultValue === "number"
              ? defaultValue
              : parseFloat(String(defaultValue || 0));

          // Map common fee variable keys to Google Docs format
          const key = variable.key.toLowerCase();
          if (key.includes("ime") || key.includes("base_exam")) {
            feeStructure.IMEFee = numValue;
          } else if (key.includes("record") || key.includes("review")) {
            feeStructure.recordReviewFee = numValue;
          } else if (key.includes("hourly") || key.includes("rate")) {
            feeStructure.hourlyRate = numValue;
          } else if (key.includes("cancellation") || key.includes("cancel")) {
            feeStructure.cancellationFee = numValue;
          } else if (key.includes("payment") || key.includes("terms")) {
            feeStructure.paymentTerms = String(defaultValue || "");
          }
        }
      }

      const signature = fv.examiner?.signature || "";
      const signatureDateTime = contract.signedAt || undefined;

      const googleDocsData: GoogleDocsContractData = {
        examinerName: String(examinerName),
        province: String(province),
        effectiveDate,
        signature: signature,
        signatureDateTime: signatureDateTime,
        feeStructure,
      };

      // Generate HTML from Google Docs template
      renderedHtml = await generateContractFromTemplate(
        contract.templateVersion.googleDocTemplateId!,
        googleDocsData,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      logger.error("Error generating Google Docs preview:", error);
      return {
        renderedHtml: `<div style="padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background: #f9f9f9;"><p style="color: #d32f2f; margin: 0;">Error generating preview: ${errorMessage}</p><p style="color: #666; margin-top: 10px; font-size: 14px;">Please check Google Docs configuration and try again.</p></div>`,
        missingPlaceholders: [],
      };
    }
  } else {
    // Use HTML template directly
    const templateHtml = contract.templateVersion.bodyHtml;

    if (!templateHtml || templateHtml.trim() === "") {
      return {
        renderedHtml:
          "<p>Template content is empty. Please add content to the template.</p>",
        missingPlaceholders: [],
      };
    }

    // Replace placeholders in template
    renderedHtml = templateHtml;
    const placeholders = parsePlaceholders(renderedHtml);

    for (const placeholder of placeholders) {
      // Replace all occurrences of this placeholder
      const regex = new RegExp(
        `\\{\\{\\s*${placeholder.replace(/\./g, "\\.")}\\s*\\}\\}`,
        "g",
      );

      // Signature placeholders are optional - replace with empty string if not available
      const isSignaturePlaceholder =
        placeholder === "examiner.signature" ||
        placeholder === "examiner.signature_date_time";

      if (values[placeholder]) {
        // Special handling for logo and signature - convert to img tag if it's a URL or data URL
        let replacement: string;
        if (
          placeholder === "thrive.logo" &&
          values[placeholder] &&
          typeof values[placeholder] === "string"
        ) {
          const logoUrl = String(values[placeholder]).trim();
          if (
            logoUrl &&
            (logoUrl.startsWith("http://") || logoUrl.startsWith("https://"))
          ) {
            // Wrap in a div that centers the image and preserves parent alignment
            replacement = `<div style="text-align: center; display: block;"><img src="${logoUrl}" alt="Thrive Logo" style="max-width: 200px; height: auto; display: inline-block;" /></div>`;
          } else {
            replacement = logoUrl;
          }
        } else if (
          placeholder === "examiner.signature" &&
          values[placeholder] &&
          typeof values[placeholder] === "string"
        ) {
          const signatureUrl = String(values[placeholder]).trim();
          if (
            signatureUrl &&
            (signatureUrl.startsWith("data:image/") ||
              signatureUrl.startsWith("http://") ||
              signatureUrl.startsWith("https://"))
          ) {
            replacement = `<img src="${signatureUrl}" alt="Examiner Signature" style="max-width: 240px; height: auto; display: inline-block;" />`;
          } else {
            replacement = signatureUrl;
          }
        } else {
          replacement = String(values[placeholder]);
        }

        renderedHtml = renderedHtml.replace(regex, replacement);
      } else if (isSignaturePlaceholder) {
        // Replace signature placeholders with empty string if not available (they'll be filled when examiner signs)
        renderedHtml = renderedHtml.replace(regex, "");
      } else {
        // For other placeholders, mark as missing
        missingPlaceholders.push(placeholder);
      }
    }
  }

  // Upload rendered HTML to S3 (always upload to ensure it's available)
  const htmlBuffer = Buffer.from(renderedHtml, "utf-8");
  const htmlFileName = `contracts/${contractId}/unsigned-${Date.now()}.html`;
  let htmlS3Key: string;
  try {
    htmlS3Key = await uploadToS3(
      htmlBuffer,
      htmlFileName,
      "text/html",
      "contracts",
    );
    logger.log(`✅ Contract HTML uploaded to S3: ${htmlS3Key}`);
  } catch (error) {
    logger.error("Failed to upload contract HTML to S3:", error);
    // Re-throw if upload fails
    throw new Error("Failed to upload contract HTML to S3");
  }

  // Store rendered HTML in data and update unsignedHtmlS3Key
  await prisma.contract.update({
    where: { id: contractId },
    data: {
      data: {
        ...(contract.data as any),
        renderedHtml,
      } as any,
      unsignedHtmlS3Key: htmlS3Key,
    },
  });

  return {
    renderedHtml,
    missingPlaceholders,
  };
};
