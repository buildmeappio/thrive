import { z } from 'zod';
import { ORGANIZATION_MESSAGES } from '@/constants/messages';

// Address schema
const addressSchema = z.object({
  line1: z
    .string()
    .trim()
    .min(1, ORGANIZATION_MESSAGES.VALIDATION.ADDRESS.REQUIRED)
    .min(4, ORGANIZATION_MESSAGES.VALIDATION.ADDRESS.MIN_LENGTH)
    .max(255, ORGANIZATION_MESSAGES.VALIDATION.ADDRESS.MAX_LENGTH),
  line2: z
    .string()
    .trim()
    .max(255, ORGANIZATION_MESSAGES.VALIDATION.ADDRESS.LINE2_MAX_LENGTH)
    .optional()
    .or(z.literal('')),
  city: z
    .string()
    .trim()
    .min(1, ORGANIZATION_MESSAGES.VALIDATION.ADDRESS.CITY_REQUIRED)
    .min(4, ORGANIZATION_MESSAGES.VALIDATION.ADDRESS.CITY_MIN_LENGTH)
    .max(100, ORGANIZATION_MESSAGES.VALIDATION.ADDRESS.CITY_MAX_LENGTH),
  state: z
    .string()
    .trim()
    .min(1, ORGANIZATION_MESSAGES.VALIDATION.ADDRESS.STATE_REQUIRED)
    .max(100, ORGANIZATION_MESSAGES.VALIDATION.ADDRESS.STATE_MAX_LENGTH),
  postalCode: z
    .string()
    .trim()
    .min(1, ORGANIZATION_MESSAGES.VALIDATION.ADDRESS.POSTAL_CODE_REQUIRED)
    .refine(
      val => {
        // Canadian postal code format: A1A 1A1 or A1A1A1
        return /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(val.trim());
      },
      {
        message: ORGANIZATION_MESSAGES.VALIDATION.ADDRESS.POSTAL_CODE_INVALID,
      }
    ),
  latitude: z
    .number()
    .min(-90, ORGANIZATION_MESSAGES.VALIDATION.ADDRESS.LATITUDE_RANGE)
    .max(90, ORGANIZATION_MESSAGES.VALIDATION.ADDRESS.LATITUDE_RANGE)
    .optional(),
  longitude: z
    .number()
    .min(-180, ORGANIZATION_MESSAGES.VALIDATION.ADDRESS.LONGITUDE_RANGE)
    .max(180, ORGANIZATION_MESSAGES.VALIDATION.ADDRESS.LONGITUDE_RANGE)
    .optional(),
});

// Location schema
export const locationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, ORGANIZATION_MESSAGES.VALIDATION.ADDRESS.NAME_REQUIRED)
    .min(2, ORGANIZATION_MESSAGES.VALIDATION.ADDRESS.NAME_MIN_LENGTH)
    .max(255, ORGANIZATION_MESSAGES.VALIDATION.ADDRESS.NAME_MAX_LENGTH),
  address: addressSchema,
  timezone: z
    .string()
    .trim()
    .min(1, ORGANIZATION_MESSAGES.VALIDATION.ADDRESS.TIMEZONE_REQUIRED)
    .refine(
      val => {
        const timezonePattern = /^[A-Za-z_]+\/[A-Za-z_]+$/;
        return timezonePattern.test(val) || val === 'UTC';
      },
      {
        message: ORGANIZATION_MESSAGES.VALIDATION.ADDRESS.TIMEZONE_INVALID,
      }
    ),
  regionTag: z.string().trim().max(100).optional().or(z.literal('')),
  costCenterCode: z.string().trim().max(100).optional().or(z.literal('')),
  isActive: z.boolean(),
});

export type LocationFormData = z.infer<typeof locationSchema>;

export const locationInitialValues: LocationFormData = {
  name: '',
  address: {
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
  },
  timezone: '',
  regionTag: '',
  costCenterCode: '',
  isActive: true,
};
