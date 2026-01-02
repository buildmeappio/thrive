import { z } from "zod";
import { FeeVariableType } from "@prisma/client";

// Key format: snake_case starting with lowercase letter
const keyRegex = /^[a-z][a-z0-9_]*$/;

// Sub-field schema for composite variables
export const subFieldSchema = z.object({
  key: z
    .string()
    .min(1, "Sub-field key is required")
    .max(64, "Sub-field key must be less than 64 characters")
    .regex(
      keyRegex,
      "Sub-field key must be snake_case (lowercase letters, numbers, and underscores, starting with a letter)",
    ),
  label: z
    .string()
    .min(1, "Sub-field label is required")
    .max(80, "Sub-field label must be less than 80 characters"),
  type: z.enum(["NUMBER", "MONEY", "TEXT"], {
    message: "Sub-field type must be NUMBER, MONEY, or TEXT",
  }),
  defaultValue: z.union([z.number(), z.string()]).optional(),
  required: z.boolean().optional().default(false),
  unit: z
    .string()
    .max(20, "Unit must be less than 20 characters")
    .optional(),
});

// Helper function to check if name contains at least one letter
const hasAtLeastOneLetter = (value: string): boolean => {
  return /[a-zA-Z]/.test(value.trim());
};

export const feeStructureSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .trim()
    .refine((val) => val.length >= 2, "Name must be at least 2 characters")
    .refine((val) => val.length <= 255, "Name must be less than 255 characters")
    .refine(
      (val) => /^[a-zA-Z0-9\s\-'.,()&]+$/.test(val),
      "Name can only contain letters, numbers, spaces, hyphens, apostrophes, commas, periods, parentheses, and ampersands",
    )
    .refine(
      (val) => hasAtLeastOneLetter(val),
      "Name must contain at least one letter",
    ),
  description: z
    .string()
    .max(5000, "Description must be less than 5000 characters")
    .optional()
    .transform((val) => val?.trim() || undefined),
});

export const createFeeStructureSchema = feeStructureSchema;

export const updateFeeStructureSchema = feeStructureSchema.extend({
  id: z.string().uuid("Invalid fee structure ID"),
});

export const feeVariableBaseSchema = z.object({
  feeStructureId: z.string().uuid("Invalid fee structure ID"),
  label: z
    .string()
    .min(1, "Label is required")
    .trim()
    .refine((val) => val.length >= 2, "Label must be at least 2 characters")
    .refine((val) => val.length <= 80, "Label must be less than 80 characters")
    .refine(
      (val) => /^[a-zA-Z0-9\s\-'.,()&/|]+$/.test(val),
      "Label can only contain letters, numbers, spaces, hyphens, apostrophes, commas, periods, parentheses, ampersands, slashes, and pipes",
    )
    .refine(
      (val) => hasAtLeastOneLetter(val),
      "Label must contain at least one letter",
    ),
  key: z
    .string()
    .min(1, "Key is required")
    .max(64, "Key must be less than 64 characters")
    .regex(
      keyRegex,
      "Key must be snake_case (lowercase letters, numbers, and underscores, starting with a letter)",
    )
    .trim(),
  type: z.enum(
    [
      FeeVariableType.MONEY,
      FeeVariableType.NUMBER,
      FeeVariableType.TEXT,
      FeeVariableType.BOOLEAN,
    ],
    {
      message: "Invalid variable type",
    },
  ),
  defaultValue: z.unknown().optional(),
  required: z.boolean().default(false),
  currency: z
    .string()
    .max(3, "Currency code must be 3 characters or less")
    .optional()
    .transform((val) => val?.trim().toUpperCase() || undefined),
  decimals: z
    .number()
    .int("Decimals must be an integer")
    .min(0, "Decimals must be at least 0")
    .max(6, "Decimals must be at most 6")
    .optional(),
  unit: z
    .string()
    .max(20, "Unit must be less than 20 characters")
    .optional()
    .transform((val) => val?.trim() || undefined),
  included: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  // Composite variable fields
  composite: z.boolean().default(false),
  subFields: z.array(subFieldSchema).optional(),
  referenceKey: z
    .string()
    .max(64, "Reference key must be less than 64 characters")
    .regex(
      keyRegex,
      "Reference key must be snake_case (lowercase letters, numbers, and underscores, starting with a letter)",
    )
    .optional()
    .transform((val) => val?.trim() || undefined),
});

// Custom refinement for variable validation
export const createFeeVariableSchema = feeVariableBaseSchema.superRefine(
  (data, ctx) => {
    // Composite variable validation
    if (data.composite) {
      // Composite variables must have subFields
      if (!data.subFields || data.subFields.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Composite variables must have at least one sub-field",
          path: ["subFields"],
        });
        return; // Early return to avoid further validation
      }

      // Validate sub-field keys are unique
      const subFieldKeys = new Set<string>();
      for (let i = 0; i < data.subFields.length; i++) {
        const subField = data.subFields[i];
        if (subFieldKeys.has(subField.key)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Duplicate sub-field key: ${subField.key}`,
            path: ["subFields", i, "key"],
          });
        }
        subFieldKeys.add(subField.key);

        // Validate sub-field default values
        if (subField.required && subField.defaultValue === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Required sub-field must have a default value",
            path: ["subFields", i, "defaultValue"],
          });
        }

        // Validate sub-field default value types
        if (subField.defaultValue !== undefined) {
          if (
            (subField.type === "NUMBER" || subField.type === "MONEY") &&
            typeof subField.defaultValue !== "number"
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Sub-field default value must be a number for NUMBER/MONEY types",
              path: ["subFields", i, "defaultValue"],
            });
          } else if (
            subField.type === "TEXT" &&
            typeof subField.defaultValue !== "string"
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Sub-field default value must be a string for TEXT type",
              path: ["subFields", i, "defaultValue"],
            });
          }
        }
      }

      // For composite variables, type field is ignored (sub-fields have their own types)
      // Skip standard type validation
      return;
    }

    // Non-composite variable validation (existing logic)
    // Currency only allowed for MONEY type
    if (data.currency && data.type !== FeeVariableType.MONEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Currency is only allowed for MONEY type",
        path: ["currency"],
      });
    }

    // Set default currency for MONEY if not provided
    if (data.type === FeeVariableType.MONEY && !data.currency) {
      data.currency = "CAD";
    }

    // Decimals only allowed for MONEY and NUMBER types
    if (
      data.decimals !== undefined &&
      data.type !== FeeVariableType.MONEY &&
      data.type !== FeeVariableType.NUMBER
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Decimals is only allowed for MONEY and NUMBER types",
        path: ["decimals"],
      });
    }

    // Set default decimals
    if (data.decimals === undefined) {
      if (data.type === FeeVariableType.MONEY) {
        data.decimals = 2;
      } else if (data.type === FeeVariableType.NUMBER) {
        data.decimals = 0;
      }
    }

    // Validate defaultValue based on type
    if (data.required && data.defaultValue === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Default value is required when Required is checked",
        path: ["defaultValue"],
      });
      return;
    }

    if (data.defaultValue !== undefined && data.defaultValue !== null) {
      switch (data.type) {
        case FeeVariableType.MONEY:
        case FeeVariableType.NUMBER: {
          const numValue = Number(data.defaultValue);
          if (isNaN(numValue)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Default value must be a valid number",
              path: ["defaultValue"],
            });
          } else if (numValue < 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Default value cannot be negative",
              path: ["defaultValue"],
            });
          } else if (numValue > 999999999.99) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Default value cannot exceed 999,999,999.99",
              path: ["defaultValue"],
            });
          }
          break;
        }
        case FeeVariableType.BOOLEAN: {
          if (typeof data.defaultValue !== "boolean") {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Default value must be a boolean",
              path: ["defaultValue"],
            });
          }
          break;
        }
        case FeeVariableType.TEXT: {
          if (typeof data.defaultValue !== "string") {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Default value must be a string",
              path: ["defaultValue"],
            });
          } else if (data.required && data.defaultValue.trim() === "") {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Default value cannot be empty when Required is checked",
              path: ["defaultValue"],
            });
          }
          break;
        }
      }
    }
  },
);

export const updateFeeVariableSchema = feeVariableBaseSchema
  .extend({
    variableId: z.string().uuid("Invalid variable ID"),
  })
  .superRefine((data, ctx) => {
    // Composite variable validation (same as create)
    if (data.composite) {
      // Composite variables must have subFields
      if (!data.subFields || data.subFields.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Composite variables must have at least one sub-field",
          path: ["subFields"],
        });
        return; // Early return to avoid further validation
      }

      // Validate sub-field keys are unique
      const subFieldKeys = new Set<string>();
      for (let i = 0; i < data.subFields.length; i++) {
        const subField = data.subFields[i];
        if (subFieldKeys.has(subField.key)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Duplicate sub-field key: ${subField.key}`,
            path: ["subFields", i, "key"],
          });
        }
        subFieldKeys.add(subField.key);

        // Validate sub-field default values
        if (subField.required && subField.defaultValue === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Required sub-field must have a default value",
            path: ["subFields", i, "defaultValue"],
          });
        }

        // Validate sub-field default value types
        if (subField.defaultValue !== undefined) {
          if (
            (subField.type === "NUMBER" || subField.type === "MONEY") &&
            typeof subField.defaultValue !== "number"
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Sub-field default value must be a number for NUMBER/MONEY types",
              path: ["subFields", i, "defaultValue"],
            });
          } else if (
            subField.type === "TEXT" &&
            typeof subField.defaultValue !== "string"
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Sub-field default value must be a string for TEXT type",
              path: ["subFields", i, "defaultValue"],
            });
          }
        }
      }

      // For composite variables, type field is ignored (sub-fields have their own types)
      // Skip standard type validation
      return;
    }

    // Non-composite variable validation (same as create)
    if (data.currency && data.type !== FeeVariableType.MONEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Currency is only allowed for MONEY type",
        path: ["currency"],
      });
    }

    if (data.type === FeeVariableType.MONEY && !data.currency) {
      data.currency = "CAD";
    }

    if (
      data.decimals !== undefined &&
      data.type !== FeeVariableType.MONEY &&
      data.type !== FeeVariableType.NUMBER
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Decimals is only allowed for MONEY and NUMBER types",
        path: ["decimals"],
      });
    }

    if (data.decimals === undefined) {
      if (data.type === FeeVariableType.MONEY) {
        data.decimals = 2;
      } else if (data.type === FeeVariableType.NUMBER) {
        data.decimals = 0;
      }
    }

    if (data.required && data.defaultValue === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Default value is required when Required is checked",
        path: ["defaultValue"],
      });
      return;
    }

    if (data.defaultValue !== undefined && data.defaultValue !== null) {
      switch (data.type) {
        case FeeVariableType.MONEY:
        case FeeVariableType.NUMBER: {
          const numValue = Number(data.defaultValue);
          if (isNaN(numValue)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Default value must be a valid number",
              path: ["defaultValue"],
            });
          } else if (numValue < 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Default value cannot be negative",
              path: ["defaultValue"],
            });
          } else if (numValue > 999999999.99) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Default value cannot exceed 999,999,999.99",
              path: ["defaultValue"],
            });
          }
          break;
        }
        case FeeVariableType.BOOLEAN: {
          if (typeof data.defaultValue !== "boolean") {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Default value must be a boolean",
              path: ["defaultValue"],
            });
          }
          break;
        }
        case FeeVariableType.TEXT: {
          if (typeof data.defaultValue !== "string") {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Default value must be a string",
              path: ["defaultValue"],
            });
          } else if (data.required && data.defaultValue.trim() === "") {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Default value cannot be empty when Required is checked",
              path: ["defaultValue"],
            });
          }
          break;
        }
      }
    }
  });

export const deleteFeeVariableSchema = z.object({
  feeStructureId: z.string().uuid("Invalid fee structure ID"),
  variableId: z.string().uuid("Invalid variable ID"),
});

export const listFeeStructuresSchema = z.object({
  status: z
    .enum(["ALL", "DRAFT", "ACTIVE", "ARCHIVED"])
    .optional()
    .default("ALL"),
  search: z.string().optional(),
});

export type CreateFeeStructureSchemaType = z.infer<
  typeof createFeeStructureSchema
>;
export type UpdateFeeStructureSchemaType = z.infer<
  typeof updateFeeStructureSchema
>;
export type CreateFeeVariableSchemaType = z.infer<
  typeof createFeeVariableSchema
>;
export type UpdateFeeVariableSchemaType = z.infer<
  typeof updateFeeVariableSchema
>;
