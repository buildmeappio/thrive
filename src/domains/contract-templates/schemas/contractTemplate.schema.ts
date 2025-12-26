import { z } from "zod";

export const createContractTemplateSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  displayName: z.string().min(1).max(255),
});

export const updateContractTemplateSchema = z.object({
  id: z.string().uuid(),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
    .optional(),
  displayName: z.string().min(1).max(255).optional(),
  isActive: z.boolean().optional(),
});

export const saveTemplateDraftContentSchema = z.object({
  templateId: z.string().uuid(),
  content: z.string(), // Allow empty content for drafts
  googleDocTemplateId: z.string().optional().nullable(),
  googleDocFolderId: z.string().optional().nullable(),
});

export const publishTemplateVersionSchema = z.object({
  templateId: z.string().uuid(),
  changeNotes: z.string().optional(),
});

export const listContractTemplatesSchema = z.object({
  status: z.enum(["ALL", "ACTIVE", "INACTIVE"]).optional(),
  search: z.string().optional(),
});
