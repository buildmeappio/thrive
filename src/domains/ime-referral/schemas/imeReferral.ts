import ErrorMessages from '@/constants/ErrorMessages';
import { z } from 'zod';
import { DocumentUploadConfig } from '@/config/documentUpload';
import { formatFileSize } from '@/utils/documentUpload';

// File validation schema
const FileSchema = z.instanceof(File).superRefine((file, ctx) => {
  if (file.size <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${ErrorMessages.FILE_CORRUPTED}: ${file.name || 'Unknown file'}`,
    });
  }

  if (file.size > DocumentUploadConfig.MAX_FILE_SIZE) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${file.name || 'Unknown file'}: ${ErrorMessages.FILE_TOO_LARGE} ${formatFileSize(DocumentUploadConfig.MAX_FILE_SIZE)}`,
    });
  }

  type AllowedMimeType = (typeof DocumentUploadConfig.ALLOWED_FILE_TYPES)[number];

  if (!(DocumentUploadConfig.ALLOWED_FILE_TYPES as readonly string[]).includes(file.type)) {
    const _narrow: AllowedMimeType | undefined = file.type as AllowedMimeType;
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${file.name || 'Unknown file'}: ${ErrorMessages.INVALID_FILE_TYPE} (${file.type || 'Unknown type'})`,
    });
  }

  if (file.name.length > DocumentUploadConfig.MAX_FILENAME_LENGTH) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${file.name || 'Unknown file'}: ${ErrorMessages.FILE_NAME_TOO_LONG}`,
    });
  }
});

// Step 1 - Claimant Details Schema
export const ClaimantDetailsSchema = z.object({
  firstName: z
    .string()
    .min(1, ErrorMessages.FIRST_NAME_REQUIRED)
    .regex(/^[A-Za-zÀ-ÿ' -]+$/, ErrorMessages.FIRST_NAME_INVALID),

  lastName: z
    .string()
    .min(1, ErrorMessages.LAST_NAME_REQUIRED)
    .regex(/^[A-Za-zÀ-ÿ' -]+$/, ErrorMessages.LAST_NAME_INVALID),

  dateOfBirth: z
    .string()
    .min(1, ErrorMessages.DOB_REQUIRED)
    .refine(val => !isNaN(Date.parse(val)), {
      message: ErrorMessages.DOB_INVALID,
    })
    .refine(
      val => {
        const selectedDate = new Date(val);
        const today = new Date();
        return selectedDate <= today;
      },
      {
        message: ErrorMessages.DOB_FUTURE_DATE_NOT_ALLOWED,
      }
    ),

  gender: z.string().min(1, ErrorMessages.GENDER_REQUIRED),

  phoneNumber: z
    .string()
    .min(1, ErrorMessages.PHONE_REQUIRED)
    .regex(/^\+?1?\d{10}$/, ErrorMessages.INVALID_PHONE_NUMBER),

  emailAddress: z.string().email(ErrorMessages.INVALID_EMAIL).min(1, ErrorMessages.EMAIL_REQUIRED),

  addressLookup: z.string().min(5, ErrorMessages.ADDRESS_LOOKUP_REQUIRED),

  street: z.string().min(1, ErrorMessages.STREET_ADDRESS_REQUIRED),
  suite: z.string().min(1, ErrorMessages.SUITE_REQUIRED),
  city: z.string().min(1, ErrorMessages.CITY_REQUIRED),

  postalCode: z
    .string()
    .regex(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, ErrorMessages.INVALID_POSTAL_CODE)
    .min(1, ErrorMessages.POSTAL_CODE_REQUIRED),

  province: z.string().min(1, ErrorMessages.PROVINCE_REQUIRED),

  // family doctor fields
  relatedCasesDetails: z.string().min(1, ErrorMessages.RELATED_CASES_DETAILS_REQUIRED),
  familyDoctorName: z.string().min(1, ErrorMessages.FAMILY_DOCTOR_NAME_REQUIRED),
  familyDoctorEmail: z
    .string()
    .email(ErrorMessages.INVALID_EMAIL)
    .min(1, ErrorMessages.FAMILY_DOCTOR_EMAIL_REQUIRED),
  familyDoctorPhone: z.string().min(1, ErrorMessages.FAMILY_DOCTOR_PHONE_REQUIRED),
  familyDoctorFax: z.string().min(1, ErrorMessages.FAMILY_DOCTOR_FAX_REQUIRED),
});

export type ClaimantDetails = z.infer<typeof ClaimantDetailsSchema>;

export const ClaimantDetailsInitialValues: ClaimantDetails = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  phoneNumber: '',
  emailAddress: '',
  addressLookup: '',
  street: '',
  suite: '',
  city: '',
  postalCode: '',
  province: '',
  relatedCasesDetails: '',
  familyDoctorName: '',
  familyDoctorEmail: '',
  familyDoctorPhone: '',
  familyDoctorFax: '',
};

// Step 2 - Organization Details Schema
export const LegalInsuranceDetailsSchema = z.object({
  // Legal Representative fields
  legalCompanyName: z
    .string()
    .min(1, ErrorMessages.COMPANY_NAME_REQUIRED)
    .regex(/^[A-Za-zÀ-ÿ' -]+$/, ErrorMessages.COMPANY_NAME_INVALID),

  legalContactPerson: z
    .string()
    .min(1, ErrorMessages.CONTACT_PERSON_REQUIRED)
    .regex(/^[A-Za-zÀ-ÿ' -]+$/, ErrorMessages.CONTACT_PERSON_INVALID),

  legalPhone: z
    .string()
    .min(1, ErrorMessages.PHONE_REQUIRED)
    .regex(/^\+?1?\d{10}$/, ErrorMessages.INVALID_PHONE_NUMBER),

  legalFaxNo: z
    .string()
    .min(1, ErrorMessages.FAX_REQUIRED)
    .regex(/^\+?1?\d{10}$/, ErrorMessages.INVALID_FAX_NUMBER),

  legalAddressLookup: z.string().min(5, ErrorMessages.ADDRESS_LOOKUP_REQUIRED),
  legalStreetAddress: z.string().min(1, ErrorMessages.STREET_ADDRESS_REQUIRED),
  legalAptUnitSuite: z.string().min(1, ErrorMessages.SUITE_REQUIRED),
  legalCity: z.string().min(1, ErrorMessages.CITY_REQUIRED),
  legalPostalCode: z
    .string()
    .regex(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, ErrorMessages.INVALID_POSTAL_CODE)
    .min(1, ErrorMessages.POSTAL_CODE_REQUIRED),
  legalProvinceState: z.string().min(1, ErrorMessages.PROVINCE_REQUIRED),

  // Insurance Details fields
  insuranceCompanyName: z.string().min(1, 'Insurance company name is required'),
  insuranceAdjusterContact: z.string().min(1, 'Adjuster/contact is required'),
  insurancePolicyNo: z.string().min(1, 'Policy number is required'),
  insuranceClaimNo: z.string().min(1, 'Claim number is required'),
  insuranceDateOfLoss: z.string().min(1, 'Date of loss is required'),
  insuranceAddressLookup: z.string().min(5, ErrorMessages.ADDRESS_LOOKUP_REQUIRED),
  insuranceStreetAddress: z.string().min(1, ErrorMessages.STREET_ADDRESS_REQUIRED),
  insuranceAptUnitSuite: z.string().min(1, ErrorMessages.SUITE_REQUIRED),
  insuranceCity: z.string().min(1, ErrorMessages.CITY_REQUIRED),
  insurancePhone: z
    .string()
    .min(1, 'Phone is required')
    .regex(/^\+?1?\d{10}$/, 'Invalid phone number'),
  insuranceFaxNo: z
    .string()
    .min(1, 'Fax number is required')
    .regex(/^\+?1?\d{10}$/, 'Invalid fax number'),
  insuranceEmailAddress: z.string().email('Invalid email address').min(1, 'Email is required'),

  // Policy Holder fields
  policyHolderSameAsClaimant: z.boolean().optional(),
  policyHolderFirstName: z.string().min(1, 'First name is required'),
  policyHolderLastName: z.string().min(1, 'Last name is required'),
});

export type LegalInsuranceDetails = z.infer<typeof LegalInsuranceDetailsSchema>;

export const LegalInsuranceDetailsInitialValues: LegalInsuranceDetails = {
  legalCompanyName: '',
  legalContactPerson: '',
  legalPhone: '',
  legalFaxNo: '',
  legalAddressLookup: '',
  legalStreetAddress: '',
  legalAptUnitSuite: '',
  legalCity: '',
  legalPostalCode: '',
  legalProvinceState: '',

  // Insurance fields
  insuranceCompanyName: '',
  insuranceAdjusterContact: '',
  insurancePolicyNo: '',
  insuranceClaimNo: '',
  insuranceDateOfLoss: '',
  insuranceAddressLookup: '',
  insuranceStreetAddress: '',
  insuranceAptUnitSuite: '',
  insuranceCity: '',
  insurancePhone: '',
  insuranceFaxNo: '',
  insuranceEmailAddress: '',

  // Policy holder fields
  policyHolderSameAsClaimant: false,
  policyHolderFirstName: '',
  policyHolderLastName: '',
};

// Step 3 - Exam Type Selection Schema
export const ExamTypeItemSchema = z.object({
  id: z.string(),
  label: z.string(),
});

// Step 3 - Exam Type Selection Schema
export const ExamTypeSchema = z.object({
  examTypes: z.array(ExamTypeItemSchema).min(1, 'At least one exam type must be selected'),
});

export type ExamTypeItem = z.infer<typeof ExamTypeItemSchema>;
export type ExamType = z.infer<typeof ExamTypeSchema>;

export const ExamTypeInitialValues: ExamType = {
  examTypes: [],
};

// step 4 - Exam Details Schema

const BaseExaminationSchema = z.object({
  reasonForReferral: z.string().min(1, ErrorMessages.REASON_FOR_REFERRAL_REQUIRED),
  examinationType: z.string().min(1, ErrorMessages.CASE_TYPE_REQUIRED),
});

export const createExaminationSchema = (examTypes: { id: string; label: string }[] = []) => {
  const dynamicFields: Record<string, z.ZodTypeAny> = {};

  examTypes.forEach(examType => {
    const fieldPrefix = examType.label.toLowerCase().replace(/\s+/g, '');

    // Required fields
    dynamicFields[`${fieldPrefix}UrgencyLevel`] = z
      .string()
      .min(1, ErrorMessages.URGENCY_LEVEL_REQUIRED);
    dynamicFields[`${fieldPrefix}DueDate`] = z.string().min(1, ErrorMessages.DUE_DATE_REQUIRED);
    dynamicFields[`${fieldPrefix}Instructions`] = z
      .string()
      .min(1, ErrorMessages.INSTRUCTIONS_REQUIRED);
  });

  return BaseExaminationSchema.extend(dynamicFields);
};

export const ExaminationSchema = BaseExaminationSchema.catchall(z.any());

export type Examination = z.infer<typeof ExaminationSchema> & Record<string, any>;

// Initial values
export const ExaminationInitialValues = {
  reasonForReferral: '',
  examinationType: '',
};

export type ExaminationBase = {
  reasonForReferral: string;
  examinationType: string;
};

export type DynamicExaminationFields = {
  [K: `${string}UrgencyLevel`]: string;
} & {
  [K: `${string}DueDate`]: string;
} & {
  [K: `${string}Instructions`]: string | undefined;
};

export type ExaminationData = ExaminationBase & Partial<DynamicExaminationFields>;

// step5 - Document Upload Schema

export const DocumentUploadSchema = z.object({
  files: z
    .array(FileSchema)
    .min(1, ErrorMessages.DOCUMENT_UPLOAD_REQUIRED)
    .max(
      DocumentUploadConfig.MAX_FILES_COUNT,
      `${ErrorMessages.TOO_MANY_FILES} (maximum ${DocumentUploadConfig.MAX_FILES_COUNT} files allowed)`
    )
    .refine(
      files => {
        const seen = new Set();
        for (const file of files) {
          const key = `${file.name}-${file.size}`;
          if (seen.has(key)) {
            return false;
          }
          seen.add(key);
        }
        return true;
      },
      {
        message: ErrorMessages.DUPLICATE_FILE,
      }
    ),
});

export type DocumentUploadFormData = z.infer<typeof DocumentUploadSchema>;

export const DocumentUploadInitialValues: DocumentUploadFormData = {
  files: [],
};

// Step 6 - Review & Submit Schema
export const ConsentSchema = z.object({
  consentForSubmission: z.boolean().refine(val => val === true, {
    message: ErrorMessages.CONSENT_REQUIRED,
  }),
  isDraft: z.boolean().optional(),
});

export type Consent = z.infer<typeof ConsentSchema>;

export const ConsentInitialValues: Consent = {
  consentForSubmission: false,
  isDraft: false,
};
