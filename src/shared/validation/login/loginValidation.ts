import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .refine(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), {
      message: 'Invalid email address',
    }),
  password: z.string().min(1, 'Password is required'),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const loginInitialValues = {
  email: '',
  password: '',
};
