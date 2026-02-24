import ErrorMessages from '@/constants/ErrorMessages';
import { ClaimantPreference } from '@thrive/database';
import { z } from 'zod';
import { containsOnlySpecialChars, getFieldValidationPattern } from '@/utils/fieldValidation';

// Appointment schema
export const appointmentSchema = z
  .object({
    date: z.string().min(1, 'Date is required'),
    time: z.string().min(1, 'Time is required'),
    timeLabel: z.string().min(1, 'Time label is required'),
    // Additional fields for booking (optional, added when slot is selected)
    slotStart: z.string().optional(),
    slotEnd: z.string().optional(),
    examinerId: z.string().optional(),
    interpreterId: z.string().optional(),
    chaperoneId: z.string().optional(),
    transporterId: z.string().optional(),
  })
  .passthrough(); // Allow additional fields that might be added

// Main form schema
export const claimantAvailabilitySchema = z
  .object({
    // Appointment data - Updated for new flow: appointments default to empty array,
    // validated via refine on submission
    appointments: z.array(appointmentSchema),

    preference: z.nativeEnum(ClaimantPreference),
    accessibilityNotes: z
      .string()
      .trim()
      .max(200, 'Notes cannot exceed 200 characters')
      .refine(val => val === '' || !val || val.trim().length > 0, {
        message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
      })
      .refine(val => val === '' || !val || !containsOnlySpecialChars(val), {
        message: ErrorMessages.INVALID_CHARACTERS,
      })
      .optional(),

    // Add-on services
    interpreter: z.boolean(),
    interpreterLanguage: z.string().optional(),

    transportation: z.boolean(),
    pickupAddress: z
      .string()
      .trim()
      .refine(val => val === '' || !val || val.trim().length > 0, {
        message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
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
      .trim()
      .refine(val => val === '' || !val || val.trim().length > 0, {
        message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
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
      .trim()
      .refine(val => val === '' || !val || val.trim().length > 0, {
        message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
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
      .trim()
      .refine(val => val === '' || !val || val.trim().length > 0, {
        message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
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
      .trim()
      .refine(val => val === '' || !val || /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(val), {
        message: ErrorMessages.INVALID_POSTAL_CODE,
      })
      .optional(),
    province: z.string().optional(),

    chaperone: z.boolean(),

    additionalNotes: z.boolean(),
    additionalNotesText: z
      .string()
      .trim()
      .refine(val => val === '' || !val || val.trim().length > 0, {
        message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
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

    agreement: z.boolean(),
  })
  .refine(data => !data.interpreter || (data.interpreter && data.interpreterLanguage), {
    message: 'Please select an interpreter language',
    path: ['interpreterLanguage'],
  })
  .refine(data => !data.transportation || (data.transportation && data.pickupAddress), {
    message: 'Please provide a pickup address for transportation',
    path: ['pickupAddress'],
  })
  .refine(data => data.appointments && data.appointments.length >= 1, {
    message: 'Please select at least 1 appointment option',
    path: ['appointments'],
  })
  .refine(data => data.agreement === true, {
    message: 'Please agree to the terms and conditions',
    path: ['agreement'],
  });

export type ClaimantAvailabilityFormData = z.infer<typeof claimantAvailabilitySchema>;
export type Appointment = z.infer<typeof appointmentSchema>;

export const claimantAvailabilityInitialValues: ClaimantAvailabilityFormData = {
  // Appointment data - starts empty, will be populated when user selects a slot
  appointments: [] as ClaimantAvailabilityFormData['appointments'],
  preference: ClaimantPreference.EITHER,
  accessibilityNotes: '',

  // Add-on services
  interpreter: false,
  interpreterLanguage: '',

  transportation: false,
  pickupAddress: '',
  streetAddress: '',
  aptUnitSuite: '',
  city: '',
  postalCode: undefined,
  province: '',

  chaperone: false,

  additionalNotes: false,
  additionalNotesText: '',

  agreement: false,
};
