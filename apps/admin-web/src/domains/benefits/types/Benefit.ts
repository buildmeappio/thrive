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

export type BenefitFormData = {
  examinationTypeId: string;
  benefit: string;
  description?: string;
};

export type ExaminationTypeOption = {
  label: string;
  value: string;
};

export type BenefitFormProps = {
  mode: 'create' | 'edit';
  benefit?: BenefitData;
  /** Base path for back link and redirect after save (e.g. "/benefits" for tenant, "/dashboard/benefits" for private) */
  basePath?: string;
  /** When provided, used instead of internal create action (e.g. tenant create) */
  onCreate?: (data: CreateBenefitInput) => Promise<{ success: boolean; error?: string }>;
  /** When provided, used instead of internal update action (e.g. tenant update) */
  onUpdate?: (
    id: string,
    data: UpdateBenefitInput
  ) => Promise<{ success: boolean; error?: string }>;
  /** When provided, used instead of useExaminationTypes hook (e.g. tenant exam types from server) */
  examinationTypes?: ExaminationTypeOption[];
};
