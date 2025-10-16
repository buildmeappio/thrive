"use client";
import React, { useEffect } from "react";
import { Input } from "@/components/ui";
import {
  BackButton,
  ContinueButton,
  ProgressIndicator,
  FileUploadInput,
} from "@/components";
import {
  step2MedicalCredentialsSchema,
  Step2MedicalCredentialsInput,
} from "@/domains/auth/schemas/auth.schemas";
import { step2InitialValues } from "@/domains/auth/constants/initialValues";
import { RegStepProps } from "@/domains/auth/types/index";
import { medicalSpecialtyOptions } from "@/constants/options";
import {
  RegistrationData,
  useRegistrationStore,
} from "@/domains/auth/state/useRegistrationStore";
// import DatePickerInput from "@/components/DatePickerInput";
import { FormProvider, FormField, FormDropdown } from "@/components/form";
import { Controller, UseFormRegisterReturn } from "@/lib/form";
import { useForm } from "@/hooks/use-form-hook";
import { provinceOptions } from "@/constants/options";

const MedicalCredentials: React.FC<RegStepProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const { data, merge } = useRegistrationStore();
  const [isClient, setIsClient] = React.useState(false);

  // Ensure component only renders on client to avoid hydration mismatch
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<Step2MedicalCredentialsInput>({
    schema: step2MedicalCredentialsSchema,
    defaultValues: {
      ...step2InitialValues,
      medicalSpecialty: data.medicalSpecialty,
      licenseNumber: data.licenseNumber,
      provinceOfLicensure: data.provinceOfLicensure,
      // licenseExpiryDate: data.licenseExpiryDate,
      medicalLicense: data.medicalLicense,
      cvResume: data.cvResume,
    },
    mode: "onSubmit",
  });

  // Reset form when store data changes
  useEffect(() => {
    form.reset({
      ...step2InitialValues,
      medicalSpecialty: data.medicalSpecialty,
      licenseNumber: data.licenseNumber,
      provinceOfLicensure: data.provinceOfLicensure,
      // licenseExpiryDate: data.licenseExpiryDate,
      medicalLicense: data.medicalLicense,
      cvResume: data.cvResume,
    });
  }, [
    data.medicalSpecialty,
    data.licenseNumber,
    data.provinceOfLicensure,
    data.medicalLicense,
    data.cvResume,
    form,
  ]);

  const onSubmit = (values: Step2MedicalCredentialsInput) => {
    merge(values as Partial<RegistrationData>);
    onNext();
  };

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div
        className="mt-4 w-full rounded-[20px] bg-white md:mt-6 md:w-[950px] md:rounded-[55px] md:px-[75px]"
        style={{ boxShadow: "0px 0px 36.35px 0px #00000008" }}>
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
      style={{ boxShadow: "0px 0px 36.35px 0px #00000008" }}>
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        gradientFrom="#89D7FF"
        gradientTo="#00A8FF"
      />

      <FormProvider form={form} onSubmit={onSubmit}>
        <div className="flex-grow space-y-4 md:px-0">
          <div className="text-center">
            <h3 className="mt-4 mb-2 text-center text-[22px] font-normal text-[#140047] md:mt-5 md:mb-0 md:text-[28px]">
              Enter Your Medical Credentials
            </h3>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-x-14 gap-y-4 md:mt-8 md:grid-cols-2 md:px-0 px-8">
            <FormDropdown
              name="medicalSpecialty"
              label="Medical Specialties"
              options={medicalSpecialtyOptions}
              required
              placeholder="Select Specialty"
              multiSelect={true}
              icon={null}
            />

            <FormField name="licenseNumber" label="License Number" required>
              {(field: UseFormRegisterReturn & { error?: boolean }) => (
                <Input
                  {...field}
                  id="licenseNumber"
                  placeholder="CPSO #09234"
                />
              )}
            </FormField>

            <FormDropdown
              name="provinceOfLicensure"
              label="Province of Licensure"
              options={provinceOptions}
              required
              placeholder="Select Province"
              icon={null}
            />

            {/* <Controller
              name="licenseExpiryDate"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <DatePickerInput
                    name="licenseExpiryDate"
                    label="License Expiry Date"
                    placeholder="December 31, 2025"
                    value={field.value}
                    onChange={(date) => {
                      const dateString = date ? date.toISOString() : "";
                      field.onChange(dateString);
                    }}
                    error={fieldState.error?.message}
                    required
                  />
                </div>
              )}
            /> */}

            <Controller
              name="medicalLicense"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <FileUploadInput
                    name="medicalLicense"
                    label="Upload Medical License"
                    value={field.value}
                    onChange={(file) => {
                      field.onChange(file);
                    }}
                    accept=".pdf,.doc,.docx"
                    required
                    placeholder="Upload Medical License"
                    error={fieldState.error?.message}
                    showIcon={false}
                  />
                </div>
              )}
            />

            <div className="md:col-span-2 md:flex md:justify-center">
              <Controller
                name="cvResume"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-2 md:w-1/2">
                    <FileUploadInput
                      name="cvResume"
                      label="Upload CV / Resume"
                      value={field.value}
                      onChange={(file) => {
                        field.onChange(file);
                      }}
                      accept=".pdf,.doc,.docx"
                      required
                      placeholder="Upload CV / Resume"
                      error={fieldState.error?.message}
                      showIcon={false}
                    />
                  </div>
                )}
              />
            </div>
          </div>
        </div>

        <div className="pt-8 md:pt-2 flex justify-center gap-8 px-2 pb-8 md:justify-between md:gap-4 md:px-0">
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
      </FormProvider>
    </div>
  );
};

export default MedicalCredentials;
