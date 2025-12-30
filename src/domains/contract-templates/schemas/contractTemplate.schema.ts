import { z } from "zod";

// Helper function to check if display name contains at least one letter
const hasAtLeastOneLetter = (value: string): boolean => {
  return /[a-zA-Z]/.test(value.trim());
};
// Schema for HeaderConfig and FooterConfig
export const headerFooterConfigSchema = z.object({
  content: z.string(),
  height: z.number().min(0).max(200),
  frequency: z.enum(["all", "even", "odd", "first"]),
});

export const createContractTemplateSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  displayName: z
    .string()
    .min(1, "Display name is required")
    .trim()
    .refine(
      (val) => val.length >= 2,
      "Display name must be at least 2 characters",
    )
    .refine(
      (val) => val.length <= 255,
      "Display name must be less than 255 characters",
    )
    .refine(
      (val) => /^[a-zA-Z0-9\s\-'.,()&]+$/.test(val),
      "Display name can only contain letters, numbers, spaces, hyphens, apostrophes, commas, periods, parentheses, and ampersands",
    )
    .refine(
      (val) => hasAtLeastOneLetter(val),
      "Display name must contain at least one letter",
    ),
});

export const updateContractTemplateSchema = z.object({
  id: z.string().uuid(),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
    .optional(),
  displayName: z
    .string()
    .min(1, "Display name is required")
    .trim()
    .refine(
      (val) => val.length >= 2,
      "Display name must be at least 2 characters",
    )
    .refine(
      (val) => val.length <= 255,
      "Display name must be less than 255 characters",
    )
    .refine(
      (val) => /^[a-zA-Z0-9\s\-'.,()&]+$/.test(val),
      "Display name can only contain letters, numbers, spaces, hyphens, apostrophes, commas, periods, parentheses, and ampersands",
    )
    .refine(
      (val) => hasAtLeastOneLetter(val),
      "Display name must contain at least one letter",
    )
    .optional(),
  isActive: z.boolean().optional(),
});

export const saveTemplateDraftContentSchema = z.object({
  templateId: z.string().uuid(),
  content: z.string(), // Allow empty content for drafts
  googleDocTemplateId: z.string().optional().nullable(),
  googleDocFolderId: z.string().optional().nullable(),
  headerConfig: headerFooterConfigSchema.optional().nullable(),
  footerConfig: headerFooterConfigSchema.optional().nullable(),
});

export const publishTemplateVersionSchema = z.object({
  templateId: z.string().uuid(),
  changeNotes: z.string().optional(),
});

export const listContractTemplatesSchema = z.object({
  status: z.enum(["ALL", "ACTIVE", "INACTIVE"]).optional(),
  search: z.string().optional(),
});
