export type CaseType = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type CaseTypeData = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
};

export type CreateCaseTypeInput = {
  name: string;
  description?: string;
};

export type UpdateCaseTypeInput = Partial<CreateCaseTypeInput>;
