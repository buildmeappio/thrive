import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import CaseFormFields from './CaseFormFields';
import type { DropdownOption } from '../../types/CaseInfo';
import { type CaseInfo, CaseInfoSchema, CaseInitialValues } from '../../schemas/imeReferral';
import { toast } from 'sonner';

type CaseFormProps = {
  onSubmit: (data: CaseInfo) => void;
  onCancel: () => void;
  initialValues?: CaseInfo;
  isEditing?: boolean;
  editIndex?: number | null;
  cases: CaseInfo[];
  isSubmitting?: boolean;
  caseTypes: DropdownOption[];
  examFormats: DropdownOption[];
  requestedSpecialties: DropdownOption[];
};

const CaseForm: React.FC<CaseFormProps> = ({
  onSubmit,
  onCancel,
  initialValues,
  isEditing = false,
  editIndex = null,
  isSubmitting = false,
  cases,
  caseTypes,
  examFormats,
  requestedSpecialties,
}) => {
  const form = useForm<CaseInfo>({
    resolver: zodResolver(CaseInfoSchema),
    defaultValues: initialValues || CaseInitialValues,
    mode: 'onSubmit',
  });

  const handleAiRewrite = () => {
    console.log('AI Rewrite requested');
  };

  const getCaseTitle = (index: number | null, isEditing: boolean): string => {
    return isEditing && index !== null ? `Edit Case ${index + 1}` : 'Add New Case';
  };

  const handleSubmit = form.handleSubmit((data: CaseInfo) => {
    const duplicateCaseType: boolean = cases.some(
      (caseItem: CaseInfo, idx: number) => caseItem.caseType === data.caseType && idx !== editIndex
    );

    if (duplicateCaseType) {
      toast.error(
        'A case with this Case Type already exists. Please choose a different Case Type.'
      );
      return;
    }

    onSubmit(data);
  });

  return (
    <form onSubmit={handleSubmit} noValidate className="mb-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">{getCaseTitle(editIndex, isEditing)}</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <CaseFormFields
        control={form.control}
        errors={form.formState.errors}
        watch={form.watch}
        setValue={form.setValue}
        isSubmitting={isSubmitting}
        onAiRewrite={handleAiRewrite}
        caseTypes={caseTypes}
        examFormats={examFormats}
        requestedSpecialties={requestedSpecialties}
      />

      {/* Form Buttons */}
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-full border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-[#000093] text-white hover:bg-[#000093]"
        >
          {isEditing ? 'Update Case' : 'Add Case'}
        </Button>
      </div>
    </form>
  );
};

export default CaseForm;
