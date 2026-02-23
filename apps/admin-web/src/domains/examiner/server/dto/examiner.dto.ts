import {
  ExaminerProfile,
  Account,
  User,
  Documents,
  ExaminerLanguage,
  Language,
  ExaminerFeeStructure,
  Address,
  ExaminerStatus,
} from "@prisma/client";
import { ExaminerData } from "@/domains/examiner/types/ExaminerData";
import { listCustomVariables } from "@/domains/custom-variables/server/customVariable.service";

type ExaminerWithRelations = ExaminerProfile & {
  account: Account & {
    user: User;
  };
  address: Address | null;
  resumeDocument: Documents | null;
  ndaDocument: Documents | null;
  insuranceDocument: Documents | null;
  redactedIMEReportDocument: Documents | null;
  examinerLanguages: Array<ExaminerLanguage & { language: Language }>;
  feeStructure: ExaminerFeeStructure[] | null;
  contracts?: Array<any>; // Optional contracts relation
  application?: {
    status: ExaminerStatus;
  } | null; // Linked application for status
};

export class ExaminerDto {
  static async toExaminerData(
    examiner: ExaminerWithRelations,
  ): Promise<ExaminerData> {
    const feeStructure = examiner.feeStructure?.[0];

    // Load custom variables to get checkbox group options
    const customVariables = await listCustomVariables({ isActive: true });
    const customVariablesMap = new Map(customVariables.map((v) => [v.key, v]));

    // Extract dynamic fee structure from contract if available
    let contractFeeStructure: ExaminerData["contractFeeStructure"] = undefined;
    if (examiner.contracts && examiner.contracts.length > 0) {
      const contract = examiner.contracts[0];
      if (
        contract.feeStructure &&
        contract.data &&
        contract.feeStructure.variables &&
        Array.isArray(contract.feeStructure.variables) &&
        contract.feeStructure.variables.length > 0
      ) {
        const contractData = contract.data as any;
        const feesOverrides =
          (contract.fieldValues as any)?.fees_overrides || {};
        const fees = contractData.fees || {};
        const customValues = (contract.fieldValues as any)?.custom || {};

        contractFeeStructure = {
          feeStructureId: contract.feeStructure.id,
          feeStructureName: contract.feeStructure.name,
          variables: contract.feeStructure.variables.map((variable: any) => {
            // Check if this is a custom variable (starts with "custom.")
            // Also check if the key without prefix exists in custom variables
            const customVarKey = variable.key.startsWith("custom.")
              ? variable.key
              : `custom.${variable.key}`;
            const customVar = customVariablesMap.get(customVarKey);

            // Priority: fees_overrides (examiner-specific) > fees (from data) > custom values > defaultValue
            // Check customValues with both the original key and the prefixed key
            let value =
              feesOverrides[variable.key] !== undefined
                ? feesOverrides[variable.key]
                : fees[variable.key] !== undefined
                  ? fees[variable.key]
                  : customValues[variable.key] !== undefined
                    ? customValues[variable.key]
                    : customValues[customVarKey] !== undefined
                      ? customValues[customVarKey]
                      : variable.defaultValue;

            // For checkbox groups, preserve the full value (comma-separated)
            // Don't split by space for checkbox groups
            if (customVar?.variableType === "checkbox_group") {
              // Keep the full comma-separated value for checkbox groups
              // Convert to string if needed, but don't split by space
              if (value !== null && value !== undefined) {
                value = String(value).trim();
              }
            } else if (value !== null && value !== undefined) {
              // Extract only the first value before any space (handles "6 4" -> "6")
              // This ensures we only show the examiner-specific override, not the default
              const valueStr = String(value).trim();

              // Split by space and take only the first part (before the gap)
              const parts = valueStr.split(/\s+/);
              const firstPart = parts[0];

              // Try to convert to number if it's numeric
              const numValue = parseFloat(firstPart);
              if (!isNaN(numValue)) {
                value = numValue;
              } else {
                // Keep as string if not numeric
                value = firstPart;
              }
            }

            return {
              key: variable.key,
              label: variable.label,
              value: value,
              type: variable.type,
              currency: variable.currency,
              decimals: variable.decimals,
              unit: variable.unit,
              included: variable.included ?? false,
              variableType: customVar?.variableType,
              options: customVar?.options || null,
            };
          }),
        };
      }
    }

    return {
      id: examiner.id,
      name: `${examiner.account.user.firstName} ${examiner.account.user.lastName}`.trim(),
      firstName: examiner.account.user.firstName || undefined,
      lastName: examiner.account.user.lastName || undefined,
      specialties: examiner.specialties || [],
      phone: examiner.account.user.phone || "",
      landlineNumber: examiner.landlineNumber || undefined,
      email: examiner.account.user.email,
      province: examiner.provinceOfResidence || "",
      mailingAddress: examiner.mailingAddress || "",
      addressLookup: examiner.address?.address || undefined,
      addressStreet: examiner.address?.street || undefined,
      addressCity: examiner.address?.city || undefined,
      addressPostalCode: examiner.address?.postalCode || undefined,
      addressSuite: examiner.address?.suite || undefined,
      addressProvince: examiner.address?.province || undefined,
      licenseNumber: examiner.licenseNumber || "",
      provinceOfLicensure: examiner.provinceOfLicensure || "",
      licenseExpiryDate: examiner.licenseExpiryDate?.toISOString() || "",
      cvUrl: undefined, // Will be set by handler with presigned URL
      medicalLicenseUrl: undefined, // Will be set by handler with presigned URL
      medicalLicenseUrls: undefined, // Will be set by handler with presigned URLs (for multiple licenses)
      languagesSpoken:
        examiner.examinerLanguages?.map((el) => el.language.name) || [],
      yearsOfIMEExperience: String(examiner.yearsOfIMEExperience || "0"),
      imesCompleted: examiner.imesCompleted || undefined,
      currentlyConductingIMEs: examiner.currentlyConductingIMEs || false,
      insurersOrClinics: examiner.insurersOrClinics || undefined,
      assessmentTypes: examiner.assessmentTypes || [],
      assessmentTypeOther: examiner.assessmentTypeOther || undefined,
      experienceDetails: examiner.experienceDetails || examiner.bio || "",
      redactedIMEReportUrl: undefined, // Will be set by handler with presigned URL
      insuranceProofUrl: undefined, // Will be set by handler with presigned URL
      signedNdaUrl: undefined, // Will be set by handler with presigned URL
      isForensicAssessmentTrained:
        examiner.isForensicAssessmentTrained ?? false,
      agreeToTerms: examiner.agreeToTerms ?? false,
      contractSignedByExaminerAt:
        examiner.contractSignedByExaminerAt?.toISOString() || undefined,
      contractConfirmedByAdminAt:
        examiner.contractConfirmedByAdminAt?.toISOString() || undefined,
      status: (examiner.account.user.status || // Prioritize User.status (new data)
        examiner.status || // Fall back to ExaminerProfile.status (legacy data)
        examiner.application?.status || // Fall back to application status
        "ACTIVE") as ExaminerData["status"], // Default to ACTIVE
      createdAt: examiner.createdAt.toISOString(),
      updatedAt: examiner.updatedAt.toISOString(),
      feeStructure: feeStructure
        ? {
            id: feeStructure.id,
            IMEFee: Number(feeStructure.IMEFee),
            recordReviewFee: Number(feeStructure.recordReviewFee),
            hourlyRate: feeStructure.hourlyRate
              ? Number(feeStructure.hourlyRate)
              : undefined,
            cancellationFee: Number(feeStructure.cancellationFee),
            paymentTerms: feeStructure.paymentTerms,
          }
        : undefined,
      contractFeeStructure,
    };
  }

  static async toExaminerDataList(
    examiners: ExaminerWithRelations[],
  ): Promise<ExaminerData[]> {
    return Promise.all(examiners.map((e) => this.toExaminerData(e)));
  }
}
