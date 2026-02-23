import { z } from 'zod';
import ErrorMessages from '@/constants/ErrorMessages';
import { containsOnlySpecialChars, getFieldValidationPattern } from '@/utils/fieldValidation';

// Address schema with comprehensive validation
const addressSchema = z.object({
  line1: z
    .string()
    .trim()
    .min(1, ErrorMessages.ADDRESS_LINE1_REQUIRED)
    .refine(val => val.trim().length > 0, {
      message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
    })
    .min(4, ErrorMessages.STREET_MIN)
    .max(255, 'Address line 1 must be less than 255 characters')
    .refine(val => !containsOnlySpecialChars(val), {
      message: ErrorMessages.STREET_ADDRESS_INVALID,
    })
    .refine(
      val => {
        const pattern = getFieldValidationPattern('streetAddress');
        return pattern ? pattern.test(val.trim()) : true;
      },
      {
        message: ErrorMessages.STREET_ADDRESS_INVALID,
      }
    ),
  line2: z
    .string()
    .trim()
    .max(255, 'Address line 2 must be less than 255 characters')
    .optional()
    .or(z.literal('')),
  city: z
    .string()
    .trim()
    .min(1, ErrorMessages.ADDRESS_CITY_REQUIRED)
    .refine(val => val.trim().length > 0, {
      message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
    })
    .min(4, ErrorMessages.CITY_MIN)
    .max(100, 'City must be less than 100 characters')
    .refine(val => !containsOnlySpecialChars(val), {
      message: ErrorMessages.CITY_INVALID_CHARS,
    })
    .refine(
      val => {
        const pattern = getFieldValidationPattern('city');
        return pattern ? pattern.test(val.trim()) : true;
      },
      {
        message: ErrorMessages.CITY_INVALID_CHARS,
      }
    ),
  state: z
    .string()
    .trim()
    .min(1, ErrorMessages.ADDRESS_STATE_REQUIRED)
    .refine(val => val.trim().length > 0, {
      message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
    })
    .max(100, 'State/Province must be less than 100 characters'),
  postalCode: z
    .string()
    .trim()
    .min(1, ErrorMessages.ADDRESS_POSTAL_CODE_REQUIRED)
    .refine(val => val.trim().length > 0, {
      message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
    }),
  country: z
    .string()
    .trim()
    .min(1, ErrorMessages.ADDRESS_COUNTRY_REQUIRED)
    .refine(val => val.trim().length > 0, {
      message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
    })
    .refine(val => ['CA', 'US'].includes(val), {
      message: 'Country must be Canada or United States',
    }),
  county: z
    .string()
    .trim()
    .max(100, 'County/Region must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  latitude: z
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90')
    .optional(),
  longitude: z
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180')
    .optional(),
});

// Location schema with comprehensive validation
export const locationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, ErrorMessages.LOCATION_NAME_REQUIRED)
      .refine(val => val.trim().length > 0, {
        message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
      })
      .min(2, 'Location name must be at least 2 characters')
      .max(255, 'Location name must be less than 255 characters')
      .refine(val => !containsOnlySpecialChars(val), {
        message: ErrorMessages.ORGANIZATION_NAME_INVALID,
      })
      .refine(
        val => {
          const pattern = getFieldValidationPattern('organizationName');
          return pattern ? pattern.test(val.trim()) : true;
        },
        {
          message: ErrorMessages.ORGANIZATION_NAME_INVALID,
        }
      ),
    address: addressSchema,
    timezone: z
      .string()
      .trim()
      .min(1, ErrorMessages.TIMEZONE_REQUIRED)
      .refine(val => val.trim().length > 0, {
        message: ErrorMessages.FIELD_CANNOT_BE_ONLY_SPACES,
      })
      .refine(
        val => {
          // Validate IANA timezone format
          const timezonePattern = /^[A-Za-z_]+\/[A-Za-z_]+$/;
          return timezonePattern.test(val) || val === 'UTC';
        },
        {
          message: 'Please select a valid timezone',
        }
      ),
    regionTag: z
      .string()
      .trim()
      .max(100, 'Region tag must be less than 100 characters')
      .refine(
        val => {
          if (!val || val.trim().length === 0) return true;
          return !containsOnlySpecialChars(val);
        },
        {
          message: 'Region tag contains invalid characters',
        }
      )
      .optional()
      .or(z.literal('')),
    costCenterCode: z
      .string()
      .trim()
      .max(100, 'Cost center code must be less than 100 characters')
      .refine(
        val => {
          if (!val || val.trim().length === 0) return true;
          // Allow alphanumeric, hyphens, underscores, and spaces
          return /^[A-Za-z0-9\s_-]+$/.test(val);
        },
        {
          message:
            'Cost center code can only contain letters, numbers, spaces, hyphens, and underscores',
        }
      )
      .optional()
      .or(z.literal('')),
    isActive: z.boolean().default(true),
  })
  .refine(
    data => {
      // Validate postal code based on country
      const postalCode = data.address.postalCode.trim();
      const country = data.address.country;

      if (country === 'CA') {
        // Canadian postal code format: A1A 1A1 or A1A1A1
        return /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(postalCode);
      } else if (country === 'US') {
        // US ZIP code format: 12345 or 12345-6789
        return /^\d{5}(-\d{4})?$/.test(postalCode);
      }
      // For other countries, allow alphanumeric with spaces and hyphens
      return /^[A-Za-z0-9\s-]{3,20}$/.test(postalCode);
    },
    {
      message: ErrorMessages.INVALID_POSTAL_CODE,
      path: ['address', 'postalCode'],
    }
  );

export type LocationFormData = z.infer<typeof locationSchema>;

export const locationInitialValues: LocationFormData = {
  name: '',
  address: {
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'CA',
    county: '',
  },
  timezone: '',
  regionTag: '',
  costCenterCode: '',
  isActive: true,
};
