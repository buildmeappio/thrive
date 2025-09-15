import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CaseInfoSchema,
  CaseInitialValues,
  type CaseInfo,
} from '@/shared/validation/imeReferral/imeReferralValidation';

export const useCaseForm = (
  onSubmitCase: (values: CaseInfo, editIndex?: number) => void,
  initialValues?: CaseInfo
) => {
  const [isAddingCase, setIsAddingCase] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const form = useForm<CaseInfo>({
    defaultValues: initialValues || CaseInitialValues,
    resolver: zodResolver(CaseInfoSchema),
    mode: 'onBlur',
  });

  const handleSubmit: SubmitHandler<CaseInfo> = values => {
    onSubmitCase(values, editingIndex ?? undefined);
    handleCancel();
  };

  const handleEdit = (index: number, caseData: CaseInfo) => {
    form.reset(caseData);
    setEditingIndex(index);
    setIsAddingCase(true);
  };

  const handleCancel = () => {
    setIsAddingCase(false);
    setEditingIndex(null);
    form.reset(CaseInitialValues);
  };

  const handleAddNew = () => {
    setIsAddingCase(true);
    setEditingIndex(null);
    form.reset(CaseInitialValues);
  };

  return {
    form,
    isAddingCase,
    editingIndex,
    handleSubmit,
    handleEdit,
    handleCancel,
    handleAddNew,
  };
};
