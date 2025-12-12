export type CaseStatus = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type CaseStatusData = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
};

export type CreateCaseStatusInput = {
  name: string;
  description?: string;
};

export type UpdateCaseStatusInput = Partial<CreateCaseStatusInput>;
