import ErrorMessages from '@/constants/ErrorMessages';
import { z } from 'zod';

// step1
export const ClaimantDetailsSchema = z.object({
  firstName: z.string().min(1, ErrorMessages.FIRST_NAME_REQUIRED),
  lastName: z.string().min(1, ErrorMessages.LAST_NAME_REQUIRED),
  dob: z.string().min(1, ErrorMessages.DOB_REQUIRED),
  gender: z.string().min(1, ErrorMessages.GENDER_REQUIRED),
  phone: z.string().min(1, ErrorMessages.PHONE_REQUIRED),
  email: z.string().email(ErrorMessages.INVALID_EMAIL).min(1, ErrorMessages.EMAIL_REQUIRED),
  addressLookup: z.string().min(5, ErrorMessages.ADDRESS_LOOKUP_REQUIRED),
  street: z.string().optional(),
  apt: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
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

// step2
export const CaseInfoSchema = z.object({
  reason: z.string().min(1, ErrorMessages.REFERRAL_REASON_REQUIRED),
  caseType: z.string().min(1, ErrorMessages.CASE_TYPE_REQUIRED),
  urgencyLevel: z.string().min(1, ErrorMessages.URGENCY_LEVEL_REQUIRED),
  examFormat: z.string().min(1, ErrorMessages.EXAM_FORMAT_REQUIRED),
  requestedSpecialty: z.string().min(1, ErrorMessages.REQUESTED_SPECIALTY_REQUIRED),
  preferredLocation: z.string().min(1, ErrorMessages.PREFERRED_LOCATION_REQUIRED),
});

export type CaseInfo = z.infer<typeof CaseInfoSchema>;

export const CaseInfoInitialValues: CaseInfo = {
  reason: '',
  caseType: '',
  urgencyLevel: '',
  examFormat: '',
  requestedSpecialty: '',
  preferredLocation: '',
};

// step3

export const ConsentSchema = z.object({
  consentConfirmation: z.boolean().refine(val => val === true, {
    message: ErrorMessages.CONSENT_REQUIRED,
  }),
});

export type Consent = z.infer<typeof ConsentSchema>;

export const ConsentInitialValues: Consent = {
  consentConfirmation: false,
};

// step4

export const DocumentUploadSchema = z.object({
  files: z.array(z.instanceof(File)).nonempty(ErrorMessages.DOCUMENT_UPLOAD_REQUIRED),
});

export type DocumentUploadSchema = z.infer<typeof DocumentUploadSchema>;

export const DocumentUploadInitialValues: DocumentUploadSchema = {
  files: [],
};
