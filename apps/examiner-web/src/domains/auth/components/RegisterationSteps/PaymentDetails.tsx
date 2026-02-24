'use client';
import React, { useEffect } from 'react';
import { Input } from '@/components/ui';
import { BackButton, ContinueButton, ProgressIndicator } from '@/components';
import {
  step7PaymentDetailsSchema,
  Step7PaymentDetailsInput,
} from '@/domains/auth/schemas/auth.schemas';
import { step7InitialValues } from '@/domains/auth/constants/initialValues';
import { RegStepProps } from '@/domains/auth/types/index';
import { RegistrationData, useRegistrationStore } from '@/domains/auth/state/useRegistrationStore';
import { FormProvider, FormField } from '@/components/form';
import { UseFormRegisterReturn } from '@/lib/form';
import { useForm } from '@/hooks/use-form-hook';
import { CircleDollarSign } from 'lucide-react';

const PaymentDetails: React.FC<RegStepProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const { data, merge } = useRegistrationStore();

  const form = useForm<Step7PaymentDetailsInput>({
    schema: step7PaymentDetailsSchema,
    defaultValues: {
      ...step7InitialValues,
      IMEFee: data.IMEFee,
      recordReviewFee: data.recordReviewFee,
      hourlyRate: data.hourlyRate,
      cancellationFee: data.cancellationFee,
    },
    mode: 'onSubmit',
  });

  // Reset form when store data changes
  useEffect(() => {
    form.reset({
      ...step7InitialValues,
      IMEFee: data.IMEFee,
      recordReviewFee: data.recordReviewFee,
      hourlyRate: data.hourlyRate,
      cancellationFee: data.cancellationFee,
    });
  }, [data.IMEFee, data.recordReviewFee, data.hourlyRate, data.cancellationFee, form]);

  const onSubmit = (values: Step7PaymentDetailsInput) => {
    merge(values as Partial<RegistrationData>);
    onNext();
  };

  return (
    <div
      className="mt-4 flex w-full flex-col rounded-[20px] bg-white md:mt-6 md:w-[950px] md:rounded-[55px] md:px-[75px]"
      style={{ boxShadow: '0px 0px 36.35px 0px #00000008' }}
    >
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        gradientFrom="#89D7FF"
        gradientTo="#00A8FF"
      />

      <FormProvider form={form} onSubmit={onSubmit}>
        <div className="grow space-y-6 pb-8 md:px-0">
          <div className="pt-1 md:pt-0">
            <h3 className="mb-2 mt-4 text-center text-[22px] font-normal text-[#140047] md:mb-0 md:mt-5 md:text-[28px]">
              Fee Structure
            </h3>

            {/* Fee Structure Section */}
            <div className="mt-8 px-8 md:px-0">
              <div className="grid grid-cols-1 gap-x-14 gap-y-5 md:grid-cols-2">
                <FormField name="IMEFee" label="Standard IME Fee (CAD)" required>
                  {(field: UseFormRegisterReturn & { error?: boolean }) => (
                    <Input
                      {...field}
                      id="IMEFee"
                      icon={CircleDollarSign}
                      placeholder="Enter standard IME fee"
                      type="number"
                      step="0.01"
                      min="0"
                      validationType="numeric"
                    />
                  )}
                </FormField>

                <FormField name="recordReviewFee" label="Record Review Fee (CAD)" required>
                  {(field: UseFormRegisterReturn & { error?: boolean }) => (
                    <Input
                      {...field}
                      id="recordReviewFee"
                      icon={CircleDollarSign}
                      placeholder="Enter record review fee"
                      type="number"
                      step="0.01"
                      min="0"
                      validationType="numeric"
                    />
                  )}
                </FormField>

                <FormField name="hourlyRate" label="Hourly Rate (CAD)">
                  {(field: UseFormRegisterReturn & { error?: boolean }) => (
                    <Input
                      {...field}
                      id="hourlyRate"
                      icon={CircleDollarSign}
                      placeholder="Enter hourly rate"
                      type="number"
                      step="0.01"
                      min="0"
                      validationType="numeric"
                    />
                  )}
                </FormField>

                <FormField name="cancellationFee" label="Cancellation Fee (CAD)" required>
                  {(field: UseFormRegisterReturn & { error?: boolean }) => (
                    <Input
                      {...field}
                      id="cancellationFee"
                      icon={CircleDollarSign}
                      placeholder="Enter cancellation fee"
                      type="number"
                      step="0.01"
                      min="0"
                      validationType="numeric"
                    />
                  )}
                </FormField>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-row justify-center gap-8 px-2 pb-8 md:mt-12 md:justify-between md:gap-4 md:px-0">
            <BackButton
              onClick={onPrevious}
              disabled={currentStep === 1}
              borderColor="#00A8FF"
              iconColor="#00A8FF"
            />
            <ContinueButton
              onClick={form.handleSubmit(onSubmit)}
              isLastStep={currentStep === totalSteps}
              gradientFrom="#89D7FF"
              gradientTo="#00A8FF"
              disabled={form.formState.isSubmitting}
              loading={form.formState.isSubmitting}
            />
          </div>
        </div>
      </FormProvider>
    </div>
  );
};

export default PaymentDetails;
