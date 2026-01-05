import { TemplateVersionStatus } from "@prisma/client";
import { HeaderConfig, FooterConfig } from "@/components/editor/types";

export type ContractTemplateListItem = {
  id: string;
  slug: string;
  displayName: string;
  isActive: boolean;
  currentVersionId: string | null;
  currentVersion: {
    version: number;
    status: TemplateVersionStatus;
  } | null;
  feeStructureId: string | null;
  updatedAt: string;
  contractCount: number;
};

export type TemplateVersionData = {
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
  headerConfig?: HeaderConfig;
  footerConfig?: FooterConfig;
  createdAt: string;
};

export type ContractTemplateData = {
  id: string;
  slug: string;
  displayName: string;
  isActive: boolean;
  currentVersionId: string | null;
  feeStructureId: string | null;
  feeStructure?: {
    id: string;
    name: string;
    description: string | null;
    variables: Array<{
      id: string;
      key: string;
      label: string;
      type: string;
      defaultValue: unknown;
      decimals: number | null;
    }>;
  } | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  currentVersion: TemplateVersionData | null;
  versions: TemplateVersionData[];
};

export type CreateContractTemplateInput = {
  slug: string;
  displayName: string;
};

export type UpdateContractTemplateInput = {
  id: string;
  slug?: string;
  displayName?: string;
  isActive?: boolean;
  feeStructureId?: string | null;
};

export type SaveTemplateDraftContentInput = {
  templateId: string;
  content: string;
  googleDocTemplateId?: string | null;
  googleDocFolderId?: string | null;
  headerConfig?: HeaderConfig | null;
  footerConfig?: FooterConfig | null;
};

export type ValidateTemplateResult = {
  placeholders: string[];
  errors: Array<{ placeholder: string; error: string }>;
  warnings: Array<{ placeholder: string; warning: string }>;
};

export type PublishTemplateVersionInput = {
  templateId: string;
  changeNotes?: string;
};

export type ListContractTemplatesInput = {
  status?: "ALL" | "ACTIVE" | "INACTIVE";
  search?: string;
};

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string> };
