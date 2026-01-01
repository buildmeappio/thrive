import { z } from "zod";

const checkboxOptionSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

export const createCustomVariableSchema = z
  .object({
    key: z.string().min(1).max(255),
    defaultValue: z.string().optional(),
    description: z.string().max(500).optional().nullable(),
    variableType: z.enum(["text", "checkbox_group"]).default("text"),
    options: z.array(checkboxOptionSchema).optional().nullable(),
  })
  .refine(
    (data) => {
      // For text variables, defaultValue is required
      if (data.variableType === "text") {
        return data.defaultValue && data.defaultValue.trim().length > 0;
      }
      // For checkbox groups, defaultValue is not required
      return true;
    },
    {
      message: "Default value is required for text variables",
      path: ["defaultValue"],
    },
  );

export const updateCustomVariableSchema = z
  .object({
    id: z.string().uuid(),
    key: z.string().min(1).max(255).optional(),
    defaultValue: z.string().optional(),
    description: z.string().max(500).optional().nullable(),
    isActive: z.boolean().optional(),
    variableType: z.enum(["text", "checkbox_group"]).optional(),
    options: z.array(checkboxOptionSchema).optional().nullable(),
  })
  .refine(
    (data) => {
      // If updating variableType to text, defaultValue is required
      if (data.variableType === "text" && data.defaultValue !== undefined) {
        return data.defaultValue.trim().length > 0;
      }
      // For checkbox groups or when defaultValue is not being updated, it's optional
      return true;
    },
    {
      message: "Default value is required for text variables",
      path: ["defaultValue"],
    },
  );

export const listCustomVariablesSchema = z.object({
  isActive: z.boolean().optional(),
});
