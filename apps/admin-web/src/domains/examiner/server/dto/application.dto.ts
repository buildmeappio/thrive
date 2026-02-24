import { ExaminerApplication, Address, Documents, InterviewSlot } from '@thrive/database';
import { ExaminerData } from '@/domains/examiner/types/ExaminerData';

type ApplicationWithRelations = ExaminerApplication & {
  address: Address | null;
  resumeDocument: Documents | null;
  ndaDocument: Documents | null;
  insuranceDocument: Documents | null;
  redactedIMEReportDocument: Documents | null;
  interviewSlots: InterviewSlot[];
  contracts?: Array<any>; // Optional contracts relation
};

export class ApplicationDto {
  static toApplicationData(application: ApplicationWithRelations): ExaminerData {
    // Extract dynamic fee structure from contract if available
    let contractFeeStructure: ExaminerData['contractFeeStructure'] = undefined;
    if (application.contracts && application.contracts.length > 0) {
      const contract = application.contracts[0];
      if (
        contract.feeStructure &&
        contract.data &&
        contract.feeStructure.variables &&
        Array.isArray(contract.feeStructure.variables) &&
        contract.feeStructure.variables.length > 0
      ) {
        const contractData = contract.data as any;
        const feesOverrides = (contract.fieldValues as any)?.fees_overrides || {};
        const fees = contractData.fees || {};

        contractFeeStructure = {
          feeStructureId: contract.feeStructure.id,
          feeStructureName: contract.feeStructure.name,
          variables: contract.feeStructure.variables.map((variable: any) => {
            // Priority: fees_overrides (examiner-specific) > fees (from data) > defaultValue
            let value =
              feesOverrides[variable.key] !== undefined
                ? feesOverrides[variable.key]
                : fees[variable.key] !== undefined
                  ? fees[variable.key]
                  : variable.defaultValue;

            // Extract only the first value before any space (handles "6 4" -> "6")
            // This ensures we only show the examiner-specific override, not the default
            if (value !== null && value !== undefined) {
              // Convert to string and split by space to get the first value
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
            };
          }),
        };
      }
    }

    return {
      id: application.id,
      name: `${application.firstName || ''} ${application.lastName || ''}`.trim(),
      firstName: application.firstName || undefined,
      lastName: application.lastName || undefined,
      specialties: application.specialties || [],
      phone: application.phone || '',
      landlineNumber: application.landlineNumber || undefined,
      email: application.email,
      province: application.provinceOfResidence || '',
      mailingAddress: application.mailingAddress || '',
      addressLookup: application.address?.address || undefined,
      addressStreet: application.address?.street || undefined,
      addressCity: application.address?.city || undefined,
      addressPostalCode: application.address?.postalCode || undefined,
      addressSuite: application.address?.suite || undefined,
      addressProvince: application.address?.province || undefined,
      licenseNumber: application.licenseNumber || '',
      provinceOfLicensure: application.provinceOfLicensure || '',
      licenseExpiryDate: application.licenseExpiryDate?.toISOString() || '',
      cvUrl: undefined, // Will be set by handler with presigned URL
      medicalLicenseUrl: undefined, // Will be set by handler with presigned URL
      medicalLicenseUrls: undefined, // Will be set by handler with presigned URLs
      languagesSpoken: application.languagesSpoken || [],
      yearsOfIMEExperience: String(application.yearsOfIMEExperience || '0'),
      imesCompleted: application.imesCompleted || undefined,
      currentlyConductingIMEs: application.currentlyConductingIMEs || false,
      insurersOrClinics: application.insurersOrClinics || undefined,
      assessmentTypes: application.assessmentTypeIds || [],
      assessmentTypeOther: application.assessmentTypeOther || undefined,
      experienceDetails: application.experienceDetails || '',
      redactedIMEReportUrl: undefined, // Will be set by handler with presigned URL
      insuranceProofUrl: undefined, // Will be set by handler with presigned URL
      signedNdaUrl: undefined, // Will be set by handler with presigned URL
      isForensicAssessmentTrained: application.isForensicAssessmentTrained ?? false,
      agreeToTerms: application.agreeToTerms ?? false,
      contractSignedByExaminerAt:
        application.contractSignedByExaminerAt?.toISOString() || undefined,
      contractConfirmedByAdminAt:
        application.contractConfirmedByAdminAt?.toISOString() || undefined,
      status: application.status as ExaminerData['status'], // Cast ExaminerStatus to ServerStatus (DRAFT is filtered out in queries)
      createdAt: application.createdAt.toISOString(),
      updatedAt: application.updatedAt.toISOString(),
      interviewSlots: application.interviewSlots
        ? application.interviewSlots.map(slot => ({
            id: slot.id,
            status: slot.status,
            startTime: slot.startTime.toISOString(),
            endTime: slot.endTime.toISOString(),
            duration: slot.duration,
          }))
        : undefined,
      feeStructure:
        application.IMEFee !== null &&
        application.recordReviewFee !== null &&
        application.cancellationFee !== null &&
        application.paymentTerms !== null
          ? {
              id: application.id, // Use application ID as temporary ID
              IMEFee: Number(application.IMEFee),
              recordReviewFee: Number(application.recordReviewFee),
              hourlyRate: application.hourlyRate ? Number(application.hourlyRate) : undefined,
              cancellationFee: Number(application.cancellationFee),
              paymentTerms: application.paymentTerms,
            }
          : undefined,
      contractFeeStructure,
    };
  }

  static toApplicationDataList(applications: ApplicationWithRelations[]): ExaminerData[] {
    return applications.map(a => this.toApplicationData(a));
  }
}
