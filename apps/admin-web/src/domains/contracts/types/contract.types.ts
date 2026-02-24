import { ContractStatus } from '@thrive/database';

export type ContractListItem = {
  id: string;
  examinerProfileId: string | null;
  applicationId: string | null;
  templateId: string;
  templateVersionId: string;
  feeStructureId: string | null;
  status: ContractStatus;
  examinerName: string | null;
  templateName: string | null;
  reviewedAt: string | null;
  updatedAt: string;
};

export type ContractData = {
  id: string;
  examinerProfileId: string | null;
  applicationId: string | null;
  templateId: string;
  templateVersionId: string;
  feeStructureId: string | null;
  status: ContractStatus;
  data: unknown;
  fieldValues: unknown;
  sentAt: string | null;
  signedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  template: {
    id: string;
    displayName: string;
    slug: string;
  };
  templateVersion: {
    id: string;
    version: number;
    bodyHtml: string;
    googleDocTemplateId: string | null;
    googleDocFolderId: string | null;
    headerConfig: unknown | null;
    footerConfig: unknown | null;
  };
  feeStructure: {
    id: string;
    name: string;
    variables: Array<{
      id: string;
      label: string;
      key: string;
      type: string;
      defaultValue: unknown;
      required: boolean;
      currency: string | null;
      decimals: number | null;
      unit: string | null;
      included: boolean;
      composite: boolean;
      subFields: Array<{
        key: string;
        label: string;
        type: string;
        defaultValue?: unknown;
        required?: boolean;
        unit?: string | null;
      }> | null;
    }>;
  } | null;
};

export type CreateContractInput = {
  examinerProfileId?: string;
  applicationId?: string;
  templateVersionId: string;
  feeStructureId: string;
  fieldValues: {
    examiner?: Record<string, unknown>;
    contract?: Record<string, unknown>;
    thrive?: Record<string, unknown>;
    org?: Record<string, unknown>; // Deprecated: use thrive instead
    fees_overrides?: Record<string, unknown>;
  };
};

export type UpdateContractFieldsInput = {
  id: string;
  fieldValues: {
    examiner?: Record<string, unknown>;
    contract?: Record<string, unknown>;
    thrive?: Record<string, unknown>;
    org?: Record<string, unknown>; // Deprecated: use thrive instead
    fees_overrides?: Record<string, unknown>;
  };
};

export type PreviewContractResult = {
  renderedHtml: string;
  missingPlaceholders: string[];
};

export type SendContractInput = {
  id: string;
  emailSubject?: string;
  emailBody?: string;
};

export type ListContractsInput = {
  status?: 'ALL' | ContractStatus;
  search?: string;
  templateId?: string;
  examinerProfileId?: string;
  applicationId?: string;
};

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string> };
