"use client";
import React, { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { BackButton, ContinueButton, ProgressIndicator } from "@/components";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  step3IMEExperienceSchema,
  Step3IMEExperienceInput,
} from "@/domains/auth/schemas/auth.schemas";
import { step3InitialValues } from "@/domains/auth/constants/initialValues";
import {
  useRegistrationStore,
  RegistrationData,
} from "@/domains/auth/state/useRegistrationStore";
import { FormProvider, FormDropdown } from "@/components/form";
import { Controller } from "@/lib/form";
import { useForm } from "@/hooks/use-form-hook";

interface Step3IMEExperinceProps {
  onNext: () => void;
  onPrevious: () => void;
  currentStep: number;
  totalSteps: number;
}

const IMEExperince: React.FC<Step3IMEExperinceProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const { data, merge, languages, yearsOfExperience } =
    useRegistrationStore();

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

  // Reset form when store data changes
  useEffect(() => {
    form.reset({
      ...step3InitialValues,
      yearsOfIMEExperience: data.yearsOfIMEExperience || "",
      provinceOfLicensure: data.provinceOfLicensure || "",
      languagesSpoken: data.languagesSpoken || [],
      forensicAssessmentTrained: data.forensicAssessmentTrained || "",
    });
  }, [
    data.yearsOfIMEExperience,
    data.provinceOfLicensure,
    data.languagesSpoken,
    data.forensicAssessmentTrained,
    form,
  ]);

  const onSubmit = (values: Step3IMEExperienceInput) => {
    merge(values as unknown as Partial<RegistrationData>);
    onNext();
  };

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
        <div className="flex-grow pt-4 sm:px-4 sm:py-6 sm:pt-0 md:px-0">
          <div className="space-y-4 sm:space-y-6">
            <h3 className="mt-4 mb-2 text-center text-[22px] font-normal text-[#140047] md:mt-5 md:mb-0 md:text-[28px]">
              IME Experience & Qualifications
            </h3>

            <div className="mt-6 md:px-0 px-8 grid grid-cols-1 gap-x-14 gap-y-6 md:mt-8 md:grid-cols-2">
              <FormDropdown
                name="yearsOfIMEExperience"
                label="Years of IME Experience"
                options={yearsOfExperience.map((year) => ({
                  value: year.id,
                  label: year.name,
                }))}
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
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex flex-row flex-wrap gap-x-4 gap-y-2 pt-2 sm:gap-x-6">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="yes"
                          id="forensic-yes"
                          checkedColor="#00A8FF"
                          indicatorColor="#00A8FF"
                        />
                        <Label
                          htmlFor="forensic-yes"
                          className="cursor-pointer text-sm font-medium text-gray-700">
                          Yes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="no"
                          id="forensic-no"
                          checkedColor="#00A8FF"
                          indicatorColor="#00A8FF"
                        />
                        <Label
                          htmlFor="forensic-no"
                          className="cursor-pointer text-sm font-medium text-gray-700">
                          No
                        </Label>
                      </div>
                    </RadioGroup>
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
        </div>

        <div className="mt-10 flex items-center justify-center gap-8 px-2 pb-8 md:mt-12 md:justify-between md:gap-4 md:px-0">
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

export default IMEExperince;
