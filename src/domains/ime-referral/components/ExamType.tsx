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

type ExamTypeProps = IMEReferralProps & {
  examTypes: OrganizationTypeOption[];
};

const ExamTypeForm: React.FC<ExamTypeProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
  examTypes: examTypeOptions,
}) => {
  const { data, setData } = useIMEReferralStore();

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ExamType>({
    resolver: zodResolver(ExamTypeSchema),
    defaultValues: data.step3 || ExamTypeInitialValues,
  });

  const selectedExamTypes = watch('examTypes') || [];

  const toggleExamType = (option: OrganizationTypeOption) => {
    const examTypeItem: ExamTypeItem = {
      id: option.value,
      label: option.label,
    };

    const isSelected = selectedExamTypes.some(item => item.id === option.value);

    const updated = isSelected
      ? selectedExamTypes.filter(item => item.id !== option.value)
      : [...selectedExamTypes, examTypeItem];

    setValue('examTypes', updated, { shouldValidate: true });
  };

  const isExamTypeSelected = (optionValue: string): boolean => {
    return selectedExamTypes.some(item => item.id === optionValue);
  };

  const onSubmit: SubmitHandler<ExamType> = values => {
    setData('step3', values);
    if (onNext) onNext();
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
      <div
        className="w-full max-w-full rounded-[20px] bg-white py-4 md:rounded-[30px] md:px-[60px] md:py-12"
        style={{ boxShadow: '0px 0px 36.35px 0px #00000008' }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-full">
          <div className="w-full max-w-full space-y-6">
            <div className="w-full max-w-full px-4 md:px-0">
              <h2 className="mb-6 text-[23px] leading-[36.02px] font-semibold tracking-[-0.02em] text-[#000000] md:text-2xl">
                Type of Examination(s) Required
              </h2>
            </div>

            {/* Exam Type Selection Grid */}
            <div className="w-full max-w-full px-4 md:px-0">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
                {examTypeOptions.map(option => {
                  const isSelected = isExamTypeSelected(option.value);
                  return (
                    <Button
                      key={option.value}
                      type="button"
                      onClick={() => toggleExamType(option)}
                      className={`flex min-h-[50px] items-center justify-center rounded-full text-[17.98px] leading-[19.8px] font-normal tracking-[-0.02em] hover:bg-[#000093] ${
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
              {errors.examTypes && (
                <p className="mt-2 text-sm text-red-500">{errors.examTypes.message}</p>
              )}
            </div>

            <div className="mt-12 mb-8 flex flex-row justify-center gap-4 md:mb-0 md:justify-between">
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

export default ExamTypeForm;
