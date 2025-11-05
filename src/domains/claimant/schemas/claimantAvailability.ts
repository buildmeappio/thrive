import ErrorMessages from '@/constants/ErrorMessages';
import { ClaimantPreference } from '@prisma/client';
import { z } from 'zod';

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
    accessibilityNotes: z.string().max(200, 'Notes cannot exceed 200 characters').optional(),

    // Add-on services
    interpreter: z.boolean(),
    interpreterLanguage: z.string().optional(),

    transportation: z.boolean(),
    pickupAddress: z.string().optional(),
    streetAddress: z.string().optional(),
    aptUnitSuite: z.string().optional(),
    city: z.string().optional(),
    postalCode: z
      .string()
      .regex(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, ErrorMessages.INVALID_POSTAL_CODE)
      .optional(),
    province: z.string().optional(),

    chaperone: z.boolean(),

    additionalNotes: z.boolean(),
    additionalNotesText: z.string().optional(),

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
