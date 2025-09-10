import { type CaseInfo } from '@/shared/validation/imeReferral/imeReferralValidation';

export interface CaseFormProps {
  onSubmit: (data: CaseInfo) => void;
  onCancel: () => void;
  initialValues?: CaseInfo;
  isEditing?: boolean;
  editIndex?: number;
  isSubmitting?: boolean;
}

export interface CaseItemProps {
  caseItem: CaseInfo;
  index: number;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  isDisabled?: boolean;
}
