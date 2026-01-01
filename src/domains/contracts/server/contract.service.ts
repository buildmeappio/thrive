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
import logger from "@/utils/logger";
import { formatFullName } from "@/utils/text";
import { getAllVariablesMap } from "@/domains/custom-variables/server/customVariable.service";
import { uploadToS3 } from "@/lib/s3";
import {
  createGoogleDoc,
  updateGoogleDocWithHtml,
  getGoogleDocUrl,
} from "@/lib/google-docs";
import { ENV } from "@/constants/variables";

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
      reviewedAt: contract.reviewedAt?.toISOString() || null,
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
          headerConfig: true,
          footerConfig: true,
        },
      },
      feeStructure: {
        include: {
          variables: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          },
        },
      },
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
    reviewedAt: contract.reviewedAt?.toISOString() || null,
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

  // Merge with existing fieldValues
  const existingFieldValues = (contract.fieldValues as any) || {};
  const updatedFieldValues = {
    ...existingFieldValues,
    ...input.fieldValues,
    // Deep merge fees_overrides to preserve existing values
    fees_overrides: {
      ...(existingFieldValues.fees_overrides || {}),
      ...(input.fieldValues.fees_overrides || {}),
    },
  };

  // If fees_overrides are being updated, also update contract.data.fees
  let updatedData = contract.data as any;
  if (input.fieldValues.fees_overrides && contract.feeStructure) {
    const existingData = (contract.data as any) || {};
    const existingFees = existingData.fees || {};
    const updatedFees = { ...existingFees };

    // Update fees with new override values
    for (const variable of contract.feeStructure.variables) {
      const overrideValue = updatedFieldValues.fees_overrides?.[variable.key];
      updatedFees[variable.key] =
        overrideValue !== undefined ? overrideValue : variable.defaultValue;
    }

    // Update contract data with new fees
    updatedData = {
      ...existingData,
      fees: updatedFees,
    };

    // Also update examiner-web compatible feeStructure format
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
    if (
      contract.feeStructure.variables &&
      Array.isArray(contract.feeStructure.variables) &&
      contract.feeStructure.variables.length > 0
    ) {
      for (const variable of contract.feeStructure.variables) {
        const overrideValue = updatedFieldValues.fees_overrides?.[variable.key];
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
    }

    updatedData.feeStructure = feeStructureData;
  }

  // Update contract
  await prisma.contract.update({
    where: { id: input.id },
    data: {
      fieldValues: updatedFieldValues as any,
      data: updatedData as any,
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

  // Fetch examiner profile if needed
  let examinerProfile = null;
  if (contract.examinerProfileId) {
    examinerProfile = await prisma.examinerProfile.findUnique({
      where: { id: contract.examinerProfileId },
      include: {
        account: {
          include: {
            user: true,
          },
        },
        address: true,
      },
    });
  }

  // Fetch application if needed
  let application = null;
  if (contract.applicationId) {
    application = await prisma.examinerApplication.findUnique({
      where: { id: contract.applicationId },
      include: {
        address: true,
      },
    });
  }

  // Extract fieldValues for use throughout the function
  const fv =
    contract.fieldValues && typeof contract.fieldValues === "object"
      ? (contract.fieldValues as any)
      : null;

  // Add examiner values from fieldValues (legacy support for examiner.* format)
  if (fv && fv.examiner) {
    for (const [key, value] of Object.entries(fv.examiner)) {
      // Map legacy examiner.* variables to new application.examiner_* format
      const legacyKey = `examiner.${key}`;
      const newKey = `application.examiner_${key.replace(/_/g, "_")}`;

      // Special handling for examiner.name - always format it properly
      if (key === "name" && examinerProfile?.account?.user) {
        const user = examinerProfile.account.user;
        const formattedName = formatFullName(user.firstName, user.lastName);
        if (formattedName) {
          values[newKey] = formattedName;
        } else {
          values[newKey] = String(value);
        }
      } else {
        // Only add non-empty values from fieldValues
        const stringValue = String(value);
        if (stringValue.trim() !== "") {
          values[newKey] = stringValue;
        }
      }
    }
  }

  // Add examiner application data (prioritize application data over examinerProfile)
  if (application) {
    // Name - format from firstName and lastName
    if (!values["application.examiner_name"]) {
      const fullName = formatFullName(
        application.firstName || "",
        application.lastName || "",
      );
      if (fullName) {
        values["application.examiner_name"] = fullName;
      }
    }

    // Email
    if (!values["application.examiner_email"] && application.email) {
      values["application.examiner_email"] = application.email;
    }

    // Phone
    if (!values["application.examiner_phone"] && application.phone) {
      values["application.examiner_phone"] = application.phone;
    }

    // Landline Number
    if (
      !values["application.examiner_landline_number"] &&
      application.landlineNumber
    ) {
      values["application.examiner_landline_number"] =
        application.landlineNumber;
    }

    // Province (from provinceOfResidence)
    if (
      !values["application.examiner_province"] &&
      application.provinceOfResidence
    ) {
      values["application.examiner_province"] = application.provinceOfResidence;
    }

    // City (from address)
    if (!values["application.examiner_city"] && application.address?.city) {
      values["application.examiner_city"] = application.address.city;
    }

    // Languages Spoken (array -> comma-separated)
    if (
      !values["application.examiner_languages_spoken"] &&
      application.languagesSpoken &&
      Array.isArray(application.languagesSpoken) &&
      application.languagesSpoken.length > 0
    ) {
      values["application.examiner_languages_spoken"] =
        application.languagesSpoken.join(", ");
    }

    // License Number
    if (
      !values["application.examiner_license_number"] &&
      application.licenseNumber
    ) {
      values["application.examiner_license_number"] = application.licenseNumber;
    }

    // Province of Licensure
    if (
      !values["application.examiner_province_of_licensure"] &&
      application.provinceOfLicensure
    ) {
      values["application.examiner_province_of_licensure"] =
        application.provinceOfLicensure;
    }

    // Specialties (array -> comma-separated)
    if (
      !values["application.examiner_specialties"] &&
      application.specialties &&
      Array.isArray(application.specialties) &&
      application.specialties.length > 0
    ) {
      values["application.examiner_specialties"] =
        application.specialties.join(", ");
    }

    // Years of IME Experience
    if (
      !values["application.examiner_years_of_ime_experience"] &&
      application.yearsOfIMEExperience
    ) {
      values["application.examiner_years_of_ime_experience"] =
        application.yearsOfIMEExperience;
    }
  }

  // Fallback to examinerProfile if application is not available
  if (!application && examinerProfile) {
    // Add examiner name if not already set (using formatFullName utility for consistent formatting)
    if (!values["application.examiner_name"] && examinerProfile.account?.user) {
      const user = examinerProfile.account.user;
      const fullName = formatFullName(user.firstName, user.lastName);
      if (fullName) {
        values["application.examiner_name"] = fullName;
      }
    }

    // Add examiner email if not already set
    if (
      !values["application.examiner_email"] &&
      examinerProfile.account?.user?.email
    ) {
      values["application.examiner_email"] = examinerProfile.account.user.email;
    }

    // Add examiner city from address if not already set
    if (!values["application.examiner_city"] && examinerProfile.address?.city) {
      values["application.examiner_city"] = examinerProfile.address.city;
    }

    // Add examiner province from address if not already set
    if (
      !values["application.examiner_province"] &&
      examinerProfile.address?.province
    ) {
      values["application.examiner_province"] =
        examinerProfile.address.province;
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
    values["application.examiner_signature_date_time"] = signatureDateTime;
  }

  // Add signature from fieldValues if available
  if (fv && fv.examiner && fv.examiner.signature) {
    values["application.examiner_signature"] = String(fv.examiner.signature);
  }

  // Add contract values
  if (fv && fv.contract) {
    for (const [key, value] of Object.entries(fv.contract)) {
      values[`contract.${key}`] = String(value);
    }
  }

  // Add review date from contract.reviewedAt if available
  if (contract.reviewedAt) {
    try {
      const reviewDateObj = new Date(contract.reviewedAt);
      // Check if date is valid
      if (!isNaN(reviewDateObj.getTime())) {
        const reviewDate = new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }).format(reviewDateObj);
        values["contract.review_date"] = reviewDate;
      }
    } catch (error) {
      logger.warn(
        `Failed to format review date for contract ${contract.id}:`,
        error,
      );
    }
  }

  // Add thrive values (defaults)
  if (fv && fv.thrive) {
    for (const [key, value] of Object.entries(fv.thrive)) {
      values[`thrive.${key}`] = String(value);
    }
  } else if (fv && fv.org) {
    // Backward compatibility: support old "org" namespace
    for (const [key, value] of Object.entries(fv.org)) {
      values[`thrive.${key}`] = String(value);
    }
  }

  // Add all variables from database (system + custom)
  const dbVariablesMap = await getAllVariablesMap();
  Object.assign(values, dbVariablesMap);

  // Override with fieldValues if provided
  if (fv && fv.thrive) {
    for (const [key, value] of Object.entries(fv.thrive)) {
      values[`thrive.${key}`] = String(value);
    }
  } else if (fv && fv.org) {
    // Backward compatibility: support old "org" namespace
    for (const [key, value] of Object.entries(fv.org)) {
      values[`thrive.${key}`] = String(value);
    }
  }

  // Add fees values
  if (contract.feeStructure) {
    for (const variable of contract.feeStructure.variables) {
      const overrideValue = fv?.fees_overrides?.[variable.key];
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

  // Always use HTML template from bodyHtml as source of truth
  const templateHtml = contract.templateVersion.bodyHtml;

  // Validate that bodyHtml exists and is not empty
  if (!templateHtml || templateHtml.trim() === "") {
    logger.warn(`Template bodyHtml is empty for contract ${contractId}`);
    return {
      renderedHtml:
        "<p>Template content is empty. Please add content to the template.</p>",
      missingPlaceholders: [],
    };
  }

  // Log the raw HTML to debug styling issues
  logger.log(
    `📋 Raw template HTML (first 500 chars): ${templateHtml.substring(0, 500)}`,
  );

  // Replace placeholders in template
  let renderedHtml = templateHtml;
  const missingPlaceholders: string[] = [];

  // Step 1: Protect checkbox groups first
  const checkboxGroupPlaceholders: string[] = [];
  const checkboxGroupPattern =
    /<div[^>]*data-variable-type=["']checkbox_group["'][^>]*>/gi;
  let match;
  const groups: Array<{ start: number; end: number; html: string }> = [];

  while ((match = checkboxGroupPattern.exec(renderedHtml)) !== null) {
    const startIndex = match.index;
    const openingTag = match[0];
    let depth = 1;
    let currentIndex = startIndex + openingTag.length;

    while (depth > 0 && currentIndex < renderedHtml.length) {
      const nextOpen = renderedHtml.indexOf("<div", currentIndex);
      const nextClose = renderedHtml.indexOf("</div>", currentIndex);
      if (nextClose === -1) break;
      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        currentIndex = nextOpen + 4;
      } else {
        depth--;
        if (depth === 0) {
          const endIndex = nextClose + 6;
          groups.push({
            start: startIndex,
            end: endIndex,
            html: renderedHtml.substring(startIndex, endIndex),
          });
          break;
        }
        currentIndex = nextClose + 6;
      }
    }
  }

  groups.reverse().forEach((group) => {
    const placeholder = `__CHECKBOX_GROUP_${checkboxGroupPlaceholders.length}__`;
    checkboxGroupPlaceholders.unshift(group.html);
    renderedHtml =
      renderedHtml.substring(0, group.start) +
      placeholder +
      renderedHtml.substring(group.end);
  });

  // Step 2: Extract variable keys from spans with data-variable attribute
  renderedHtml = renderedHtml.replace(
    /<span[^>]*data-variable="([^"]*)"[^>]*>(.*?)<\/span>/gi,
    (match, variableKey) => {
      return `{{${variableKey}}}`;
    },
  );

  // Step 3: Extract variable keys from spans with title attribute containing placeholder
  renderedHtml = renderedHtml.replace(
    /<span[^>]*title="\{\{([^}]+)\}\}"[^>]*>(.*?)<\/span>/gi,
    (match, variableKey) => {
      return `{{${variableKey}}}`;
    },
  );

  // Step 4: Extract variable keys from spans with border-bottom styling (preview spans)
  renderedHtml = renderedHtml.replace(
    /<span[^>]*style="[^"]*border-bottom:\s*2px[^"]*"[^>]*title="\{\{([^}]+)\}\}"[^>]*>(.*?)<\/span>/gi,
    (match, variableKey) => {
      return `{{${variableKey}}}`;
    },
  );

  // Step 5: Handle spans with variable classes
  renderedHtml = renderedHtml.replace(
    /<span[^>]*class="[^"]*variable-(valid|invalid)[^"]*"[^>]*>(.*?)<\/span>/gi,
    (match, _validity, content) => {
      const placeholderMatch = content.match(/\{\{([^}]+)\}\}/);
      if (placeholderMatch) return placeholderMatch[0];
      const dataVarMatch = match.match(/data-variable="([^"]*)"/);
      if (dataVarMatch) return `{{${dataVarMatch[1]}}}`;
      const titleMatch = match.match(/title="\{\{([^}]+)\}\}"/);
      if (titleMatch) return `{{${titleMatch[1]}}}`;
      return content;
    },
  );

  // Step 6: Now parse and replace placeholders
  const placeholders = parsePlaceholders(renderedHtml);

  for (const placeholder of placeholders) {
    // Replace all occurrences of this placeholder
    const regex = new RegExp(
      `\\{\\{\\s*${placeholder.replace(/\./g, "\\.")}\\s*\\}\\}`,
      "g",
    );

    // Signature placeholders are optional - replace with underscores if not available
    const isSignaturePlaceholder =
      placeholder === "examiner.signature" ||
      placeholder === "examiner.signature_date_time" ||
      placeholder === "application.examiner_signature" ||
      placeholder === "application.examiner_signature_date_time";

    // Review date is optional - only set when admin reviews the contract
    // City and province are optional - may not be available for all examiners
    const isOptionalPlaceholder =
      isSignaturePlaceholder ||
      placeholder === "contract.review_date" ||
      placeholder === "examiner.city" ||
      placeholder === "examiner.province" ||
      placeholder === "application.examiner_city" ||
      placeholder === "application.examiner_province";

    // Check if value exists and is not empty (for city/province, empty string means not available)
    const value = values[placeholder];
    const hasValue =
      value !== undefined && value !== null && String(value).trim() !== "";

    if (hasValue) {
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
        (placeholder === "examiner.signature" ||
          placeholder === "application.examiner_signature") &&
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
          replacement = `<img src="${signatureUrl}" alt="Examiner Signature" data-signature="examiner" style="max-width: 240px; height: auto; display: inline-block;" />`;
        } else {
          replacement = signatureUrl;
        }
      } else {
        // For regular variable values, add bold underline styling (matching template preview)
        const valueStr = String(value);
        replacement = `<span style="border-bottom: 2px solid black; background: none !important; color: inherit !important; padding: 0 !important; border-radius: 0 !important; font-weight: normal;" title="${placeholder}">${valueStr}</span>`;
      }

      renderedHtml = renderedHtml.replace(regex, replacement);
    } else if (isOptionalPlaceholder) {
      // Handle optional placeholders
      if (placeholder === "examiner.signature") {
        // Wrap in a span with data-signature attribute so examiner-web can identify it
        const underscoreLine =
          '<span data-signature="examiner">________________________</span>';
        renderedHtml = renderedHtml.replace(regex, underscoreLine);
      } else if (placeholder === "contract.review_date") {
        // For review_date, replace with empty string or "Not reviewed" - it's optional
        renderedHtml = renderedHtml.replace(regex, "");
      } else if (
        placeholder === "examiner.city" ||
        placeholder === "examiner.province" ||
        placeholder === "application.examiner_city" ||
        placeholder === "application.examiner_province"
      ) {
        // For city and province, if value exists but is empty string, replace with empty string
        // Otherwise, use underscores as placeholder
        const value = values[placeholder];
        if (value !== undefined && String(value).trim() !== "") {
          renderedHtml = renderedHtml.replace(regex, String(value));
        } else {
          const underscoreLine = "________________________";
          renderedHtml = renderedHtml.replace(regex, underscoreLine);
        }
      } else {
        // For signature_date_time, just use underscores without the data attribute
        const underscoreLine = "________________________";
        renderedHtml = renderedHtml.replace(regex, underscoreLine);
      }
    } else {
      // For other placeholders, mark as missing
      missingPlaceholders.push(placeholder);
    }
  }

  // Step 7: Restore checkbox groups
  checkboxGroupPlaceholders.forEach((checkboxGroup, index) => {
    const placeholderPattern = new RegExp(`__CHECKBOX_GROUP_${index}__`, "g");
    renderedHtml = renderedHtml.replace(placeholderPattern, checkboxGroup);
  });

  // Log final rendered HTML for debugging
  logger.log(
    `✅ Contract preview HTML generated (${renderedHtml.length} characters)`,
  );
  const finalPreview =
    renderedHtml.length > 1000
      ? `${renderedHtml.substring(0, 500)}...\n...${renderedHtml.substring(renderedHtml.length - 500)}`
      : renderedHtml;
  logger.log(`📄 Final preview HTML:\n${finalPreview}`);

  // For preview, just return the HTML without uploading to S3
  return {
    renderedHtml,
    missingPlaceholders,
  };
};

// Generate contract HTML and upload to S3 (used when sending contract)
export const generateAndUploadContractHtml = async (
  contractId: string,
): Promise<{ htmlS3Key: string; renderedHtml: string }> => {
  // First, generate the HTML using previewContract
  const previewResult = await previewContract(contractId);

  // Filter out optional placeholders - signature placeholders are only available after signing,
  // and review_date is only set when admin reviews the contract
  const requiredPlaceholders = previewResult.missingPlaceholders.filter(
    (p) =>
      p !== "examiner.signature" &&
      p !== "examiner.signature_date_time" &&
      p !== "contract.review_date",
  );

  if (requiredPlaceholders.length > 0) {
    throw HttpError.badRequest(
      `Missing required placeholders: ${requiredPlaceholders.join(", ")}`,
    );
  }

  // Log HTML before uploading
  logger.log(
    `📤 Preparing to upload contract HTML to S3 (${previewResult.renderedHtml.length} characters)`,
  );
  const uploadPreview =
    previewResult.renderedHtml.length > 1000
      ? `${previewResult.renderedHtml.substring(0, 500)}...\n...${previewResult.renderedHtml.substring(previewResult.renderedHtml.length - 500)}`
      : previewResult.renderedHtml;
  logger.log(`📄 HTML to upload:\n${uploadPreview}`);

  // Upload rendered HTML to S3
  const htmlBuffer = Buffer.from(previewResult.renderedHtml, "utf-8");
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
    throw new Error("Failed to upload contract HTML to S3");
  }

  // Get contract to update (including Google Doc info)
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    select: {
      data: true,
      googleDocId: true,
      templateVersion: {
        select: {
          template: {
            select: {
              displayName: true,
            },
          },
        },
      },
    },
  });

  // Create or update Google Doc with rendered HTML content
  let googleDocId = contract?.googleDocId;
  try {
    if (!googleDocId) {
      // Create a new Google Doc for this contract
      const folderId = ENV.GOOGLE_CONTRACTS_FOLDER_ID || undefined;
      const docTitle = `Contract: ${contract?.templateVersion?.template?.displayName || "Contract"} - ${Date.now()}`;
      googleDocId = await createGoogleDoc(docTitle, folderId);
      logger.log(`✅ Created Google Doc for contract: ${googleDocId}`);
    }

    // Update the Google Doc with rendered HTML content
    await updateGoogleDocWithHtml(googleDocId, previewResult.renderedHtml);
    logger.log(`✅ Updated Google Doc ${googleDocId} with rendered HTML`);

    // Store rendered HTML in data and update unsignedHtmlS3Key and googleDocId
    await prisma.contract.update({
      where: { id: contractId },
      data: {
        data: {
          ...(contract?.data as any),
          renderedHtml: previewResult.renderedHtml,
        } as any,
        unsignedHtmlS3Key: htmlS3Key,
        googleDocId: googleDocId,
        googleDocUrl: getGoogleDocUrl(googleDocId),
      },
    });
  } catch (error) {
    // Log error but don't fail the contract generation
    logger.error(
      "Failed to create/update Google Doc for contract (non-fatal):",
      error,
    );
    // Still update the contract with HTML and S3 key
    await prisma.contract.update({
      where: { id: contractId },
      data: {
        data: {
          ...(contract?.data as any),
          renderedHtml: previewResult.renderedHtml,
        } as any,
        unsignedHtmlS3Key: htmlS3Key,
      },
    });
  }

  return {
    htmlS3Key,
    renderedHtml: previewResult.renderedHtml,
  };
};
