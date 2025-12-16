export type AllowedEmailVariable = {
  name: string;
  label: string;
  description?: string;
  example?: string;
  required?: boolean;
};

export type EmailTemplateListItem = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  isActive: boolean;
  updatedAt: string;
};

export type EmailTemplateVersionDto = {
  id: string;
  version: number;
  subject: string;
  bodyHtml: string;
  designJson: unknown;
  createdAt: string;
};

export type EmailTemplateDetailDto = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  isActive: boolean;
  allowedVariables: AllowedEmailVariable[];
  currentVersion: EmailTemplateVersionDto | null;
  versions: EmailTemplateVersionDto[];
  updatedAt: string;
};
