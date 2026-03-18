import { z } from 'zod';

export const roleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Role name is required')
    .min(2, 'Role name must be at least 2 characters')
    .max(255, 'Role name must be less than 255 characters'),
  key: z
    .string()
    .trim()
    .min(1, 'Role key is required')
    .max(255, 'Role key must be less than 255 characters')
    .regex(/^[A-Z_]+$/, 'Role key must be uppercase with underscores only'),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  isDefault: z.boolean(),
});

export type RoleFormData = z.infer<typeof roleSchema>;

export const roleInitialValues: RoleFormData = {
  name: '',
  key: '',
  description: '',
  isDefault: false,
};
