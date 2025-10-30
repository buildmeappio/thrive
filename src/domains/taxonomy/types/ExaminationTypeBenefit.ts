export type ExaminationTypeBenefit = {
  id: string;
  examinationTypeId: string;
  benefit: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type ExaminationTypeBenefitData = {
  id: string;
  examinationTypeId: string;
  examinationTypeName: string;
  benefit: string;
  createdAt: string;
};

export type CreateExaminationTypeBenefitInput = {
  examinationTypeId: string;
  benefit: string;
};

export type UpdateExaminationTypeBenefitInput = Partial<CreateExaminationTypeBenefitInput>;

