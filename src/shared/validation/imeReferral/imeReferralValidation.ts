import { z } from 'zod';

// step1
export const ClaimantDetailsSchema = z.object({
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  dob: z.string().min(1, 'Date of Birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  addressLookup: z.string().min(5, 'Address lookup must be at least 5 characters'),
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
  reason: z.string().min(1, 'Referral reason is required'),
  caseType: z.string().min(1, 'Case Type is required'),
  urgencyLevel: z.string().min(1, 'Urgency Level is required'),
  examFormat: z.string().min(1, 'Exam Format is required'),
  requestedSpecialty: z.string().min(1, 'Requested Specialty is required'),
  preferredLocation: z.string().min(1, 'Preferred Location is required'),
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
    message: 'You must confirm that the claimant has provided informed consent.',
  }),
});

export type Consent = z.infer<typeof ConsentSchema>;

export const ConsentInitialValues: Consent = {
  consentConfirmation: false,
};

// step4

export const DocumentUploadSchema = z.object({
  files: z.array(z.instanceof(File)).nonempty('You must upload at least one document.'),
});

export type DocumentUploadSchema = z.infer<typeof DocumentUploadSchema>;

export const DocumentUploadInitialValues: DocumentUploadSchema = {
  files: [],
};
