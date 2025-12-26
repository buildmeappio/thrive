import { z } from "zod";

export const createCustomVariableSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(255)
    .regex(
      /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/,
      "Key must be in format 'namespace.key' (e.g., 'thrive.company_name', 'custom.copyright')",
    ),
  defaultValue: z.string().min(1),
  description: z.string().max(500).optional().nullable(),
});

export const updateCustomVariableSchema = z.object({
  id: z.string().uuid(),
  key: z
    .string()
    .min(1)
    .max(255)
    .regex(
      /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/,
      "Key must be in format 'namespace.key' (e.g., 'thrive.company_name', 'custom.copyright')",
    )
    .optional(),
  defaultValue: z.string().min(1).optional(),
  description: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const listCustomVariablesSchema = z.object({
  isActive: z.boolean().optional(),
});
