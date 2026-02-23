export type ExaminationType = {
  id: string;
  name: string;
  shortForm: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type ExaminationTypeData = {
  id: string;
  name: string;
  shortForm: string | null;
  description: string | null;
  createdAt: string;
};

export type CreateExaminationTypeInput = {
  name: string;
  shortForm?: string;
  description?: string;
};

export type UpdateExaminationTypeInput = Partial<CreateExaminationTypeInput>;
