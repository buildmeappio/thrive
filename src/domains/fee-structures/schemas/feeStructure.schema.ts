import { z } from "zod";
import { FeeVariableType } from "@prisma/client";

// Key format: snake_case starting with lowercase letter
const keyRegex = /^[a-z][a-z0-9_]*$/;

export const feeStructureSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be less than 255 characters")
    .trim(),
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
    .max(80, "Label must be less than 80 characters")
    .trim(),
  key: z
    .string()
    .min(1, "Key is required")
    .max(64, "Key must be less than 64 characters")
    .regex(keyRegex, "Key must be snake_case (lowercase letters, numbers, and underscores, starting with a letter)")
    .trim(),
  type: z.enum([FeeVariableType.MONEY, FeeVariableType.NUMBER, FeeVariableType.TEXT, FeeVariableType.BOOLEAN], {
    message: "Invalid variable type",
  }),
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
  sortOrder: z.number().int().default(0),
});

// Custom refinement for variable validation
export const createFeeVariableSchema = feeVariableBaseSchema.superRefine((data, ctx) => {
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
    data.currency = "USD";
  }

  // Decimals only allowed for MONEY and NUMBER types
  if (data.decimals !== undefined && data.type !== FeeVariableType.MONEY && data.type !== FeeVariableType.NUMBER) {
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

export const updateFeeVariableSchema = feeVariableBaseSchema
  .extend({
    variableId: z.string().uuid("Invalid variable ID"),
  })
  .superRefine((data, ctx) => {
    // Same validation as create
    if (data.currency && data.type !== FeeVariableType.MONEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Currency is only allowed for MONEY type",
        path: ["currency"],
      });
    }

    if (data.type === FeeVariableType.MONEY && !data.currency) {
      data.currency = "USD";
    }

    if (data.decimals !== undefined && data.type !== FeeVariableType.MONEY && data.type !== FeeVariableType.NUMBER) {
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
  status: z.enum(["ALL", "DRAFT", "ACTIVE", "ARCHIVED"]).optional().default("ALL"),
  search: z.string().optional(),
});

export type CreateFeeStructureSchemaType = z.infer<typeof createFeeStructureSchema>;
export type UpdateFeeStructureSchemaType = z.infer<typeof updateFeeStructureSchema>;
export type CreateFeeVariableSchemaType = z.infer<typeof createFeeVariableSchema>;
export type UpdateFeeVariableSchemaType = z.infer<typeof updateFeeVariableSchema>;

