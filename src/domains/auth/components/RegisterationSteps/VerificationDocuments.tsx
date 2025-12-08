"use client";
import React, { useEffect } from "react";
import {
  BackButton,
  ContinueButton,
  ProgressIndicator,
  MultipleFileUploadInput,
} from "@/components";
import {
  verificationDocumentsSchema,
  VerificationDocumentsInput,
} from "@/domains/auth/schemas/auth.schemas";
import { RegStepProps } from "@/domains/auth/types/index";
import {
  RegistrationData,
  useRegistrationStore,
} from "@/domains/auth/state/useRegistrationStore";
import { FormProvider } from "@/components/form";
import { Controller } from "@/lib/form";
import { useForm } from "@/hooks/use-form-hook";

const VerificationDocuments: React.FC<RegStepProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const { merge } = useRegistrationStore();
  // Use selector to directly subscribe to medicalLicense changes
  const medicalLicense = useRegistrationStore(
    (state) => state.data.medicalLicense
  );

  const form = useForm<VerificationDocumentsInput>({
    schema: verificationDocumentsSchema,
    defaultValues: {
      medicalLicense: Array.isArray(medicalLicense)
        ? medicalLicense
        : medicalLicense
        ? [medicalLicense]
        : [],
    },
    mode: "onSubmit",
  });

  // Reset form when store data changes
  useEffect(() => {
    const medicalLicenseValue = Array.isArray(medicalLicense)
      ? medicalLicense
      : medicalLicense
      ? [medicalLicense]
      : [];

    form.reset({
      medicalLicense: medicalLicenseValue,
    });
  }, [medicalLicense, form]);

  const onSubmit = (values: VerificationDocumentsInput) => {
    merge(values as Partial<RegistrationData>);
    onNext();
  };

  // Watch the form field value to check if at least one document is uploaded
  const formMedicalLicense = form.watch("medicalLicense");
  const isFormComplete =
    Array.isArray(formMedicalLicense) && formMedicalLicense.length > 0;

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
        <div className="grow space-y-4 md:px-0">
          <div className="text-center">
            <h3 className="mt-4 mb-2 text-center text-[22px] font-medium text-[#140047] md:mt-5 md:mb-0 md:text-[28px]">
              Upload Verification Documents
            </h3>
          </div>

          {/* Main Upload Area */}
          <div className="mt-8 px-4 md:px-0">
            <Controller
              name="medicalLicense"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="space-y-4">
                  {/* Large Drag and Drop Area */}
                  <div className="relative">
                    <MultipleFileUploadInput
                      name="medicalLicense"
                      label="Verification Documents"
                      value={
                        Array.isArray(field.value)
                          ? field.value
                          : field.value
                          ? [field.value]
                          : []
                      }
                      onChange={(files) => {
                        field.onChange(files);
                      }}
                      accept=".pdf,.doc,.docx"
                      required
                      placeholder="Click to upload or drag and drop files here"
                      error={fieldState.error?.message}
                      showIcon={true}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
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
          <ContinueButton
            onClick={form.handleSubmit(onSubmit)}
            isLastStep={currentStep === totalSteps}
            gradientFrom="#89D7FF"
            gradientTo="#00A8FF"
            disabled={!isFormComplete || form.formState.isSubmitting}
            loading={form.formState.isSubmitting}
          />
        </div>
      </FormProvider>
    </div>
  );
};

export default VerificationDocuments;
