import prisma from "@/lib/db";
import { HttpError } from "@/utils/httpError";
import logger from "@/utils/logger";
import { getCurrentUser } from "@/domains/auth/server/session";
import { isAllowedRole } from "@/lib/rbac";
import type {
  AllowedEmailVariable,
  EmailTemplateDetailDto,
  EmailTemplateListItem,
  EmailTemplateVersionDto,
} from "../types/emailTemplates";

function assertAdminAccess() {
  return (async () => {
    const user = await getCurrentUser();
    if (!user) throw HttpError.unauthorized("You must be logged in.");
    if (!isAllowedRole(String(user.roleName)))
      throw HttpError.forbidden("You are not allowed to access this resource.");
    return user;
  })();
}

function extractVariablesFromTemplate(input: string): string[] {
  const found = new Set<string>();

  // {{variable}}
  const simple = /\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g;
  for (const match of input.matchAll(simple)) {
    if (match[1]) found.add(match[1]);
  }

  // {{#if variable}} ... {{/if}}
  const ifBlock = /\{\{\s*#if\s+([A-Za-z0-9_]+)\s*\}\}/g;
  for (const match of input.matchAll(ifBlock)) {
    if (match[1]) found.add(match[1]);
  }

  return Array.from(found);
}

function validateHtmlSafety(html: string) {
  if (/<script\b/i.test(html)) {
    throw HttpError.badRequest("HTML cannot contain <script> tags.");
  }
  if (/\son\w+\s*=\s*["']/i.test(html)) {
    throw HttpError.badRequest("HTML cannot contain inline event handlers.");
  }
}

function validateAllowedVariables(args: {
  subject: string;
  bodyHtml: string;
  allowedVariables: AllowedEmailVariable[];
}) {
  const allowed = new Set(args.allowedVariables.map((v) => v.name));
  const used = new Set([
    ...extractVariablesFromTemplate(args.subject),
    ...extractVariablesFromTemplate(args.bodyHtml),
  ]);

  const unknown = Array.from(used).filter((v) => !allowed.has(v));
  if (unknown.length > 0) {
    throw HttpError.badRequest(
      `Unknown variables used: ${unknown.map((v) => `{{${v}}}`).join(", ")}`,
    );
  }
}

function mapVersion(v: any): EmailTemplateVersionDto {
  return {
    id: v.id,
    version: v.version,
    subject: v.subject,
    bodyHtml: v.bodyHtml,
    designJson: v.designJson,
    createdAt: v.createdAt.toISOString(),
  };
}

export async function listEmailTemplates(): Promise<EmailTemplateListItem[]> {
  await assertAdminAccess();
  const templates = await prisma.emailTemplate.findMany({
    where: { deletedAt: null },
    orderBy: { updatedAt: "desc" },
  });
  return templates.map((t) => ({
    id: t.id,
    key: t.key,
    name: t.name,
    description: t.description ?? null,
    isActive: t.isActive,
    updatedAt: t.updatedAt.toISOString(),
  }));
}

export async function getEmailTemplateById(
  id: string,
): Promise<EmailTemplateDetailDto> {
  await assertAdminAccess();

  const template = await prisma.emailTemplate.findFirst({
    where: { id, deletedAt: null },
    include: {
      currentVersion: true,
      versions: {
        where: { deletedAt: null },
        orderBy: { version: "desc" },
        take: 10,
      },
    },
  });

  if (!template) throw HttpError.notFound("Email template not found.");

  return {
    id: template.id,
    key: template.key,
    name: template.name,
    description: template.description ?? null,
    isActive: template.isActive,
    allowedVariables: (template.allowedVariables as any) ?? [],
    currentVersion: template.currentVersion
      ? mapVersion(template.currentVersion)
      : null,
    versions: template.versions.map(mapVersion),
    updatedAt: template.updatedAt.toISOString(),
  };
}

export async function updateEmailTemplate(args: {
  id: string;
  subject: string;
  bodyHtml: string;
  designJson: unknown;
  isActive?: boolean;
}) {
  const user = await assertAdminAccess();

  try {
    return await prisma.$transaction(async (tx) => {
      const template = await tx.emailTemplate.findFirst({
        where: { id: args.id, deletedAt: null },
      });
      if (!template) throw HttpError.notFound("Email template not found.");

      const allowedVariables: AllowedEmailVariable[] =
        (template.allowedVariables as any) ?? [];

      validateHtmlSafety(args.bodyHtml);
      validateAllowedVariables({
        subject: args.subject,
        bodyHtml: args.bodyHtml,
        allowedVariables,
      });

      const latest = await tx.emailTemplateVersion.findFirst({
        where: { templateId: template.id, deletedAt: null },
        orderBy: { version: "desc" },
      });
      const nextVersion = (latest?.version ?? 0) + 1;

      const newVersion = await tx.emailTemplateVersion.create({
        data: {
          templateId: template.id,
          version: nextVersion,
          subject: args.subject,
          bodyHtml: args.bodyHtml,
          designJson: args.designJson as any,
          createdByUserId: user.id,
        },
      });

      const updated = await tx.emailTemplate.update({
        where: { id: template.id },
        data: {
          currentVersionId: newVersion.id,
          ...(typeof args.isActive === "boolean"
            ? { isActive: args.isActive }
            : {}),
        },
      });

      return {
        templateId: updated.id,
        versionId: newVersion.id,
        version: nextVersion,
      };
    });
  } catch (err) {
    logger.error("updateEmailTemplate failed:", err);
    throw err;
  }
}

export async function restoreEmailTemplateVersion(args: {
  templateId: string;
  versionId: string;
  isActive?: boolean;
}) {
  await assertAdminAccess();

  return prisma.$transaction(async (tx) => {
    const template = await tx.emailTemplate.findFirst({
      where: { id: args.templateId, deletedAt: null },
    });
    if (!template) throw HttpError.notFound("Email template not found.");

    const version = await tx.emailTemplateVersion.findFirst({
      where: { id: args.versionId, templateId: template.id, deletedAt: null },
    });
    if (!version) throw HttpError.notFound("Email template version not found.");

    const latest = await tx.emailTemplateVersion.findFirst({
      where: { templateId: template.id, deletedAt: null },
      orderBy: { version: "desc" },
    });
    const nextVersion = (latest?.version ?? 0) + 1;

    const restored = await tx.emailTemplateVersion.create({
      data: {
        templateId: template.id,
        version: nextVersion,
        subject: version.subject,
        bodyHtml: version.bodyHtml,
        designJson: version.designJson as any,
        createdByUserId: null,
      },
    });

    await tx.emailTemplate.update({
      where: { id: template.id },
      data: {
        currentVersionId: restored.id,
        ...(typeof args.isActive === "boolean"
          ? { isActive: args.isActive }
          : {}),
      },
    });

    return {
      templateId: template.id,
      versionId: restored.id,
      version: nextVersion,
    };
  });
}
