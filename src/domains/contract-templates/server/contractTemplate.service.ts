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
import { enhanceTipTapHtml } from "../utils/enhanceTipTapHtml";
import {
  createGoogleDoc,
  exportAsHTML,
  getGoogleDocUrl,
  updateGoogleDocWithHtml,
} from "@/lib/google-docs";
import { ENV } from "@/constants/variables";
import logger from "@/utils/logger";

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
      _count: {
        select: {
          contracts: true,
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
    contractCount: template._count.contracts,
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
): Promise<{ id: string; googleDocId?: string }> => {
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

  // Try to create a Google Doc for this template
  let googleDocTemplateId: string | null = null;
  let googleDocFolderId: string | null = null;

  try {
    // Use the contracts folder from env if available
    const folderId = ENV.GOOGLE_CONTRACTS_FOLDER_ID || undefined;
    googleDocTemplateId = await createGoogleDoc(
      `Contract Template: ${input.displayName}`,
      folderId,
    );
    googleDocFolderId = folderId || null;
    logger.log(
      `✅ Created Google Doc for template "${input.displayName}": ${googleDocTemplateId}`,
    );
  } catch (error) {
    // Log the error but don't fail the template creation
    logger.error("Failed to create Google Doc for template:", error);
  }

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
      googleDocTemplateId,
      googleDocFolderId,
      createdBy,
    },
  });

  return { id: template.id, googleDocId: googleDocTemplateId || undefined };
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
  syncToGoogleDocs: boolean = true,
): Promise<{ id: string; googleDocId?: string }> => {
  // Get template with draft version and current version to find existing Google Doc ID
  const template = await prisma.documentTemplate.findUnique({
    where: { id: templateId },
    include: {
      versions: {
        where: { status: "DRAFT" },
        orderBy: { version: "desc" },
        take: 1,
      },
      currentVersion: {
        select: {
          googleDocTemplateId: true,
          googleDocFolderId: true,
        },
      },
    },
  });

  if (!template) {
    throw HttpError.notFound("Template not found");
  }

  // Also check all versions to find the most recent one with a Google Doc ID
  // This ensures we preserve the Google Doc ID even if draft/current don't have it
  const allVersions = await prisma.templateVersion.findMany({
    where: {
      templateId,
      googleDocTemplateId: { not: null },
    },
    select: {
      googleDocTemplateId: true,
      googleDocFolderId: true,
    },
    orderBy: { version: "desc" },
    take: 1,
  });

  // Enhance TipTap HTML with inline styles to ensure proper rendering
  const enhancedContent = enhanceTipTapHtml(content);

  // Parse placeholders from content
  const placeholders = parsePlaceholders(enhancedContent);
  const validation = validatePlaceholders(placeholders);

  // Update or create draft version
  let draftVersion = template.versions[0];

  // Get Google Doc ID from: parameter > draft version > current version > any version with Google Doc
  // This ensures we always use the existing Google Doc for the template
  let currentGoogleDocId =
    googleDocTemplateId ??
    draftVersion?.googleDocTemplateId ??
    template.currentVersion?.googleDocTemplateId ??
    allVersions[0]?.googleDocTemplateId ??
    null;
  let currentGoogleDocFolderId =
    googleDocFolderId ??
    draftVersion?.googleDocFolderId ??
    template.currentVersion?.googleDocFolderId ??
    allVersions[0]?.googleDocFolderId ??
    null;

  // Sync to Google Docs if enabled and we have content
  if (syncToGoogleDocs && content && content.trim()) {
    try {
      if (currentGoogleDocId) {
        // Update existing Google Doc with new content
        await updateGoogleDocWithHtml(currentGoogleDocId, enhancedContent);
        logger.log(
          `✅ Synced template content to Google Docs: ${currentGoogleDocId}`,
        );
      } else {
        // Create new Google Doc if none exists
        const folderId = ENV.GOOGLE_CONTRACTS_FOLDER_ID || undefined;
        currentGoogleDocId = await createGoogleDoc(
          `Contract Template: ${template.displayName}`,
          folderId,
        );
        currentGoogleDocFolderId = folderId || null;
        // Update the newly created Google Doc with content
        await updateGoogleDocWithHtml(currentGoogleDocId, enhancedContent);
        logger.log(
          `✅ Created and synced template content to Google Docs: ${currentGoogleDocId}`,
        );
      }
    } catch (error) {
      // Log error but don't fail the save operation
      logger.error("Failed to sync template to Google Docs:", error);
    }
  }

  if (draftVersion) {
    // Update existing draft
    await prisma.templateVersion.update({
      where: { id: draftVersion.id },
      data: {
        bodyHtml: enhancedContent,
        googleDocTemplateId: currentGoogleDocId,
        googleDocFolderId: currentGoogleDocFolderId,
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
        bodyHtml: enhancedContent,
        googleDocTemplateId: currentGoogleDocId,
        googleDocFolderId: currentGoogleDocFolderId,
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

  return { id: draftVersion.id, googleDocId: currentGoogleDocId || undefined };
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

// Sync template content FROM Google Docs
export const syncFromGoogleDoc = async (
  templateId: string,
  createdBy: string,
): Promise<{ id: string; content: string }> => {
  // Get the template with its current version
  const template = await prisma.documentTemplate.findUnique({
    where: { id: templateId },
    include: {
      versions: {
        where: { status: "DRAFT" },
        orderBy: { version: "desc" },
        take: 1,
      },
      currentVersion: true,
    },
  });

  if (!template) {
    throw HttpError.notFound("Template not found");
  }

  // Get draft or current version
  const version = template.versions[0] || template.currentVersion;

  if (!version?.googleDocTemplateId) {
    throw HttpError.badRequest(
      "No Google Doc linked to this template. Save the template first to create a Google Doc.",
    );
  }

  // Export HTML from Google Docs
  const htmlContent = await exportAsHTML(version.googleDocTemplateId);

  if (!htmlContent) {
    throw HttpError.badRequest("Failed to export content from Google Docs");
  }

  // Parse placeholders from the imported content
  const placeholders = parsePlaceholders(htmlContent);
  const validation = validatePlaceholders(placeholders);

  // Update or create draft version with the synced content
  let draftVersion = template.versions[0];

  if (draftVersion) {
    // Update existing draft
    await prisma.templateVersion.update({
      where: { id: draftVersion.id },
      data: {
        bodyHtml: htmlContent,
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
        bodyHtml: htmlContent,
        googleDocTemplateId: version.googleDocTemplateId,
        googleDocFolderId: version.googleDocFolderId,
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

  logger.log(
    `✅ Synced content from Google Docs for template "${template.displayName}"`,
  );

  return { id: draftVersion.id, content: htmlContent };
};

// Get Google Doc URL for a template
export const getTemplateGoogleDocUrl = async (
  templateId: string,
): Promise<{ url: string | null; documentId: string | null }> => {
  const template = await prisma.documentTemplate.findUnique({
    where: { id: templateId },
    include: {
      versions: {
        where: { status: "DRAFT" },
        orderBy: { version: "desc" },
        take: 1,
      },
      currentVersion: true,
    },
  });

  if (!template) {
    throw HttpError.notFound("Template not found");
  }

  const version = template.versions[0] || template.currentVersion;
  const documentId = version?.googleDocTemplateId;

  if (!documentId) {
    return { url: null, documentId: null };
  }

  return {
    url: getGoogleDocUrl(documentId),
    documentId,
  };
};

// Delete a contract template
export const deleteContractTemplate = async (
  id: string,
): Promise<{ id: string }> => {
  const existing = await prisma.documentTemplate.findUnique({
    where: { id },
    include: {
      versions: true,
    },
  });

  if (!existing) {
    throw HttpError.notFound("Contract template not found");
  }

  // Check if template is used by any contracts
  const contractCount = await prisma.contract.count({
    where: { templateId: id },
  });

  if (contractCount > 0) {
    throw HttpError.badRequest(
      `Cannot delete contract template that is used by ${contractCount} contract${contractCount === 1 ? "" : "s"}. Please delete or reassign the contracts first.`,
    );
  }

  // Delete all versions first (cascade)
  await prisma.templateVersion.deleteMany({
    where: { templateId: id },
  });

  // Delete the template
  await prisma.documentTemplate.delete({
    where: { id },
  });

  return { id };
};
