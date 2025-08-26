import { z } from 'zod';
import { ExaminerSpecialty, Province } from '@prisma/client';

// Step 1: Personal Information
export const examinerPersonalInfoSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name is too long')
    .regex(
      /^[a-zA-Z\s-']+$/,
      'First name can only contain letters, spaces, hyphens, and apostrophes'
    ),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name is too long')
    .regex(
      /^[a-zA-Z\s-']+$/,
      'Last name can only contain letters, spaces, hyphens, and apostrophes'
    ),
  phone: z
    .string()
    .regex(/^(\+1-?)?[0-9]{3}-?[0-9]{3}-?[0-9]{4}$/, 'Please enter a valid Canadian phone number'),
  dateOfBirth: z
    .string()
    .refine(val => !isNaN(Date.parse(val)), 'Please enter a valid date')
    .transform(val => new Date(val)),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']).optional(),
});

export type ExaminerPersonalInfoSchema = z.infer<typeof examinerPersonalInfoSchema>;

// Step 2: Professional License
export const examinerLicenseSchema = z.object({
  licenseNumber: z
    .string()
    .min(1, 'License number is required')
    .max(20, 'License number is too long'),
  licenseProvince: z.nativeEnum(Province, {
    message: 'Please select a valid Canadian province',
  }),
  licenseExpiryDate: z
    .string()
    .refine(val => !isNaN(Date.parse(val)), 'Please enter a valid date')
    .transform(val => new Date(val))
    .refine(date => date > new Date(), 'License expiry date must be in the future'),
  secondaryLicenses: z
    .array(
      z.object({
        licenseNumber: z.string().min(1, 'License number is required'),
        province: z.nativeEnum(Province),
        expiryDate: z.string().transform(val => new Date(val)),
        type: z.string().min(1, 'License type is required'),
      })
    )
    .optional(),
});

export type ExaminerLicenseSchema = z.infer<typeof examinerLicenseSchema>;

// Step 3: Professional Details
export const examinerProfessionalSchema = z.object({
  specialties: z
    .array(z.nativeEnum(ExaminerSpecialty))
    .min(1, 'At least one specialty is required')
    .max(5, 'Maximum 5 specialties allowed'),
  subSpecialties: z
    .array(z.string().min(1, 'Sub-specialty cannot be empty'))
    .max(10, 'Maximum 10 sub-specialties allowed')
    .optional(),
  yearsExperience: z
    .number()
    .min(0, 'Years of experience cannot be negative')
    .max(60, 'Years of experience seems too high'),
  languagesSpoken: z
    .array(z.string().min(1, 'Language cannot be empty'))
    .min(1, 'At least one language is required'),
  certifiedIn: z.array(z.string().min(1, 'Certification cannot be empty')).optional(),
});

export type ExaminerProfessionalSchema = z.infer<typeof examinerProfessionalSchema>;

// Step 4: Practice Information
export const examinerPracticeSchema = z.object({
  practiceType: z.enum(['Private', 'Hospital', 'Clinic', 'Academic', 'Government', 'Other']),
  clinicName: z.string().min(1, 'Clinic/Practice name is required').max(100),
  clinicAffiliation: z.string().max(100).optional(),
  hospitalPrivileges: z
    .array(
      z.object({
        hospitalName: z.string().min(1, 'Hospital name is required'),
        department: z.string().optional(),
        privilegeType: z.string().optional(),
      })
    )
    .optional(),
  practiceAddress: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    province: z.nativeEnum(Province),
    postalCode: z
      .string()
      .regex(/^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/, 'Please enter a valid Canadian postal code'),
    country: z.string().default('Canada'),
  }),
  mailingAddress: z
    .object({
      street: z.string().min(1, 'Street address is required'),
      city: z.string().min(1, 'City is required'),
      province: z.nativeEnum(Province),
      postalCode: z
        .string()
        .regex(/^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/, 'Please enter a valid Canadian postal code'),
      country: z.string().default('Canada'),
    })
    .optional(),
  emergencyContact: z.object({
    name: z.string().min(1, 'Emergency contact name is required'),
    relationship: z.string().min(1, 'Relationship is required'),
    phone: z
      .string()
      .regex(
        /^(\+1-?)?[0-9]{3}-?[0-9]{3}-?[0-9]{4}$/,
        'Please enter a valid Canadian phone number'
      ),
    email: z.string().email('Please enter a valid email address').optional(),
  }),
});

export type ExaminerPracticeSchema = z.infer<typeof examinerPracticeSchema>;

// Step 5: Education & Credentials
export const examinerEducationSchema = z.object({
  medicalSchool: z.string().min(1, 'Medical school is required'),
  graduationYear: z
    .number()
    .min(1950, 'Graduation year seems too early')
    .max(new Date().getFullYear(), 'Graduation year cannot be in the future'),
  residencyProgram: z.string().optional(),
  residencyYear: z.number().optional(),
  fellowshipProgram: z.string().optional(),
  fellowshipYear: z.number().optional(),
  boardCertifications: z
    .array(
      z.object({
        certification: z.string().min(1, 'Certification name is required'),
        issuingBody: z.string().min(1, 'Issuing body is required'),
        dateObtained: z.string().transform(val => new Date(val)),
        expiryDate: z
          .string()
          .transform(val => new Date(val))
          .optional(),
        certificateNumber: z.string().optional(),
      })
    )
    .optional(),
});

export type ExaminerEducationSchema = z.infer<typeof examinerEducationSchema>;

// Step 6: IME Experience
export const examinerIMESchema = z.object({
  imeTraining: z
    .array(
      z.object({
        courseName: z.string().min(1, 'Course name is required'),
        provider: z.string().min(1, 'Training provider is required'),
        completionDate: z.string().transform(val => new Date(val)),
        certificateNumber: z.string().optional(),
      })
    )
    .optional(),
  imeCertifications: z
    .array(
      z.object({
        certification: z.string().min(1, 'Certification name is required'),
        issuingBody: z.string().min(1, 'Issuing body is required'),
        dateObtained: z.string().transform(val => new Date(val)),
        expiryDate: z
          .string()
          .transform(val => new Date(val))
          .optional(),
      })
    )
    .optional(),
  imeExperience: z.number().min(0).max(50).optional(),
  imeVolume: z.number().min(0).max(1000).optional(),
});

export type ExaminerIMESchema = z.infer<typeof examinerIMESchema>;

// Step 7: Insurance & Legal
export const examinerInsuranceSchema = z.object({
  malpracticeInsurance: z.object({
    provider: z.string().min(1, 'Insurance provider is required'),
    policyNumber: z.string().min(1, 'Policy number is required'),
    coverageAmount: z.number().min(1, 'Coverage amount is required'),
    expiryDate: z.string().transform(val => new Date(val)),
  }),
  malpracticeHistory: z
    .array(
      z.object({
        claimDate: z.string().transform(val => new Date(val)),
        description: z.string().min(1, 'Description is required'),
        outcome: z.string().min(1, 'Outcome is required'),
        amountPaid: z.number().optional(),
      })
    )
    .optional(),
  disciplinaryHistory: z
    .array(
      z.object({
        date: z.string().transform(val => new Date(val)),
        issuingBody: z.string().min(1, 'Issuing body is required'),
        description: z.string().min(1, 'Description is required'),
        outcome: z.string().min(1, 'Outcome is required'),
      })
    )
    .optional(),
  criminalBackground: z.object({
    hasConvictions: z.boolean(),
    convictions: z
      .array(
        z.object({
          date: z.string().transform(val => new Date(val)),
          description: z.string().min(1, 'Description is required'),
          disposition: z.string().min(1, 'Disposition is required'),
        })
      )
      .optional(),
  }),
});

export type ExaminerInsuranceSchema = z.infer<typeof examinerInsuranceSchema>;

// Step 8: Availability & Rates
export const examinerAvailabilitySchema = z.object({
  availableForIme: z.boolean().default(true),
  hourlyRate: z.number().min(0).optional(),
  halfDayRate: z.number().min(0).optional(),
  fullDayRate: z.number().min(0).optional(),
  reportRate: z.number().min(0).optional(),
  travelRate: z.number().min(0).optional(),
  travelRadius: z.number().min(0).max(1000).optional(),
  workingHours: z
    .object({
      monday: z.object({ start: z.string(), end: z.string(), available: z.boolean() }),
      tuesday: z.object({ start: z.string(), end: z.string(), available: z.boolean() }),
      wednesday: z.object({ start: z.string(), end: z.string(), available: z.boolean() }),
      thursday: z.object({ start: z.string(), end: z.string(), available: z.boolean() }),
      friday: z.object({ start: z.string(), end: z.string(), available: z.boolean() }),
      saturday: z.object({ start: z.string(), end: z.string(), available: z.boolean() }),
      sunday: z.object({ start: z.string(), end: z.string(), available: z.boolean() }),
    })
    .optional(),
  timeOffPeriods: z
    .array(
      z.object({
        startDate: z.string().transform(val => new Date(val)),
        endDate: z.string().transform(val => new Date(val)),
        reason: z.string().optional(),
      })
    )
    .optional(),
});

export type ExaminerAvailabilitySchema = z.infer<typeof examinerAvailabilitySchema>;

// Step 9: Consent & Compliance
export const examinerConsentSchema = z.object({
  consentGiven: z
    .boolean()
    .refine(val => val === true, 'You must agree to the privacy policy to continue'),
  privacyPolicyAccepted: z
    .boolean()
    .refine(val => val === true, 'You must accept the privacy policy'),
  dataRetentionConsent: z
    .boolean()
    .refine(val => val === true, 'You must consent to data retention policies'),
  professionalCodeAccepted: z
    .boolean()
    .refine(val => val === true, 'You must accept the professional code of conduct'),
});

export type ExaminerConsentSchema = z.infer<typeof examinerConsentSchema>;

// Complete profile schema
export const completeExaminerProfileSchema = examinerPersonalInfoSchema
  .merge(examinerLicenseSchema)
  .merge(examinerProfessionalSchema)
  .merge(examinerPracticeSchema)
  .merge(examinerEducationSchema)
  .merge(examinerIMESchema)
  .merge(examinerInsuranceSchema)
  .merge(examinerAvailabilitySchema)
  .merge(examinerConsentSchema);

export type CompleteExaminerProfileSchema = z.infer<typeof completeExaminerProfileSchema>;

// Document upload schema
export const examinerDocumentSchema = z.object({
  documentType: z.enum([
    'medical_license',
    'cv_document',
    'malpractice_doc',
    'certificates',
    'transcripts',
    'reference_letters',
    'photo_id',
  ]),
  fileName: z.string().min(1, 'File name is required'),
  fileSize: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'),
  mimeType: z.string().min(1, 'File type is required'),
  documentPath: z.string().min(1, 'Document path is required'),
});

export type ExaminerDocumentSchema = z.infer<typeof examinerDocumentSchema>;
