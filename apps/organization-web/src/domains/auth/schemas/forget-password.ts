import { z } from 'zod';
import ErrorMessages from '@/constants/ErrorMessages';

// ✅ Schema
export const forgetPasswordSchema = z.object({
  email: z.string().min(1, ErrorMessages.EMAIL_REQUIRED).email(ErrorMessages.INVALID_EMAIL),
});

// ✅ Initial Values
export const forgetPasswordInitialValues: z.infer<typeof forgetPasswordSchema> = {
  email: '',
};

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, ErrorMessages.PASSWORD_REQUIRED)
      .min(8, ErrorMessages.PASSWORD_MIN)
      .regex(/[A-Z]/, ErrorMessages.PASSWORD_UPPERCASE)
      .regex(/[a-z]/, ErrorMessages.PASSWORD_LOWERCASE)
      .regex(/[0-9]/, ErrorMessages.PASSWORD_NUMBER)
      .regex(/[!@#$%^&*(),.?":{}|<>-]/, ErrorMessages.PASSWORD_SPECIAL),
    confirmPassword: z.string().min(1, ErrorMessages.PASSWORD_CONFIRM_REQUIRED),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: ErrorMessages.PASSWORD_CONFIRM,
    path: ['confirmPassword'],
  });

// ✅ Initial Values
export const resetPasswordInitialValues: z.infer<typeof resetPasswordSchema> = {
  password: '',
  confirmPassword: '',
};
