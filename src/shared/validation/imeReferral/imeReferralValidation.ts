import ErrorMessages from '@/constants/ErrorMessages';
import { z } from 'zod';
import { DocumentUploadConfig } from '@/shared/config/documentUpload.config';
import { formatFileSize } from '@/shared/utils/documentUpload.utils';

// step1 - claimant details schema
export const ClaimantDetailsSchema = z.object({
  firstName: z
    .string()
    .min(1, ErrorMessages.FIRST_NAME_REQUIRED)
    .regex(/^[A-Za-zÀ-ÿ' -]+$/, ErrorMessages.FIRST_NAME_INVALID),

  lastName: z
    .string()
    .min(1, ErrorMessages.LAST_NAME_REQUIRED)
    .regex(/^[A-Za-zÀ-ÿ' -]+$/, ErrorMessages.LAST_NAME_INVALID),

  dob: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: ErrorMessages.DOB_INVALID,
  }),

  gender: z.string().min(1, ErrorMessages.GENDER_REQUIRED),

  phone: z
    .string()
    .min(1, ErrorMessages.PHONE_REQUIRED)
    .regex(/^\+?1?\d{10}$/, ErrorMessages.INVALID_PHONE_NUMBER),

  email: z.string().email(ErrorMessages.INVALID_EMAIL).min(1, ErrorMessages.EMAIL_REQUIRED),

  addressLookup: z.string().min(5, ErrorMessages.ADDRESS_LOOKUP_REQUIRED),

  street: z.string().optional(),
  apt: z.string().optional(),

  city: z.string().optional(),

  postalCode: z
    .string()
    .regex(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, ErrorMessages.INVALID_POSTAL_CODE)
    .optional(),

  province: z.string().optional(),
});

export type ClaimantDetails = z.infer<typeof ClaimantDetailsSchema>;

export const ClaimantDetailsInitialValues: ClaimantDetails = {
  firstName: '',
  lastName: '',
  dob: '',
  gender: '',
  phone: '',
  email: '',
  addressLookup: '',
  street: '',
  apt: '',
  city: '',
  postalCode: '',
  province: '',
};

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

// step2 - CaseInfo schema
export const CaseInfoSchema = z.object({
  reason: z.string().min(1, 'Reason for referral is required'),
  caseType: z.string().min(1, 'Case type is required'),
  urgencyLevel: z.string().min(1, 'Urgency level is required'),
  examFormat: z.string().min(1, 'Exam format is required'),
  requestedSpecialty: z.string().min(1, 'Requested specialty is required'),
  preferredLocation: z.string().min(1, 'Preferred location is required'),
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

export type CaseInfo = z.infer<typeof CaseInfoSchema>;

export const CaseInitialValues: CaseInfo = {
  reason: '',
  caseType: '',
  urgencyLevel: '',
  examFormat: '',
  requestedSpecialty: '',
  preferredLocation: '',
  files: [],
};

// step3 - Consent
export const ConsentSchema = z.object({
  consentForSubmission: z.boolean().refine(val => val === true, {
    message: ErrorMessages.CONSENT_REQUIRED,
  }),
});

export type Consent = z.infer<typeof ConsentSchema>;

export const ConsentInitialValues: Consent = {
  consentForSubmission: false,
};
