import prisma from "@/lib/db";
import { TemplateVersionStatus, Prisma } from "@prisma/client";
import { HttpError } from "@/utils/httpError";
import {
  ContractTemplateListItem,
  ContractTemplateData,
  TemplateVersionData,
  CreateContractTemplateInput,
  UpdateContractTemplateInput,
  ListContractTemplatesInput,
} from "../types/contractTemplate.types";
import {
  parsePlaceholders,
  validatePlaceholders,
} from "../utils/placeholderParser";

// Helper to format template version data
const formatTemplateVersion = (version: {
  id: string;
  templateId: string;
  version: number;
  status: TemplateVersionStatus;
  locale: string;
  bodyHtml: string;
  variablesSchema: unknown;
  defaultData: unknown;
  changeNotes: string | null;
  googleDocTemplateId: string | null;
  googleDocFolderId: string | null;
  createdAt: Date;
}): TemplateVersionData => ({
  id: version.id,
  templateId: version.templateId,
  version: version.version,
  status: version.status,
  locale: version.locale,
  bodyHtml: version.bodyHtml,
  variablesSchema: version.variablesSchema,
  defaultData: version.defaultData,
  changeNotes: version.changeNotes,
  googleDocTemplateId: version.googleDocTemplateId,
  googleDocFolderId: version.googleDocFolderId,
  createdAt: version.createdAt.toISOString(),
});

// List contract templates with optional filters
export const listContractTemplates = async (
  input: ListContractTemplatesInput,
): Promise<ContractTemplateListItem[]> => {
  const { status, search } = input;

  const where: Prisma.DocumentTemplateWhereInput = {};

  // Default to showing only active templates unless explicitly requesting ALL or INACTIVE
  if (status === "INACTIVE") {
    where.isActive = false;
  } else if (status === "ALL") {
    // Show all templates (active and inactive)
    // No filter applied
  } else {
    // Default behavior: only show active templates
    where.isActive = true;
  }

  if (search && search.trim()) {
    where.OR = [
      { displayName: { contains: search.trim(), mode: "insensitive" } },
      { slug: { contains: search.trim(), mode: "insensitive" } },
    ];
  }

  const templates = await prisma.documentTemplate.findMany({
    where,
    include: {
      currentVersion: {
        select: {
          version: true,
          status: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return templates.map((template) => ({
    id: template.id,
    slug: template.slug,
    displayName: template.displayName,
    isActive: template.isActive,
    currentVersionId: template.currentVersionId,
    currentVersion: template.currentVersion,
    feeStructureId: template.feeStructureId,
    updatedAt: template.updatedAt.toISOString(),
  }));
};

// Get a single contract template with all versions
export const getContractTemplate = async (
  id: string,
): Promise<ContractTemplateData> => {
  const template = await prisma.documentTemplate.findUnique({
    where: { id },
    include: {
      currentVersion: true,
      versions: {
        orderBy: { version: "desc" },
      },
      feeStructure: {
        include: {
          variables: {
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  if (!template) {
    throw HttpError.notFound("Contract template not found");
  }

  // Find draft version if it exists
  const draftVersion = template.versions.find((v) => v.status === "DRAFT");

  // Use draft version if it exists, otherwise use currentVersion
  const editingVersion = draftVersion || template.currentVersion;

  return {
    id: template.id,
    slug: template.slug,
    displayName: template.displayName,
    isActive: template.isActive,
    currentVersionId: template.currentVersionId,
    feeStructureId: template.feeStructureId,
    feeStructure: template.feeStructure
      ? {
          id: template.feeStructure.id,
          name: template.feeStructure.name,
          description: template.feeStructure.description,
          variables: template.feeStructure.variables.map((v) => ({
            id: v.id,
            key: v.key,
            label: v.label,
            type: v.type,
            defaultValue: v.defaultValue,
            decimals: v.decimals,
          })),
        }
      : null,
    createdBy: template.createdBy,
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString(),
    currentVersion: editingVersion
      ? formatTemplateVersion(editingVersion)
      : null,
    versions: template.versions.map(formatTemplateVersion),
  };
};

// Create a new contract template
export const createContractTemplate = async (
  input: CreateContractTemplateInput,
  createdBy: string,
): Promise<{ id: string }> => {
  // Check if slug already exists
  const existing = await prisma.documentTemplate.findUnique({
    where: { slug: input.slug },
  });

  if (existing) {
    throw HttpError.badRequest(
      `Template with slug "${input.slug}" already exists`,
    );
  }

  const template = await prisma.documentTemplate.create({
    data: {
      slug: input.slug,
      displayName: input.displayName,
      category: "contracts", // Always use "contracts" as the category
      isActive: true,
      createdBy,
    },
  });

  // Create initial draft version
  await prisma.templateVersion.create({
    data: {
      templateId: template.id,
      version: 1,
      status: "DRAFT",
      locale: "en-CA",
      bodyHtml: "",
      variablesSchema: { type: "object", properties: {} },
      defaultData: {},
      checksumSha256: "",
      createdBy,
    },
  });

  return { id: template.id };
};

// Update contract template metadata
export const updateContractTemplate = async (
  input: UpdateContractTemplateInput,
): Promise<{ id: string }> => {
  const { id, ...updateData } = input;

  // If slug is being updated, check for conflicts
  if (updateData.slug) {
    const existing = await prisma.documentTemplate.findFirst({
      where: {
        slug: updateData.slug,
        id: { not: id },
      },
    });

    if (existing) {
      throw HttpError.badRequest(
        `Template with slug "${updateData.slug}" already exists`,
      );
    }
  }

  await prisma.documentTemplate.update({
    where: { id },
    data: updateData,
  });

  return { id };
};

// Save template draft content
export const saveTemplateDraftContent = async (
  templateId: string,
  content: string,
  createdBy: string,
  googleDocTemplateId?: string | null,
  googleDocFolderId?: string | null,
): Promise<{ id: string }> => {
  // Get or create draft version
  const template = await prisma.documentTemplate.findUnique({
    where: { id: templateId },
    include: {
      versions: {
        where: { status: "DRAFT" },
        orderBy: { version: "desc" },
        take: 1,
      },
    },
  });

  if (!template) {
    throw HttpError.notFound("Template not found");
  }

  // Parse placeholders from content
  const placeholders = parsePlaceholders(content);
  const validation = validatePlaceholders(placeholders);

  // Update or create draft version
  let draftVersion = template.versions[0];

  if (draftVersion) {
    // Update existing draft
    await prisma.templateVersion.update({
      where: { id: draftVersion.id },
      data: {
        bodyHtml: content,
        googleDocTemplateId:
          googleDocTemplateId !== undefined
            ? googleDocTemplateId
            : draftVersion.googleDocTemplateId,
        googleDocFolderId:
          googleDocFolderId !== undefined
            ? googleDocFolderId
            : draftVersion.googleDocFolderId,
        variablesSchema: {
          type: "object",
          properties: {},
          placeholders,
          validation,
        },
      },
    });
  } else {
    // Create new draft version
    const latestVersion = await prisma.templateVersion.findFirst({
      where: { templateId },
      orderBy: { version: "desc" },
    });

    const nextVersion = (latestVersion?.version || 0) + 1;

    draftVersion = await prisma.templateVersion.create({
      data: {
        templateId,
        version: nextVersion,
        status: "DRAFT",
        locale: "en-CA",
        bodyHtml: content,
        googleDocTemplateId: googleDocTemplateId || null,
        googleDocFolderId: googleDocFolderId || null,
        variablesSchema: {
          type: "object",
          properties: {},
          placeholders,
          validation,
        },
        defaultData: {},
        checksumSha256: "",
        createdBy,
      },
    });
  }

  if (!draftVersion) {
    throw HttpError.badRequest("Failed to create or update draft version");
  }

  return { id: draftVersion.id };
};

// Publish template version
export const publishTemplateVersion = async (
  templateId: string,
  changeNotes: string | undefined,
): Promise<{ id: string; version: number }> => {
  const template = await prisma.documentTemplate.findUnique({
    where: { id: templateId },
    include: {
      versions: {
        where: { status: "DRAFT" },
        orderBy: { version: "desc" },
        take: 1,
      },
    },
  });

  if (!template) {
    throw HttpError.notFound("Template not found");
  }

  const draftVersion = template.versions[0];
  if (!draftVersion) {
    throw HttpError.badRequest("No draft version found to publish");
  }

  // Validate placeholders before publishing
  const placeholders = parsePlaceholders(draftVersion.bodyHtml);
  const validation = validatePlaceholders(placeholders);

  if (!validation.valid) {
    throw HttpError.badRequest(
      `Cannot publish template with invalid placeholders: ${validation.errors.map((e) => e.error).join(", ")}`,
    );
  }

  // Update draft to published
  const publishedVersion = await prisma.templateVersion.update({
    where: { id: draftVersion.id },
    data: {
      status: "PUBLISHED",
      changeNotes: changeNotes || null,
      variablesSchema: {
        ...(draftVersion.variablesSchema as object),
        placeholders,
        validation,
      },
    },
  });

  // Update template to point to this version
  await prisma.documentTemplate.update({
    where: { id: templateId },
    data: {
      currentVersionId: publishedVersion.id,
      isActive: true,
    },
  });

  return { id: publishedVersion.id, version: publishedVersion.version };
};

// Validate template content
export const validateTemplate = async (templateId: string, content: string) => {
  const placeholders = parsePlaceholders(content);
  const validation = validatePlaceholders(placeholders);

  return {
    placeholders,
    errors: validation.errors,
    warnings: validation.warnings,
  };
};
