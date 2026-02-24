'use client';
import React from 'react';
import { Input } from '@/components/ui';
import { BackButton, ContinueButton, ProgressIndicator, SaveAndContinueButton } from '@/components';
import {
  step2MedicalCredentialsSchema,
  Step2MedicalCredentialsInput,
} from '@/domains/auth/schemas/auth.schemas';
import { step2InitialValues } from '@/domains/auth/constants/initialValues';
import { RegStepProps } from '@/domains/auth/types/index';
import { RegistrationData, useRegistrationStore } from '@/domains/auth/state/useRegistrationStore';
import { FormProvider, FormField, FormDropdown } from '@/components/form';
import { UseFormRegisterReturn } from '@/lib/form';
import { useForm } from '@/hooks/use-form-hook';
import { provinces } from '@/constants/options';
import {
  useExamTypes,
  useRegistrationFormReset,
  useFormCompletion,
  useSaveApplicationProgress,
} from '@/domains/auth/hooks';

const MedicalCredentials: React.FC<RegStepProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const { data, merge, yearsOfExperience } = useRegistrationStore();
  const { saveProgress, isSaving } = useSaveApplicationProgress();
  const [isClient, setIsClient] = React.useState(false);
  const { examTypes, loading: loadingExamTypes } = useExamTypes();

  // Ensure component only renders on client to avoid hydration mismatch
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const defaultValues = {
    ...step2InitialValues,
    licenseNumber: data.licenseNumber,
    licenseIssuingProvince: data.licenseIssuingProvince || '',
    medicalSpecialty: data.medicalSpecialty || [],
    yearsOfIMEExperience: data.yearsOfIMEExperience || '',
    medicalLicense: data.medicalLicense,
  };

  const form = useForm<Step2MedicalCredentialsInput>({
    schema: step2MedicalCredentialsSchema,
    defaultValues,
    mode: 'onSubmit',
  });

  // Reset form when store data changes
  useRegistrationFormReset({
    form,
    defaultValues,
    watchFields: [
      'licenseNumber',
      'licenseIssuingProvince',
      'medicalSpecialty',
      'yearsOfIMEExperience',
      'medicalLicense',
    ],
  });

  const onSubmit = (values: Step2MedicalCredentialsInput) => {
    merge(values as Partial<RegistrationData>);
    onNext();
  };

  // Check if form is complete
  const { isFormComplete } = useFormCompletion({
    form,
    requiredFields: [
      'medicalSpecialty',
      'licenseNumber',
      'licenseIssuingProvince',
      'yearsOfIMEExperience',
    ],
  });

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div
        className="mt-4 w-full rounded-[20px] bg-white md:mt-6 md:w-[950px] md:rounded-[55px] md:px-[75px]"
        style={{ boxShadow: '0px 0px 36.35px 0px #00000008' }}
      >
        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={totalSteps}
          gradientFrom="#89D7FF"
          gradientTo="#00A8FF"
        />
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

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
        <div className="grow space-y-4 md:px-0">
          <div className="text-center">
            <h3 className="mb-2 mt-4 text-center text-[22px] font-medium text-[#140047] md:mb-0 md:mt-5 md:text-[28px]">
              Enter Your Medical Credentials
            </h3>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-x-14 gap-y-3 px-8 md:mt-6 md:grid-cols-2 md:px-0">
            {/* Row 1: Medical License Number, License Issuing Province */}
            <FormField name="licenseNumber" label="License/Registration Number" required>
              {(field: UseFormRegisterReturn & { error?: boolean }) => (
                <Input
                  {...field}
                  id="licenseNumber"
                  placeholder="Enter your license/registration number"
                  validationType="license"
                />
              )}
            </FormField>

            <FormDropdown
              name="licenseIssuingProvince"
              label="License/Registration Issuing Province"
              required
              options={provinces}
              placeholder="Select License/Registration Issuing Province"
              icon={null}
            />

            {/* Row 2: Medical Specialties, Years of IME Experience */}
            <FormDropdown
              name="medicalSpecialty"
              label="Medical Specialties"
              options={examTypes}
              required
              placeholder={
                loadingExamTypes ? 'Loading medical specialties...' : 'Select Medical Specialties'
              }
              multiSelect={true}
              icon={null}
              disabled={loadingExamTypes}
            />

            <FormDropdown
              name="yearsOfIMEExperience"
              label="Years of IME Experience"
              options={yearsOfExperience.map(year => ({
                value: year.id,
                label: year.name,
              }))}
              required
              placeholder="Select Years"
              icon={null}
            />
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

export default MedicalCredentials;
