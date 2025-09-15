'use client';
import React, { useState } from 'react';
import { type IMEReferralFormProps } from '@/shared/types/imeReferral/imeReferralStepsProps';
import { useIMEReferralStore } from '@/store/useIMEReferralStore';
import { type CaseInfo } from '@/shared/validation/imeReferral/imeReferralValidation';
import ContinueButton from '@/components/ContinueButton';
import BackButton from '@/components/BackButton';
import ProgressIndicator from '../ProgressIndicator';
import CaseList from './CaseList';
import CaseForm from './CaseForm';
import { toast } from 'sonner';
import { type DropdownOption } from '../../types/CaseInfo';

type CaseInfoProps = IMEReferralFormProps & {
  caseTypes: DropdownOption[];
  examFormats: DropdownOption[];
  requestedSpecialties: DropdownOption[];
};

const CaseInfo: React.FC<CaseInfoProps> = ({
  onNext,
  onPrevious,
  currentStep = 1,
  totalSteps = 1,
  caseTypes: caseTypeOptions,
  examFormats: examFormatOptions,
  requestedSpecialties: requestedSpecialityOptions,
}) => {
  const { data, addCase, updateCase, removeCase } = useIMEReferralStore();
  const cases = data.step2?.cases || [];

  const [isAddingCase, setIsAddingCase] = useState(true);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingCase, setEditingCase] = useState<CaseInfo | undefined>();

  const handleCaseSubmit = (values: CaseInfo) => {
    if (editingIndex !== null) {
      updateCase(editingIndex, values);
    } else {
      addCase(values);
    }
    handleCancelForm();
  };

  const handleEditCase = (index: number) => {
    const caseToEdit = cases[index];
    if (caseToEdit) {
      setEditingCase(caseToEdit);
      setEditingIndex(index);
      setIsAddingCase(true);
    }
  };

  const handleAddNewCase = () => {
    if (isAddingCase) {
      toast.error('Please complete the current case form before adding a new one.');
      return;
    }
    setEditingCase(undefined);
    setEditingIndex(null);
    setIsAddingCase(true);
  };

  const handleCancelForm = () => {
    setIsAddingCase(false);
    setEditingIndex(null);
    setEditingCase(undefined);
  };

  const handleContinue = () => {
    if (!validateCaseList(cases)) {
      return;
    }
    if (onNext) onNext();
  };

  const validateCaseList = (cases: CaseInfo[]): boolean => {
    return cases.length > 0;
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
      <div
        className="w-full max-w-full rounded-[20px] bg-white px-4 py-4 md:rounded-[30px] md:px-[60px] md:py-12"
        style={{ boxShadow: '0px 0px 36.35px 0px #00000008' }}
      >
        {/* Header */}
        <header className="mb-6 w-full max-w-full md:mb-8">
          <h2 className="text-2xl leading-tight font-semibold tracking-[-0.02em] break-words text-[#000000] sm:text-3xl md:text-2xl md:leading-[36.02px]">
            Case Information
          </h2>
        </header>

        {/* Cases List */}
        <CaseList
          cases={cases}
          onEdit={handleEditCase}
          handleAddNewCase={handleAddNewCase}
          onRemove={removeCase}
          caseTypes={caseTypeOptions}
          examFormats={examFormatOptions}
          requestedSpecialties={requestedSpecialityOptions}
        />

        {/* Add/Edit Case Form */}
        {(isAddingCase || cases.length === 0) && (
          <CaseForm
            onSubmit={handleCaseSubmit}
            onCancel={handleCancelForm}
            initialValues={editingCase}
            isEditing={editingIndex !== null}
            editIndex={editingIndex}
            cases={cases}
            isSubmitting={false}
            caseTypes={caseTypeOptions}
            examFormats={examFormatOptions}
            requestedSpecialties={requestedSpecialityOptions}
          />
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between px-4 md:mt-0 md:mb-0 md:px-0">
          <BackButton
            onClick={onPrevious}
            disabled={currentStep === 1}
            borderColor="#000080"
            iconColor="#000080"
            isSubmitting={false}
          />
          <ContinueButton
            onClick={handleContinue}
            isSubmitting={false}
            isLastStep={currentStep === totalSteps}
            color="#000080"
            disabled={cases.length === 0}
          />
        </div>
      </div>
    </div>
  );
};

export default CaseInfo;
