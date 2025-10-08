"use client";
import React from "react";
import { Label } from "@/components/ui/label";
import { BackButton, ContinueButton, ProgressIndicator } from "@/components";
import { Checkbox } from "@/components/ui/checkbox";
import {
  step3IMEExperienceSchema,
  Step3IMEExperienceInput,
} from "@/domains/auth/schemas/auth.schemas";
import { step3InitialValues } from "@/domains/auth/constants/initialValues";
import {
  useRegistrationStore,
  RegistrationData,
} from "@/domains/auth/state/useRegistrationStore";
import { useForm, FormProvider, FormDropdown } from "@/lib/form";
import { Controller } from "react-hook-form";

interface Step3IMEExperinceProps {
  onNext: () => void;
  onPrevious: () => void;
  currentStep: number;
  totalSteps: number;
}

const yearsOfExperienceOptions = [
  { value: "less-than-1", label: "Less than 1 Year" },
  { value: "1-2", label: "1-2 Years" },
  { value: "2-3", label: "2-3 Years" },
  { value: "more-than-3", label: "More than 3 Years" },
];

const IMEExperince: React.FC<Step3IMEExperinceProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const { data, merge, languages } = useRegistrationStore();

  const form = useForm<Step3IMEExperienceInput>({
    schema: step3IMEExperienceSchema,
    defaultValues: {
      ...step3InitialValues,
      yearsOfIMEExperience: data.yearsOfIMEExperience || "",
      provinceOfLicensure: data.provinceOfLicensure || "",
      languagesSpoken: data.languagesSpoken || [],
      forensicAssessmentTrained: data.forensicAssessmentTrained || "",
    },
    mode: "onSubmit",
  });

  const onSubmit = (values: Step3IMEExperienceInput) => {
    merge(values as unknown as Partial<RegistrationData>);
    onNext();
  };

  return (
    <div
      className="mt-4 w-full rounded-[20px] bg-white md:mt-6 md:min-h-[500px] md:w-[950px] md:rounded-[55px] md:px-[75px]"
      style={{ boxShadow: "0px 0px 36.35px 0px #00000008" }}>
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        gradientFrom="#89D7FF"
        gradientTo="#00A8FF"
      />

      <FormProvider form={form} onSubmit={onSubmit}>
        <div className="space-y-4 px-4 pb-8 md:space-y-6 md:px-0">
          <h3 className="mt-4 mb-2 text-center text-[22px] font-normal text-[#140047] md:mt-5 md:mb-0 md:text-[28px]">
            IME Experience & Qualifications
          </h3>

          <div className="mt-6 grid grid-cols-1 gap-x-14 gap-y-6 md:mt-8 md:grid-cols-2">
            <FormDropdown
              name="yearsOfIMEExperience"
              label="Years of IME Experience"
              options={yearsOfExperienceOptions}
              required
              placeholder="Select Years"
              icon={null}
            />

            <FormDropdown
              name="languagesSpoken"
              label="Languages Spoken"
              options={languages.map((language) => ({
                value: language.id,
                label: language.name,
              }))}
              required
              placeholder="Select Language"
              multiSelect={true}
              icon={null}
            />

            <Controller
              name="forensicAssessmentTrained"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Label className="text-black">
                    Forensic Assessment Trained{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center space-x-6 pt-2">
                    <label className="flex cursor-pointer items-center space-x-2">
                      <Checkbox
                        checked={field.value === "yes"}
                        onCheckedChange={(checked) =>
                          field.onChange(checked ? "yes" : "")
                        }
                        checkedColor="#00A8FF"
                        checkIconColor="white"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Yes
                      </span>
                    </label>
                    <label className="flex cursor-pointer items-center space-x-2">
                      <Checkbox
                        checked={field.value === "no"}
                        onCheckedChange={(checked) =>
                          field.onChange(checked ? "no" : "")
                        }
                        checkedColor="#00A8FF"
                        checkIconColor="white"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        No
                      </span>
                    </label>
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

          <div className="flex items-center justify-between gap-4">
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
        </div>
      </FormProvider>
    </div>
  );
};

export default IMEExperince;
