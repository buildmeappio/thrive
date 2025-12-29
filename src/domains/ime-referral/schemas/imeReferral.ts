import ErrorMessages from '@/constants/ErrorMessages';
import { z } from 'zod';
import { DocumentUploadConfig } from '@/config/documentUpload';
import { formatFileSize } from '@/utils/documentUpload';
import { validateCanadianPhoneNumber } from '@/utils/formatNumbers';
import { containsOnlySpecialChars, getFieldValidationPattern } from '@/utils/fieldValidation';

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
  claimType: z.string().min(1, 'Claim type is required'),
  firstName: z
    .string()
    .trim()
    .min(1, ErrorMessages.FIRST_NAME_REQUIRED)
    .refine(val => val.trim().length > 0, {
      message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
    })
    .min(4, ErrorMessages.FIRST_NAME_MIN)
    .regex(/^[A-Za-zÀ-ÿ' ](?:[A-Za-zÀ-ÿ' -]*[A-Za-zÀ-ÿ])?$/, ErrorMessages.NAME_INVALID)
    .max(100, ErrorMessages.NAME_TOO_LONG),

  lastName: z
    .string()
    .trim()
    .min(1, ErrorMessages.LAST_NAME_REQUIRED)
    .refine(val => val.trim().length > 0, {
      message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
    })
    .min(4, ErrorMessages.LAST_NAME_MIN)
    .regex(/^[A-Za-zÀ-ÿ' ](?:[A-Za-zÀ-ÿ' -]*[A-Za-zÀ-ÿ])?$/, ErrorMessages.NAME_INVALID)
    .max(100, ErrorMessages.NAME_TOO_LONG),

  addressLookup: z
    .string()
    .min(5, ErrorMessages.ADDRESS_LOOKUP_REQUIRED)
    .refine(val => val.trim().length > 0, {
      message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
    })
    .refine(val => !containsOnlySpecialChars(val), {
      message: ErrorMessages.ADDRESS_LOOKUP_INVALID_CHARS,
    })
    .refine(
      val => {
        const pattern = getFieldValidationPattern('addressLookup');
        return pattern ? pattern.test(val.trim()) : true;
      },
      {
        message: ErrorMessages.ADDRESS_LOOKUP_INVALID_CHARS,
      }
    ),

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
    .refine(val => val === '' || validateCanadianPhoneNumber(val), {
      message: ErrorMessages.INVALID_PHONE_NUMBER,
    })
    .optional(),

  emailAddress: z
    .string()
    .refine(val => val === '' || z.string().email().safeParse(val).success, {
      message: ErrorMessages.INVALID_EMAIL,
    })
    .optional(),

  street: z
    .string()
    .trim()
    .refine(val => val === '' || val.trim().length > 0, {
      message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
    })
    .refine(val => val === '' || val.length >= 5, {
      message: ErrorMessages.STREET_ADDRESS_MIN,
    })
    .refine(val => val === '' || !containsOnlySpecialChars(val), {
      message: ErrorMessages.STREET_ADDRESS_INVALID,
    })
    .refine(
      val => {
        if (val === '') return true;
        const pattern = getFieldValidationPattern('streetAddress');
        return pattern ? pattern.test(val.trim()) : true;
      },
      {
        message: ErrorMessages.STREET_ADDRESS_INVALID,
      }
    )
    .optional(),
  suite: z
    .string()
    .trim()
    .refine(val => val === '' || val.trim().length > 0, {
      message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
    })
    .refine(val => val === '' || val.length >= 2, {
      message: ErrorMessages.SUITE_MIN,
    })
    .refine(val => val === '' || !containsOnlySpecialChars(val), {
      message: ErrorMessages.INVALID_CHARACTERS,
    })
    .refine(
      val => {
        if (val === '') return true;
        const pattern = getFieldValidationPattern('aptUnitSuite');
        return pattern ? pattern.test(val.trim()) : true;
      },
      {
        message: ErrorMessages.INVALID_CHARACTERS,
      }
    )
    .optional(),
  city: z
    .string()
    .trim()
    .refine(val => val === '' || val.trim().length > 0, {
      message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
    })
    .refine(val => val === '' || val.length >= 5, {
      message: ErrorMessages.CITY_MIN_OPTIONAL,
    })
    .refine(val => val === '' || !containsOnlySpecialChars(val), {
      message: ErrorMessages.CITY_INVALID_CHARS,
    })
    .refine(
      val => {
        if (val === '') return true;
        const pattern = getFieldValidationPattern('city');
        return pattern ? pattern.test(val.trim()) : true;
      },
      {
        message: ErrorMessages.CITY_INVALID_CHARS,
      }
    )
    .optional(),

  postalCode: z
    .string()
    .refine(val => val === '' || /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(val), {
      message: ErrorMessages.INVALID_POSTAL_CODE,
    })
    .optional(),

  province: z.string().optional(),

  // Optional family doctor fields
  relatedCasesDetails: z
    .string()
    .trim()
    .refine(val => val === '' || val.trim().length > 0, {
      message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
    })
    .refine(val => val === '' || val.length >= 10, {
      message: ErrorMessages.RELATED_CASES_MIN,
    })
    .refine(val => val === '' || !containsOnlySpecialChars(val), {
      message: ErrorMessages.INVALID_CHARACTERS,
    })
    .refine(
      val => {
        if (val === '') return true;
        const pattern = getFieldValidationPattern('relatedCases');
        return pattern ? pattern.test(val.trim()) : true;
      },
      {
        message: ErrorMessages.INVALID_CHARACTERS,
      }
    )
    .optional(),
  familyDoctorName: z
    .string()
    .trim()
    .refine(val => val === '' || val.length >= 5, {
      message: ErrorMessages.FAMILY_DOCTOR_NAME_MIN,
    })
    .refine(val => val === '' || /^[A-Za-zÀ-ÿ]*$/.test(val), {
      message: ErrorMessages.FAMILY_DOCTOR_NAME_INVALID,
    })
    .optional(),

  familyDoctorEmail: z
    .string()
    .refine(val => val === '' || z.string().email().safeParse(val).success, {
      message: ErrorMessages.INVALID_EMAIL,
    })
    .optional(),

  familyDoctorPhone: z
    .string()
    .refine(val => val === '' || validateCanadianPhoneNumber(val), {
      message: ErrorMessages.INVALID_PHONE_NUMBER,
    })
    .optional(),

  familyDoctorFax: z
    .string()
    .refine(val => val === '' || validateCanadianPhoneNumber(val), {
      message: ErrorMessages.INVALID_FAX_NUMBER,
    })
    .optional(),
});

export type ClaimantDetails = z.infer<typeof ClaimantDetailsSchema>;

// initial values
export const ClaimantDetailsInitialValues: ClaimantDetails = {
  claimType: '',
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
  insuranceCompanyName: z
    .string()
    .trim()
    .min(1, 'Insurance company name is required')
    .refine(val => val.trim().length > 0, {
      message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
    })
    .min(3, ErrorMessages.COMPANY_NAME_MIN)
    .refine(val => !containsOnlySpecialChars(val), {
      message: ErrorMessages.ORGANIZATION_NAME_INVALID,
    })
    .refine(
      val => {
        const pattern = getFieldValidationPattern('companyName');
        return pattern ? pattern.test(val.trim()) : true;
      },
      {
        message: ErrorMessages.ORGANIZATION_NAME_INVALID,
      }
    ),
  insuranceAdjusterContact: z
    .string()
    .trim()
    .min(1, 'Adjuster/contact is required')
    .refine(val => val.trim().length > 0, {
      message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
    })
    .min(4, ErrorMessages.ADJUSTER_CONTACT_MIN)
    .regex(/^[A-Za-zÀ-ÿ' -]+$/, 'Adjuster/contact is invalid'),
  insurancePolicyNo: z
    .string()
    .trim()
    .min(1, 'Policy number is required')
    .refine(val => val.trim().length > 0, {
      message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
    })
    .min(3, ErrorMessages.POLICY_NUMBER_MIN)
    .refine(val => !containsOnlySpecialChars(val), {
      message: ErrorMessages.INVALID_CHARACTERS,
    })
    .refine(
      val => {
        const pattern = getFieldValidationPattern('policyNumber');
        return pattern ? pattern.test(val.trim()) : true;
      },
      {
        message: ErrorMessages.INVALID_CHARACTERS,
      }
    ),
  insuranceClaimNo: z
    .string()
    .trim()
    .min(1, 'Claim number is required')
    .refine(val => val.trim().length > 0, {
      message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
    })
    .min(3, ErrorMessages.CLAIM_NUMBER_MIN)
    .refine(val => !containsOnlySpecialChars(val), {
      message: ErrorMessages.INVALID_CHARACTERS,
    })
    .refine(
      val => {
        const pattern = getFieldValidationPattern('claimNumber');
        return pattern ? pattern.test(val.trim()) : true;
      },
      {
        message: ErrorMessages.INVALID_CHARACTERS,
      }
    ),
  insuranceDateOfLoss: z.string().min(1, 'Date of loss is required'),

  // Optional address fields
  insuranceAddressLookup: z.string().trim().optional(),
  insurancePostalCode: z
    .string()
    .refine(val => val === '' || /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(val), {
      message: ErrorMessages.INVALID_POSTAL_CODE,
    })
    .optional(),
  insuranceProvince: z.string().optional(),
  insuranceStreetAddress: z
    .string()
    .trim()
    .refine(val => val === '' || val.trim().length > 0, {
      message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
    })
    .refine(val => val === '' || val.length >= 5, {
      message: ErrorMessages.STREET_ADDRESS_MIN,
    })
    .refine(val => val === '' || !containsOnlySpecialChars(val), {
      message: ErrorMessages.STREET_ADDRESS_INVALID,
    })
    .refine(
      val => {
        if (val === '') return true;
        const pattern = getFieldValidationPattern('streetAddress');
        return pattern ? pattern.test(val.trim()) : true;
      },
      {
        message: ErrorMessages.STREET_ADDRESS_INVALID,
      }
    )
    .optional(),
  insuranceAptUnitSuite: z
    .string()
    .trim()
    .refine(val => val === '' || val.trim().length > 0, {
      message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
    })
    .refine(val => val === '' || val.length >= 2, {
      message: ErrorMessages.SUITE_MIN,
    })
    .refine(val => val === '' || !containsOnlySpecialChars(val), {
      message: ErrorMessages.INVALID_CHARACTERS,
    })
    .refine(
      val => {
        if (val === '') return true;
        const pattern = getFieldValidationPattern('aptUnitSuite');
        return pattern ? pattern.test(val.trim()) : true;
      },
      {
        message: ErrorMessages.INVALID_CHARACTERS,
      }
    )
    .optional(),
  insuranceCity: z
    .string()
    .trim()
    .refine(val => val === '' || val.trim().length > 0, {
      message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
    })
    .refine(val => val === '' || val.length >= 5, {
      message: ErrorMessages.CITY_MIN_OPTIONAL,
    })
    .refine(val => val === '' || !containsOnlySpecialChars(val), {
      message: ErrorMessages.CITY_INVALID_CHARS,
    })
    .refine(
      val => {
        if (val === '') return true;
        const pattern = getFieldValidationPattern('city');
        return pattern ? pattern.test(val.trim()) : true;
      },
      {
        message: ErrorMessages.CITY_INVALID_CHARS,
      }
    )
    .optional(),

  insurancePhone: z
    .string()
    .refine(val => val === '' || validateCanadianPhoneNumber(val), {
      message: ErrorMessages.INVALID_PHONE_NUMBER,
    })
    .min(1, 'Phone number is required'),

  insuranceFaxNo: z.string().min(1, 'Fax number is required').refine(validateCanadianPhoneNumber, {
    message: ErrorMessages.INVALID_FAX_NUMBER,
  }),
  insuranceEmailAddress: z.string().email('Invalid email address').min(1, 'Email is required'),

  // Policy Holder fields
  policyHolderSameAsClaimant: z.boolean().optional(),
  policyHolderFirstName: z.string().trim().min(1, 'First name is required'),
  policyHolderLastName: z.string().trim().min(1, 'Last name is required'),
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
  insurancePostalCode: '',
  insuranceProvince: '',
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
    .trim()
    .refine(val => val === '' || val.length >= 3, {
      message: ErrorMessages.LEGAL_COMPANY_NAME_MIN,
    })
    .refine(val => val === '' || !containsOnlySpecialChars(val), {
      message: ErrorMessages.ORGANIZATION_NAME_INVALID,
    })
    .refine(
      val => {
        if (val === '') return true;
        const pattern = getFieldValidationPattern('companyName');
        return pattern ? pattern.test(val.trim()) : true;
      },
      {
        message: ErrorMessages.ORGANIZATION_NAME_INVALID,
      }
    )
    .optional(),

  legalContactPerson: z
    .string()
    .trim()
    .refine(val => val === '' || val.length >= 4, {
      message: ErrorMessages.LEGAL_CONTACT_PERSON_MIN,
    })
    .refine(val => val === '' || !containsOnlySpecialChars(val), {
      message: ErrorMessages.CONTACT_PERSON_INVALID,
    })
    .refine(
      val => {
        if (val === '') return true;
        const pattern = getFieldValidationPattern('contactPerson');
        return pattern ? pattern.test(val.trim()) : true;
      },
      {
        message: ErrorMessages.CONTACT_PERSON_INVALID,
      }
    )
    .optional(),

  legalPhone: z
    .string()
    .refine(val => val === '' || validateCanadianPhoneNumber(val), {
      message: ErrorMessages.INVALID_PHONE_NUMBER,
    })
    .optional(),

  legalFaxNo: z
    .string()
    .refine(val => val === '' || validateCanadianPhoneNumber(val), {
      message: ErrorMessages.INVALID_FAX_NUMBER,
    })
    .optional(),

  legalAddressLookup: z.string().trim().optional(),
  legalStreetAddress: z
    .string()
    .trim()
    .refine(val => val === '' || val.trim().length > 0, {
      message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
    })
    .refine(val => val === '' || val.length >= 5, {
      message: ErrorMessages.STREET_ADDRESS_MIN,
    })
    .refine(val => val === '' || !containsOnlySpecialChars(val), {
      message: ErrorMessages.STREET_ADDRESS_INVALID,
    })
    .refine(
      val => {
        if (val === '') return true;
        const pattern = getFieldValidationPattern('streetAddress');
        return pattern ? pattern.test(val.trim()) : true;
      },
      {
        message: ErrorMessages.STREET_ADDRESS_INVALID,
      }
    )
    .optional(),
  legalAptUnitSuite: z
    .string()
    .trim()
    .refine(val => val === '' || val.trim().length > 0, {
      message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
    })
    .refine(val => val === '' || val.length >= 2, {
      message: ErrorMessages.SUITE_MIN,
    })
    .refine(val => val === '' || !containsOnlySpecialChars(val), {
      message: ErrorMessages.INVALID_CHARACTERS,
    })
    .refine(
      val => {
        if (val === '') return true;
        const pattern = getFieldValidationPattern('aptUnitSuite');
        return pattern ? pattern.test(val.trim()) : true;
      },
      {
        message: ErrorMessages.INVALID_CHARACTERS,
      }
    )
    .optional(),
  legalCity: z
    .string()
    .trim()
    .refine(val => val === '' || val.trim().length > 0, {
      message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
    })
    .refine(val => val === '' || val.length >= 5, {
      message: ErrorMessages.CITY_MIN_OPTIONAL,
    })
    .refine(val => val === '' || !containsOnlySpecialChars(val), {
      message: ErrorMessages.CITY_INVALID_CHARS,
    })
    .refine(
      val => {
        if (val === '') return true;
        const pattern = getFieldValidationPattern('city');
        return pattern ? pattern.test(val.trim()) : true;
      },
      {
        message: ErrorMessages.CITY_INVALID_CHARS,
      }
    )
    .optional(),
  legalPostalCode: z
    .union([
      z.string().regex(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, ErrorMessages.INVALID_POSTAL_CODE),
      z.literal(''),
    ])
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
const ExaminationServiceSchema = z.object({
  type: z.enum(['transportation', 'interpreter', 'chaperone']),
  enabled: z.boolean(),
  details: z
    .object({
      // Transportation
      pickupAddress: z
        .string()
        .refine(val => val === '' || !val || val.trim().length > 0, {
          message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
        })
        .refine(val => val === '' || !val || val.length >= 5, {
          message: ErrorMessages.PICKUP_ADDRESS_MIN,
        })
        .refine(val => val === '' || !val || !containsOnlySpecialChars(val), {
          message: ErrorMessages.STREET_ADDRESS_INVALID,
        })
        .refine(
          val => {
            if (val === '' || !val) return true;
            const pattern = getFieldValidationPattern('pickupAddress');
            return pattern ? pattern.test(val.trim()) : true;
          },
          {
            message: ErrorMessages.STREET_ADDRESS_INVALID,
          }
        )
        .optional(),
      streetAddress: z
        .string()
        .refine(val => val === '' || !val || val.trim().length > 0, {
          message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
        })
        .refine(val => val === '' || !val || val.length >= 5, {
          message: ErrorMessages.STREET_ADDRESS_MIN,
        })
        .refine(val => val === '' || !val || !containsOnlySpecialChars(val), {
          message: ErrorMessages.STREET_ADDRESS_INVALID,
        })
        .refine(
          val => {
            if (val === '' || !val) return true;
            const pattern = getFieldValidationPattern('streetAddress');
            return pattern ? pattern.test(val.trim()) : true;
          },
          {
            message: ErrorMessages.STREET_ADDRESS_INVALID,
          }
        )
        .optional(),
      aptUnitSuite: z
        .string()
        .refine(val => val === '' || !val || val.trim().length > 0, {
          message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
        })
        .refine(val => val === '' || !val || val.length >= 2, {
          message: ErrorMessages.SUITE_MIN,
        })
        .refine(val => val === '' || !val || !containsOnlySpecialChars(val), {
          message: ErrorMessages.INVALID_CHARACTERS,
        })
        .refine(
          val => {
            if (val === '' || !val) return true;
            const pattern = getFieldValidationPattern('aptUnitSuite');
            return pattern ? pattern.test(val.trim()) : true;
          },
          {
            message: ErrorMessages.INVALID_CHARACTERS,
          }
        )
        .optional(),
      city: z
        .string()
        .refine(val => val === '' || !val || val.trim().length > 0, {
          message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
        })
        .refine(val => val === '' || !val || val.length >= 5, {
          message: ErrorMessages.CITY_MIN_OPTIONAL,
        })
        .refine(val => val === '' || !val || !containsOnlySpecialChars(val), {
          message: ErrorMessages.CITY_INVALID_CHARS,
        })
        .refine(
          val => {
            if (val === '' || !val) return true;
            const pattern = getFieldValidationPattern('city');
            return pattern ? pattern.test(val.trim()) : true;
          },
          {
            message: ErrorMessages.CITY_INVALID_CHARS,
          }
        )
        .optional(),
      postalCode: z
        .string()
        .refine(val => val === '' || !val || /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(val), {
          message: ErrorMessages.INVALID_POSTAL_CODE,
        })
        .optional(),
      province: z.string().optional(),
      // Interpreter
      language: z.string().optional(),
      // Additional notes
      notes: z
        .string()
        .refine(val => val === '' || !val || val.trim().length > 0, {
          message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
        })
        .refine(val => val === '' || !val || val.length >= 10, {
          message: ErrorMessages.NOTES_MIN,
        })
        .refine(val => val === '' || !val || !containsOnlySpecialChars(val), {
          message: ErrorMessages.INVALID_CHARACTERS,
        })
        .refine(
          val => {
            if (val === '' || !val) return true;
            const pattern = getFieldValidationPattern('notes');
            return pattern ? pattern.test(val.trim()) : true;
          },
          {
            message: ErrorMessages.INVALID_CHARACTERS,
          }
        )
        .optional(),
    })
    .optional(),
});

// Individual Examination Details Schema
const ExaminationDetailsSchema = z.object({
  examinationTypeId: z.string().min(1, 'Examination type is required'),
  urgencyLevel: z.string().min(1, 'Urgency level is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  instructions: z
    .string()
    .trim()
    .min(1, 'Instructions are required')
    .refine(val => val.trim().length > 0, {
      message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
    })
    .min(10, ErrorMessages.INSTRUCTIONS_MIN)
    .refine(val => !containsOnlySpecialChars(val), {
      message: ErrorMessages.INVALID_CHARACTERS,
    })
    .refine(
      val => {
        const pattern = getFieldValidationPattern('instructions');
        return pattern ? pattern.test(val.trim()) : true;
      },
      {
        message: ErrorMessages.INVALID_CHARACTERS,
      }
    ),
  selectedBenefits: z.array(z.string()).min(1, 'At least one benefit must be selected'),
  locationType: z.string().min(1, 'Location type is required'),
  services: z.array(ExaminationServiceSchema),
  additionalNotes: z
    .string()
    .trim()
    .refine(val => val === '' || !val || val.trim().length > 0, {
      message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
    })
    .refine(val => val === '' || !val || val.length >= 10, {
      message: ErrorMessages.ADDITIONAL_NOTES_MIN,
    })
    .refine(val => val === '' || !val || !containsOnlySpecialChars(val), {
      message: ErrorMessages.INVALID_CHARACTERS,
    })
    .refine(
      val => {
        if (val === '' || !val) return true;
        const pattern = getFieldValidationPattern('notes');
        return pattern ? pattern.test(val.trim()) : true;
      },
      {
        message: ErrorMessages.INVALID_CHARACTERS,
      }
    )
    .optional(),
  supportPerson: z.boolean().optional(),
});

// Main Examination Schema (Step 5)
export const ExaminationSchema = z
  .object({
    reasonForReferral: z
      .string()
      .trim()
      .min(1, 'Reason for referral is required')
      .refine(val => val.trim().length > 0, {
        message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
      })
      .min(10, ErrorMessages.REASON_FOR_REFERRAL_MIN)
      .refine(val => !containsOnlySpecialChars(val), {
        message: ErrorMessages.INVALID_CHARACTERS,
      })
      .refine(
        val => {
          const pattern = getFieldValidationPattern('reason');
          return pattern ? pattern.test(val.trim()) : true;
        },
        {
          message: ErrorMessages.INVALID_CHARACTERS,
        }
      ),
    examinationType: z.string().min(1, 'Case type is required'),
    examinations: z.array(ExaminationDetailsSchema).min(1, 'At least one examination is required'),
  })
  .refine(
    data => {
      // Validate transportation services have required fields
      return data.examinations.every(exam =>
        exam.services.every(service => {
          if (service.type === 'transportation' && service.enabled) {
            return (
              service.details?.pickupAddress && service.details.pickupAddress.trim().length > 0
            );
          }
          return true;
        })
      );
    },
    {
      message: 'Pickup address is required when transportation is enabled',
      path: ['examinations'],
    }
  )
  .refine(
    data => {
      // Validate interpreter services have required fields
      return data.examinations.every(exam =>
        exam.services.every(service => {
          if (service.type === 'interpreter' && service.enabled) {
            return service.details?.language && service.details.language.trim().length > 0;
          }
          return true;
        })
      );
    },
    {
      message: 'Language is required when interpreter is enabled',
      path: ['examinations'],
    }
  );

// Exam Type Item Schema (for step 4)
export const ExamTypeItemSchema = z.object({
  id: z.string(),
  label: z.string(),
});

export const ExamTypeSchema = z.object({
  caseTypes: z.array(ExamTypeItemSchema).min(1, 'At least one exam type must be selected'),
});

// Types
export type ExaminationService = z.infer<typeof ExaminationServiceSchema>;
export type ExaminationDetails = z.infer<typeof ExaminationDetailsSchema>;
export type ExaminationData = z.infer<typeof ExaminationSchema>;
export type ExamTypeItem = z.infer<typeof ExamTypeItemSchema>;
export type ExamType = z.infer<typeof ExamTypeSchema>;

export interface ExaminationType {
  id: string;
  label: string;
}

// Initial Values
export const ExaminationInitialValues: ExaminationData = {
  reasonForReferral: '',
  examinationType: '',
  examinations: [],
};

export const ExamTypeInitialValues: ExamType = {
  caseTypes: [],
};

// Helper functions to create services
export const createTransportationService = (enabled: boolean = false): ExaminationService => ({
  type: 'transportation',
  enabled,
  details: {
    pickupAddress: '',
    streetAddress: '',
    aptUnitSuite: '',
    city: '',
    postalCode: '',
    province: '',
  },
});

export const createInterpreterService = (enabled: boolean = false): ExaminationService => ({
  type: 'interpreter',
  enabled,
  details: {
    language: '',
  },
});

export const createChaperoneService = (enabled: boolean = false): ExaminationService => ({
  type: 'chaperone',
  enabled,
  details: {},
});

// Helper function to create default examination details
export const createExaminationDetails = (examinationTypeId: string): ExaminationDetails => ({
  examinationTypeId,
  urgencyLevel: '',
  dueDate: '',
  instructions: '',
  selectedBenefits: [],
  locationType: '',
  services: [createTransportationService(), createInterpreterService(), createChaperoneService()],
  additionalNotes: '',
  supportPerson: false,
});

// Helper functions for form data transformation
export const getServiceByType = (
  services: ExaminationService[],
  type: ExaminationService['type']
): ExaminationService | undefined => {
  return services.find(service => service.type === type);
};

export const updateServiceInArray = (
  services: ExaminationService[],
  type: ExaminationService['type'],
  updates: Partial<ExaminationService>
): ExaminationService[] => {
  return services.map(service => (service.type === type ? { ...service, ...updates } : service));
};

// step5 - Document Upload Schema

export const DocumentUploadSchema = z
  .object({
    files: z
      .array(FileSchema)
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
    // .default([]),
    deletedDocuments: z.array(z.string()),
    existingDocumentsCount: z.number(),
  })
  .refine(
    data => {
      // Calculate total remaining documents
      const newFilesCount = data.files.length;
      const remainingExistingCount = data.existingDocumentsCount - data.deletedDocuments.length;
      const totalDocuments = newFilesCount + remainingExistingCount;

      return totalDocuments >= 1;
    },
    {
      message: ErrorMessages.DOCUMENT_UPLOAD_REQUIRED,
      path: ['files'],
    }
  );

export type DocumentUploadFormData = z.infer<typeof DocumentUploadSchema>;

export const DocumentUploadInitialValues: DocumentUploadFormData = {
  files: [],
  deletedDocuments: [],
  existingDocumentsCount: 0,
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
