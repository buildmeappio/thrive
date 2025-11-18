import { z } from 'zod';
import ErrorMessages from '@/constants/ErrorMessages';

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, ErrorMessages.PASSWORD_REQUIRED),
    newPassword: z
      .string()
      .min(1, ErrorMessages.PASSWORD_REQUIRED)
      .min(8, ErrorMessages.PASSWORD_MIN)
      .regex(/[A-Z]/, ErrorMessages.PASSWORD_UPPERCASE)
      .regex(/[a-z]/, ErrorMessages.PASSWORD_LOWERCASE)
      .regex(/[0-9]/, ErrorMessages.PASSWORD_NUMBER)
      .regex(/[!@#$%^&*(),.?":{}|<>]/, ErrorMessages.PASSWORD_SPECIAL),
    confirmNewPassword: z.string().min(1, ErrorMessages.PASSWORD_CONFIRM_REQUIRED),
  })
  .superRefine((data, ctx) => {
    // This runs even if other fields have errors
    if (
      data.confirmNewPassword &&
      data.newPassword &&
      data.confirmNewPassword !== data.newPassword
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: ErrorMessages.PASSWORD_CONFIRM,
        path: ['confirmNewPassword'],
      });
    }
  });

// ✅ Initial Values
export const changePasswordInitialValues: z.infer<typeof changePasswordSchema> = {
  oldPassword: '',
  newPassword: '',
  confirmNewPassword: '',
};
