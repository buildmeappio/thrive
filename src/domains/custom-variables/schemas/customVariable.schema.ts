import { z } from "zod";

const checkboxOptionSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

export const createCustomVariableSchema = z.object({
  key: z.string().min(1).max(255),
  defaultValue: z.string().optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  label: z.string().max(255).optional().nullable(),
  variableType: z.enum(["text", "checkbox_group"]).default("text"),
  options: z.array(checkboxOptionSchema).optional().nullable(),
  showUnderline: z.boolean().optional(),
});

export const updateCustomVariableSchema = z.object({
  id: z.string().uuid(),
  key: z.string().min(1).max(255).optional(),
  defaultValue: z.string().optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  label: z.string().max(255).optional().nullable(),
  isActive: z.boolean().optional(),
  variableType: z.enum(["text", "checkbox_group"]).optional(),
  options: z.array(checkboxOptionSchema).optional().nullable(),
  showUnderline: z.boolean().optional(),
});

export const listCustomVariablesSchema = z.object({
  isActive: z.boolean().optional(),
});
