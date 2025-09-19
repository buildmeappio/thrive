'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { Label } from '@radix-ui/react-label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dropdown } from '@/components/Dropdown';
import {
  createExaminationSchema,
  ExaminationInitialValues,
  type ExaminationData,
} from '../schemas/imeReferral';
import { useIMEReferralStore } from '@/store/useImeReferral';
import ContinueButton from '@/components/ContinueButton';
import ProgressIndicator from './ProgressIndicator';
import { type IMEReferralProps } from '@/types/imeReferralProps';
import BackButton from '@/components/BackButton';
import { UrgencyLevels } from '@/config/urgencyLevel.config';
import { type DropdownOption } from '../types/CaseInfo';

type ExaminationProps = IMEReferralProps & {
  examinationTypes: DropdownOption[];
};

const ExaminationDetails: React.FC<ExaminationProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
  examinationTypes: examinationTypeOptions,
}) => {
  const { data, setData } = useIMEReferralStore();

  // Get selected exam types from step3
  const selectedExamTypes = data.step3?.examTypes || [];

  // Create dynamic schema based on selected exam types
  const dynamicSchema = useMemo(() => {
    return createExaminationSchema(selectedExamTypes);
  }, [selectedExamTypes]);

  // Create initial values with dynamic fields
  const initialValues = useMemo(() => {
    const baseValues: any = { ...ExaminationInitialValues };

    // Add dynamic fields from existing data or default values
    selectedExamTypes.forEach((examType: { id: string; label: string }) => {
      const fieldPrefix = examType.label.toLowerCase().replace(/\s+/g, '');
      const urgencyKey = `${fieldPrefix}UrgencyLevel`;
      const dueDateKey = `${fieldPrefix}DueDate`;
      const instructionsKey = `${fieldPrefix}Instructions`;

      baseValues[urgencyKey] = (data.step4 as any)?.[urgencyKey] || '';
      baseValues[dueDateKey] = (data.step4 as any)?.[dueDateKey] || '';
      baseValues[instructionsKey] = (data.step4 as any)?.[instructionsKey] || '';
    });

    // Set base fields from existing data
    if (data.step4?.reasonForReferral) {
      baseValues.reasonForReferral = data.step4.reasonForReferral;
    }
    if (data.step4?.examinationType) {
      baseValues.examinationType = data.step4.examinationType;
    }

    return baseValues;
  }, [selectedExamTypes, data.step4]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: initialValues,
  });

  const watchedValues = watch();

  const onSubmit: SubmitHandler<any> = values => {
    setData('step4', values as ExaminationData);
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
                Case Information
              </h2>

              {/* Case Type and Reason for Referral */}
              <div className="mb-8 grid w-full max-w-full grid-cols-1 gap-4">
                <div className="w-1/3 space-y-2">
                  <Label htmlFor="examinationType">
                    Case Type<span className="text-red-500">*</span>
                  </Label>
                  <Dropdown
                    id="examinationType"
                    label=""
                    value={watchedValues.examinationType || ''}
                    onChange={(val: string) => setValue('examinationType', val)}
                    options={examinationTypeOptions}
                    placeholder="Select Examination Type"
                    className="w-full"
                    icon={false}
                  />
                  {errors.examinationType && (
                    <p className="text-sm text-red-500">
                      {typeof errors.examinationType?.message === 'string'
                        ? errors.examinationType.message
                        : ''}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reasonForReferral">
                    Reason for referral<span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    disabled={isSubmitting}
                    {...register('reasonForReferral')}
                    placeholder="Type here"
                    className={`mt-2 min-h-[100px] w-full resize-none ${errors.reasonForReferral ? 'border-red-500' : ''}`}
                  />
                  {errors.reasonForReferral && (
                    <p className="text-sm text-red-500">
                      {typeof errors.reasonForReferral?.message === 'string'
                        ? errors.reasonForReferral.message
                        : ''}
                    </p>
                  )}
                </div>
              </div>

              {/* Dynamic sections based on selected exam types from step3 */}
              {selectedExamTypes.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <p>
                    No examination types selected. Please go back to Step 3 to select examination
                    types.
                  </p>
                </div>
              ) : (
                selectedExamTypes.map((examType: { id: string; label: string }) => {
                  const fieldPrefix = examType.label.toLowerCase().replace(/\s+/g, '');
                  const urgencyKey = `${fieldPrefix}UrgencyLevel`;
                  const dueDateKey = `${fieldPrefix}DueDate`;
                  const instructionsKey = `${fieldPrefix}Instructions`;

                  return (
                    <div key={examType.id} className="mb-8 w-full max-w-full">
                      <h3 className="mb-4 text-lg font-medium text-[#000000]">{examType.label}</h3>

                      <div className="mb-4 grid w-1/2 grid-cols-1 gap-0 md:grid-cols-2">
                        <div className="w-2/3 space-y-2">
                          <Label htmlFor={urgencyKey}>
                            Urgency Level<span className="text-red-500">*</span>
                          </Label>
                          <Dropdown
                            id={urgencyKey}
                            label=""
                            value={watchedValues[urgencyKey] || ''}
                            onChange={(val: string) => setValue(urgencyKey, val)}
                            options={UrgencyLevels}
                            placeholder="Select"
                            className="w-full"
                            icon={false}
                          />
                          {errors[urgencyKey] &&
                            typeof errors[urgencyKey]?.message === 'string' && (
                              <p className="text-sm text-red-500">{errors[urgencyKey]?.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={dueDateKey}>
                            Due Date<span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Input
                              disabled={isSubmitting}
                              {...register(dueDateKey)}
                              type="date"
                              className={`w-full pr-10 ${
                                errors[dueDateKey] ? 'border-red-500' : ''
                              }`}
                            />
                          </div>
                          {errors[dueDateKey] &&
                            typeof errors[dueDateKey]?.message === 'string' && (
                              <p className="text-sm text-red-500">{errors[dueDateKey]?.message}</p>
                            )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={instructionsKey}>
                          Specific Instructions/Notes<span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          disabled={isSubmitting}
                          {...register(instructionsKey)}
                          placeholder="Type here"
                          className="mt-2 min-h-[100px] w-full resize-none"
                        />
                        {errors[instructionsKey] &&
                          typeof errors[instructionsKey]?.message === 'string' && (
                            <p className="text-sm text-red-500">
                              {errors[instructionsKey]?.message}
                            </p>
                          )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mb-8 flex flex-row justify-center gap-4 md:mb-0 md:justify-between">
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

export default ExaminationDetails;
