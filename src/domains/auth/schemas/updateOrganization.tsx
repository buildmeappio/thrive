import { z } from 'zod';
import ErrorMessages from '@/constants/ErrorMessages';
import { validateCanadianPhoneNumber } from '@/utils/formatNumbers';

export const updateOrganizationSchema = z.object({
  firstName: z.string().optional().or(z.literal('')),
  lastName: z.string().optional().or(z.literal('')),
  email: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(val => !val || z.string().email().safeParse(val).success, {
      message: ErrorMessages.INVALID_EMAIL,
    }),
  phone: z
    .string()
    .refine(val => val === '' || validateCanadianPhoneNumber(val), {
      message: ErrorMessages.INVALID_PHONE_NUMBER,
    })
    .optional(),
  organizationName: z.string().optional().or(z.literal('')),
  website: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(val => !val || z.string().url().safeParse(val).success, {
      message: 'Invalid website URL',
    }),
  organizationTypeId: z.string().optional().or(z.literal('')),
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
