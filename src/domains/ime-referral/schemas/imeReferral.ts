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
  // Required fields
  firstName: z
    .string()
    .min(1, ErrorMessages.FIRST_NAME_REQUIRED)
    .regex(/^[A-Za-zÀ-ÿ' -]+$/, ErrorMessages.FIRST_NAME_INVALID),

  lastName: z
    .string()
    .min(1, ErrorMessages.LAST_NAME_REQUIRED)
    .regex(/^[A-Za-zÀ-ÿ' -]+$/, ErrorMessages.LAST_NAME_INVALID),

  addressLookup: z.string().min(5, ErrorMessages.ADDRESS_LOOKUP_REQUIRED),

  // Optional fields - use .optional() to make them not required
  dateOfBirth: z
    .string()
    .refine(val => val === '' || !isNaN(Date.parse(val)), {
      message: ErrorMessages.DOB_INVALID,
    })
    .refine(
      val => {
        if (val === '') return true; // Allow empty string
        const selectedDate = new Date(val);
        const today = new Date();
        return selectedDate <= today;
      },
      {
        message: ErrorMessages.DOB_FUTURE_DATE_NOT_ALLOWED,
      }
    )
    .optional(),

  gender: z.string().optional(),

  phoneNumber: z
    .string()
    .refine(val => val === '' || /^\+?1?\d{10}$/.test(val), {
      message: ErrorMessages.INVALID_PHONE_NUMBER,
    })
    .optional(),

  emailAddress: z
    .string()
    .refine(val => val === '' || z.string().email().safeParse(val).success, {
      message: ErrorMessages.INVALID_EMAIL,
    })
    .optional(),

  street: z.string().optional(),
  suite: z.string().optional(),
  city: z.string().optional(),

  postalCode: z
    .string()
    .refine(val => val === '' || /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(val), {
      message: ErrorMessages.INVALID_POSTAL_CODE,
    })
    .optional(),

  province: z.string().optional(),

  // Optional family doctor fields
  relatedCasesDetails: z.string().optional(),
  familyDoctorName: z.string().optional(),
  familyDoctorEmail: z
    .string()
    .refine(val => val === '' || z.string().email().safeParse(val).success, {
      message: ErrorMessages.INVALID_EMAIL,
    })
    .optional(),

  familyDoctorPhone: z.string().optional(),
  familyDoctorFax: z.string().optional(),
});

export type ClaimantDetails = z.infer<typeof ClaimantDetailsSchema>;

// initial values
export const ClaimantDetailsInitialValues: ClaimantDetails = {
  firstName: '',
  lastName: '',
  addressLookup: '',
  dateOfBirth: '',
  gender: '',
  phoneNumber: '',
  emailAddress: '',
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

// Step 2 - Insurance Details Schema
export const InsuranceDetailsSchema = z.object({
  insuranceCompanyName: z.string().min(1, 'Insurance company name is required'),
  insuranceAdjusterContact: z.string().min(1, 'Adjuster/contact is required'),
  insurancePolicyNo: z.string().min(1, 'Policy number is required'),
  insuranceClaimNo: z.string().min(1, 'Claim number is required'),
  insuranceDateOfLoss: z.string().min(1, 'Date of loss is required'),

  // Optional address fields
  insuranceAddressLookup: z.string().optional(),
  insuranceStreetAddress: z.string().optional(),
  insuranceAptUnitSuite: z.string().optional(),
  insuranceCity: z.string().optional(),

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

export type InsuranceDetails = z.infer<typeof InsuranceDetailsSchema>;

export const InsuranceDetailsInitialValues: InsuranceDetails = {
  insuranceCompanyName: '',
  insuranceAdjusterContact: '',
  insurancePolicyNo: '',
  insuranceClaimNo: '',
  insuranceDateOfLoss: '',
  // Optional address fields - can be undefined or empty strings
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
export const LegalDetailsSchema = z.object({
  // Legal Representative fields - all optional
  legalCompanyName: z
    .string()
    .regex(/^[A-Za-zÀ-ÿ' -]+$/, ErrorMessages.COMPANY_NAME_INVALID)
    .optional(),

  legalContactPerson: z
    .string()
    .regex(/^[A-Za-zÀ-ÿ' -]+$/, ErrorMessages.CONTACT_PERSON_INVALID)
    .optional(),

  legalPhone: z
    .string()
    .regex(/^\+?1?\d{10}$/, ErrorMessages.INVALID_PHONE_NUMBER)
    .optional(),

  legalFaxNo: z
    .string()
    .regex(/^\+?1?\d{10}$/, ErrorMessages.INVALID_FAX_NUMBER)
    .optional(),

  legalAddressLookup: z.string().optional(),
  legalStreetAddress: z.string().optional(),
  legalAptUnitSuite: z.string().optional(),
  legalCity: z.string().optional(),
  legalPostalCode: z
    .string()
    .regex(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, ErrorMessages.INVALID_POSTAL_CODE)
    .optional(),
  legalProvinceState: z.string().optional(),
});

export type LegalDetails = z.infer<typeof LegalDetailsSchema>;

export const LegalDetailsInitialValues: LegalDetails = {
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
