"use client";
import React, { useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  ContinueButton,
  BackButton,
  ProgressIndicator,
  // FileUploadInput,
} from "@/components";
// import { Download } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { RegStepProps } from "@/domains/auth/types/index";
import {
  step6LegalSchema,
  Step6LegalInput,
} from "@/domains/auth/schemas/auth.schemas";
import {
  useRegistrationStore,
  RegistrationData,
} from "@/domains/auth/state/useRegistrationStore";
import { step6InitialValues } from "@/domains/auth/constants/initialValues";
import { FormProvider } from "@/components/form";
import { Controller } from "@/lib/form";
import { useForm } from "@/hooks/use-form-hook";

const Legal: React.FC<RegStepProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const { data, merge } = useRegistrationStore();

  const form = useForm<Step6LegalInput>({
    schema: step6LegalSchema,
    defaultValues: {
      ...step6InitialValues,
      // signedNDA: data.signedNDA,
      // insuranceProof: data.insuranceProof,
      consentBackgroundVerification: data.consentBackgroundVerification,
      agreeTermsConditions: data.agreeTermsConditions,
    },
    mode: "onSubmit",
  });

  // Reset form when store data changes
  useEffect(() => {
    form.reset({
      ...step6InitialValues,
      // signedNDA: data.signedNDA,
      // insuranceProof: data.insuranceProof,
      consentBackgroundVerification: data.consentBackgroundVerification,
      agreeTermsConditions: data.agreeTermsConditions,
    });
  }, [data.consentBackgroundVerification, data.agreeTermsConditions, form]);

  const onSubmit = (values: Step6LegalInput) => {
    merge(values as Partial<RegistrationData>);
    onNext();
  };

  // const downloadNDA = () => {
  //   // replace with real download
  //   console.log("Downloading NDA template...");
  // };

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
        <div className="flex-grow space-y-4 px-4 pb-8 md:space-y-6 md:px-0">
          <div className="text-center">
            <h3 className="mt-4 mb-2 text-center text-[22px] font-medium text-[#140047] md:mt-5 md:mb-0 md:text-[28px]">
              Legal & Compliance
            </h3>
          </div>

          {/* <div className="mt-6 grid grid-cols-1 gap-x-14 gap-y-6 md:mt-20 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="signedNDA" className="text-sm text-black">
                  Upload Signed NDA<span className="text-red-500">*</span>
                </Label>
                <button
                  onClick={downloadNDA}
                  type="button"
                  className="flex items-center gap-2 text-xs font-medium text-[#00A8FF] hover:text-[#0088CC] sm:text-sm">
                  <Download size={14} className="sm:h-4 sm:w-4" />
                  Download NDA
                </button>
              </div>
              <Controller
                name="signedNDA"
                control={form.control}
                render={({ field, fieldState }) => (
                  <FileUploadInput
                    name="signedNDA"
                    value={field.value}
                    onChange={(file) => {
                      field.onChange(file);
                      merge({ signedNDA: file } as Partial<RegistrationData>);
                    }}
                    accept=".pdf,.doc,.docx"
                    placeholder="Upload Signed NDA"
                    error={fieldState.error?.message}
                    showIcon={false}
                  />
                )}
              />
            </div>

            <Controller
              name="insuranceProof"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <FileUploadInput
                    name="insuranceProof"
                    label="Upload Insurance Proof"
                    value={field.value}
                    onChange={(file) => {
                      field.onChange(file);
                      merge({
                        insuranceProof: file,
                      } as Partial<RegistrationData>);
                    }}
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    required
                    placeholder="Upload Insurance Proof"
                    error={fieldState.error?.message}
                    showIcon={false}
                  />
                </div>
              )}
            />
          </div> */}

          <div className="mt-8 grid grid-cols-1 gap-4 md:mt-14 md:grid-cols-2">
            <Controller
              name="consentBackgroundVerification"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(Boolean(checked))
                      }
                      checkedColor="#00A8FF"
                      checkIconColor="white"
                    />
                    <Label className="cursor-pointer text-xs font-medium text-gray-700 sm:text-sm">
                      Consent to Background Verification
                      <span className="text-red-500">*</span>
                    </Label>
                  </div>
                  {fieldState.error && (
                    <p className="text-xs text-red-500">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />

            <Controller
              name="agreeTermsConditions"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <div className="ml-0 flex items-center space-x-2 md:ml-5">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(Boolean(checked))
                      }
                      checkedColor="#00A8FF"
                      checkIconColor="white"
                    />
                    <Label className="cursor-pointer text-xs font-medium text-gray-700 sm:text-sm">
                      Agree to{" "}
                      <a
                        href="#"
                        className="text-[#00A8FF] underline decoration-[#00A8FF] hover:decoration-[#0088CC]">
                        Terms & Conditions
                      </a>{" "}
                      and{" "}
                      <a
                        href="#"
                        className="text-[#00A8FF] underline decoration-[#00A8FF] hover:decoration-[#0088CC]">
                        Privacy Policy
                      </a>
                      <span className="text-red-500">*</span>
                    </Label>
                  </div>
                  {fieldState.error && (
                    <p className="text-xs text-red-500">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>
        </div>

        <div className="mt-auto flex justify-center gap-4 pb-8 md:mt-8 md:justify-between">
          <BackButton
            onClick={onPrevious}
            disabled={currentStep === 1}
            borderColor="#00A8FF"
            iconColor="#00A8FF"
          />
          <ContinueButton
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

export default Legal;
