export type BenefitData = {
  id: string;
  examinationTypeId: string;
  examinationTypeName: string;
  benefit: string;
  description?: string | null;
  createdAt: string;
};

export type CreateBenefitInput = {
  examinationTypeId: string;
  benefit: string;
  description?: string | null;
};

export type UpdateBenefitInput = {
  examinationTypeId?: string;
  benefit?: string;
  description?: string | null;
};
