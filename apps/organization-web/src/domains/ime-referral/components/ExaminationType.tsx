'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ExamTypeSchema,
  ExamTypeInitialValues,
  type ExamType,
  type ExamTypeItem,
} from '../schemas/imeReferral';
import { useIMEReferralStore } from '@/store/useImeReferral';
import ContinueButton from '@/components/ContinueButton';
import ProgressIndicator from './ProgressIndicator';
import { type IMEReferralProps } from '@/types/imeReferralProps';
import { type OrganizationTypeOption } from '@/domains/auth/components/Register/OrganizationInfo';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui';

type CaseTypeProps = IMEReferralProps & {
  caseTypes: OrganizationTypeOption[];
};

const ExaminationTypeForm: React.FC<CaseTypeProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
  caseTypes: caseTypeOptions,
}) => {
  const { data, setData, _hasHydrated } = useIMEReferralStore();

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ExamType>({
    resolver: zodResolver(ExamTypeSchema),
    defaultValues: data.step4 || ExamTypeInitialValues,
  });

  const selectedExamTypes = watch('caseTypes') || [];

  const toggleExamType = (option: OrganizationTypeOption) => {
    const caseTypeItem: ExamTypeItem = {
      id: option.value,
      label: option.label,
    };

    const isSelected = selectedExamTypes.some(item => item.id === option.value);

    const updated = isSelected
      ? selectedExamTypes.filter(item => item.id !== option.value)
      : [...selectedExamTypes, caseTypeItem];

    setValue('caseTypes', updated, { shouldValidate: true });
  };

  const isExamTypeSelected = (optionValue: string): boolean => {
    return selectedExamTypes.some(item => item.id === optionValue);
  };

  const onSubmit: SubmitHandler<ExamType> = values => {
    setData('step4', values);
    if (onNext) onNext();
  };

  if (!_hasHydrated) {
    return null;
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <h1 className="mb-6 text-[24px] font-semibold sm:text-[28px] md:text-[32px] lg:text-[36px] xl:text-[40px]">
        New Case Request
      </h1>
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
      <div
        className="min-h-[500px] w-full max-w-full rounded-[20px] bg-white py-4 md:rounded-[30px] md:px-[55px] md:py-8"
        style={{ boxShadow: '0px 0px 36.35px 0px #00000008' }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-full">
          <div className="w-full max-w-full space-y-6">
            <div className="w-full max-w-full px-4 md:px-0">
              <h2 className="mb-12 text-[24px] font-semibold leading-[36.02px] tracking-[-0.02em] md:text-[36.02px]">
                Type of Examination(s) Required
              </h2>
            </div>

            {/* Exam Type Selection Grid */}
            <div className="w-full max-w-full px-4 md:px-0">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
                {caseTypeOptions.map(option => {
                  const isSelected = isExamTypeSelected(option.value);
                  return (
                    <Button
                      key={option.value}
                      type="button"
                      onClick={() => toggleExamType(option)}
                      className={`flex min-h-[50px] items-center justify-center rounded-full text-[17.98px] font-normal leading-[19.8px] tracking-[-0.02em] hover:bg-[#000093] ${
                        isSelected
                          ? 'bg-gradient-to-b from-[#000080] to-[#3535AD] text-white'
                          : 'bg-[#F2F2F2] text-[#000000] hover:text-[#FFFFFF]'
                      } `}
                    >
                      {option.label}
                    </Button>
                  );
                })}
              </div>
              {errors.caseTypes && (
                <p className="mt-2 text-sm text-red-500">{errors.caseTypes.message}</p>
              )}
            </div>

            <div className="mb-8 mt-20 flex flex-row justify-between gap-4 px-4 md:mb-0 md:px-0">
              <BackButton
                onClick={onPrevious}
                disabled={currentStep === 1}
                borderColor="#000080"
                iconColor="#000080"
                isSubmitting={false}
              />
              <ContinueButton
                isSubmitting={isSubmitting}
                isLastStep={currentStep === totalSteps}
                color="#000080"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExaminationTypeForm;
