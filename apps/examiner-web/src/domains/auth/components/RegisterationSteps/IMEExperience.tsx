'use client';
import React from 'react';
import { Label } from '@/components/ui/label';
import { BackButton, ContinueButton, ProgressIndicator, SaveAndContinueButton } from '@/components';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  step3IMEExperienceSchema,
  Step3IMEExperienceInput,
} from '@/domains/auth/schemas/auth.schemas';
import { step3InitialValues } from '@/domains/auth/constants/initialValues';
import { useRegistrationStore, RegistrationData } from '@/domains/auth/state/useRegistrationStore';
import { FormProvider, FormDropdown } from '@/components/form';
import { Controller } from '@/lib/form';
import { useForm } from '@/hooks/use-form-hook';
import { RegStepProps } from '@/domains/auth/types/index';
import {
  useAssessmentTypes,
  useRegistrationFormReset,
  useFormCompletion,
  useSaveApplicationProgress,
} from '@/domains/auth/hooks';

const IMEExperince: React.FC<RegStepProps> = ({ onNext, onPrevious, currentStep, totalSteps }) => {
  const { data, merge } = useRegistrationStore();
  const { saveProgress, isSaving } = useSaveApplicationProgress();
  const { assessmentTypes: assessmentTypeOptions, loading: loadingAssessmentTypes } =
    useAssessmentTypes();

  const defaultValues = {
    ...step3InitialValues,
    imesCompleted: data.imesCompleted || '',
    currentlyConductingIMEs: data.currentlyConductingIMEs || '',
    assessmentTypes: data.assessmentTypes || [],
  };

  const form = useForm<Step3IMEExperienceInput>({
    schema: step3IMEExperienceSchema,
    defaultValues,
    mode: 'onSubmit',
  });

  // Reset form when store data changes
  useRegistrationFormReset({
    form,
    defaultValues,
    watchFields: ['imesCompleted', 'currentlyConductingIMEs', 'assessmentTypes'],
  });

  const onSubmit = (values: Step3IMEExperienceInput) => {
    merge(values as unknown as Partial<RegistrationData>);
    onNext();
  };

  // Check if form is complete
  const { isFormComplete } = useFormCompletion({
    form,
    requiredFields: ['imesCompleted', 'currentlyConductingIMEs', 'assessmentTypes'],
  });

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
        <div className="grow pt-4 sm:px-4 sm:py-6 sm:pt-0 md:px-0">
          <div className="space-y-4 sm:space-y-6">
            <h3 className="mb-2 mt-4 text-center text-[22px] font-medium text-[#140047] md:mb-0 md:mt-5 md:text-[28px]">
              IME Background & Experience
            </h3>

            {/* Two-Column Layout */}
            <div className="mt-6 flex w-full flex-col gap-y-6 px-8 md:mt-8 md:px-0">
              {/* First  Row */}
              <div className="flex w-[100%] flex-row justify-between space-y-6">
                {/* Have you completed any IMEs? */}
                <Controller
                  name="imesCompleted"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div className="w-full space-y-2">
                      <Label className="text-[16px] font-medium text-black">
                        Have you completed any IMEs? <span className="text-red-500">*</span>
                      </Label>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex flex-row flex-wrap gap-x-4 gap-y-2 pt-2 sm:gap-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="yes"
                            id="imes-completed-yes"
                            checkedColor="#00A8FF"
                            indicatorColor="#00A8FF"
                          />
                          <Label
                            htmlFor="imes-completed-yes"
                            className="cursor-pointer text-sm font-medium text-gray-700"
                          >
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="no"
                            id="imes-completed-no"
                            checkedColor="#00A8FF"
                            indicatorColor="#00A8FF"
                          />
                          <Label
                            htmlFor="imes-completed-no"
                            className="cursor-pointer text-sm font-medium text-gray-700"
                          >
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                      {fieldState.error &&
                        (() => {
                          const errorMsg = fieldState.error.message;
                          const isRequiredError =
                            errorMsg &&
                            (errorMsg.toLowerCase() === 'required' ||
                              errorMsg.toLowerCase().endsWith(' is required') ||
                              errorMsg.toLowerCase() === 'is required');
                          return !isRequiredError ? (
                            <p className="text-xs text-red-500">{errorMsg}</p>
                          ) : null;
                        })()}
                    </div>
                  )}
                />

                {/* Are you currently conducting IMEs? */}
                <Controller
                  name="currentlyConductingIMEs"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div className="w-full space-y-2">
                      <Label className="text-[16px] font-medium text-black">
                        Are you currently conducting IMEs? <span className="text-red-500">*</span>
                      </Label>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="yes"
                            id="conducting-yes"
                            checkedColor="#00A8FF"
                            indicatorColor="#00A8FF"
                          />
                          <Label htmlFor="conducting-yes" className="cursor-pointer font-normal">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="no"
                            id="conducting-no"
                            checkedColor="#00A8FF"
                            indicatorColor="#00A8FF"
                          />
                          <Label htmlFor="conducting-no" className="cursor-pointer font-normal">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                      {fieldState.error &&
                        (() => {
                          const errorMsg = fieldState.error.message;
                          const isRequiredError =
                            errorMsg &&
                            (errorMsg.toLowerCase() === 'required' ||
                              errorMsg.toLowerCase().endsWith(' is required') ||
                              errorMsg.toLowerCase() === 'is required');
                          return !isRequiredError ? (
                            <p className="text-xs text-red-500">{errorMsg}</p>
                          ) : null;
                        })()}
                    </div>
                  )}
                />
              </div>

              {/* Second Row */}
              <div className="flex w-[45%] flex-row justify-between space-y-6">
                {/* Assessment Types */}
                <FormDropdown
                  name="assessmentTypes"
                  label="Assessment Types"
                  options={assessmentTypeOptions}
                  className="w-full"
                  required
                  multiSelect={true}
                  placeholder={
                    loadingAssessmentTypes
                      ? 'Loading assessment types...'
                      : 'Multi-select (Disability, WSIB, MVA, etc.)'
                  }
                  disabled={loadingAssessmentTypes}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-8 px-2 pb-8 md:mt-12 md:justify-between md:gap-4 md:px-0">
          <BackButton
            onClick={onPrevious}
            disabled={currentStep === 1}
            borderColor="#00A8FF"
            iconColor="#00A8FF"
          />
          <div className="flex items-center gap-4">
            <SaveAndContinueButton
              onClick={() => {
                // Get current form values and save them along with store data
                const currentValues = form.getValues();
                saveProgress(currentValues as Partial<RegistrationData>);
              }}
              loading={isSaving}
              disabled={isSaving || form.formState.isSubmitting}
            />
            <ContinueButton
              onClick={form.handleSubmit(onSubmit)}
              isLastStep={currentStep === totalSteps}
              gradientFrom="#89D7FF"
              gradientTo="#00A8FF"
              disabled={!isFormComplete || form.formState.isSubmitting}
              loading={form.formState.isSubmitting}
            />
          </div>
        </div>
      </FormProvider>
    </div>
  );
};

export default IMEExperince;
