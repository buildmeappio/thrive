import { z } from 'zod';
import ErrorMessages from '@/constants/ErrorMessages';
import { validateCanadianPhoneNumber } from '@/utils/formatNumbers';

export const updateOrganizationSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, ErrorMessages.FIRST_NAME_REQUIRED)
    .min(4, ErrorMessages.FIRST_NAME_MIN)
    .regex(/^[A-Za-zÀ-ÿ' ](?:[A-Za-zÀ-ÿ' -]*[A-Za-zÀ-ÿ])?$/, ErrorMessages.NAME_INVALID)
    .max(100, ErrorMessages.NAME_TOO_LONG),
  lastName: z
    .string()
    .trim()
    .min(1, ErrorMessages.LAST_NAME_REQUIRED)
    .min(4, ErrorMessages.LAST_NAME_MIN)
    .regex(/^[A-Za-zÀ-ÿ' ](?:[A-Za-zÀ-ÿ' -]*[A-Za-zÀ-ÿ])?$/, ErrorMessages.NAME_INVALID)
    .max(100, ErrorMessages.NAME_TOO_LONG),
  email: z.string().email(ErrorMessages.INVALID_EMAIL).min(1, ErrorMessages.EMAIL_REQUIRED),
  phone: z
    .string()
    .min(1, ErrorMessages.PHONE_REQUIRED)
    .refine(val => validateCanadianPhoneNumber(val), {
      message: ErrorMessages.INVALID_PHONE_NUMBER,
    }),
  organizationName: z
    .string()
    .trim()
    .min(1, ErrorMessages.ORGANIZATION_NAME_REQUIRED)
    .min(6, ErrorMessages.ORGANIZATION_NAME_MIN),
  website: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(val => !val || z.string().url().safeParse(val).success, {
      message: ErrorMessages.INVALID_URL,
    }),
  organizationTypeId: z.string().min(1, ErrorMessages.ORGANIZATION_TYPE_REQUIRED),
});

export const updateOrganizationInitialValues: z.infer<typeof updateOrganizationSchema> = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  organizationName: '',
  website: '',
  organizationTypeId: '',
};
