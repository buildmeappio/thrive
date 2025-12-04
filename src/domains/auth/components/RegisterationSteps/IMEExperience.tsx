"use client";
import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { BackButton, ContinueButton, ProgressIndicator } from "@/components";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui";
import {
  step3IMEExperienceSchema,
  Step3IMEExperienceInput,
} from "@/domains/auth/schemas/auth.schemas";
import { step3InitialValues } from "@/domains/auth/constants/initialValues";
import {
  useRegistrationStore,
  RegistrationData,
} from "@/domains/auth/state/useRegistrationStore";
import { FormProvider, FormField, FormDropdown } from "@/components/form";
import { Controller, UseFormRegisterReturn } from "@/lib/form";
import { useForm } from "@/hooks/use-form-hook";
import {
  assessmentTypeOptions,
  imeCompletionOptions,
} from "@/domains/setting/constants/options";

interface Step3IMEExperinceProps {
  onNext: () => void;
  onPrevious: () => void;
  currentStep: number;
  totalSteps: number;
}

// Add "Other" option to assessment types
const assessmentTypeOptionsWithOther = [
  ...assessmentTypeOptions,
  { value: "other", label: "Other" },
];

const IMEExperince: React.FC<Step3IMEExperinceProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const { data, merge } = useRegistrationStore();
  const [showOtherField, setShowOtherField] = useState(false);

  const form = useForm<Step3IMEExperienceInput>({
    schema: step3IMEExperienceSchema,
    defaultValues: {
      ...step3InitialValues,
      imesCompleted: data.imesCompleted || "",
      currentlyConductingIMEs: data.currentlyConductingIMEs || "",
      insurersOrClinics: data.insurersOrClinics || "",
      assessmentTypes: data.assessmentTypes || [],
      assessmentTypeOther: data.assessmentTypeOther || "",
      redactedIMEReport: data.redactedIMEReport || null,
    },
    mode: "onSubmit",
  });

  // Watch for currentlyConductingIMEs and assessmentTypes changes
  const currentlyConductingIMEs = form.watch("currentlyConductingIMEs");
  const assessmentTypes = form.watch("assessmentTypes");

  // Check if "other" is selected
  useEffect(() => {
    if (assessmentTypes && assessmentTypes.includes("other")) {
      setShowOtherField(true);
    } else {
      setShowOtherField(false);
      form.setValue("assessmentTypeOther", "");
    }
  }, [assessmentTypes, form]);

  // Reset form when store data changes
  useEffect(() => {
    form.reset({
      ...step3InitialValues,
      imesCompleted: data.imesCompleted || "",
      currentlyConductingIMEs: data.currentlyConductingIMEs || "",
      insurersOrClinics: data.insurersOrClinics || "",
      assessmentTypes: data.assessmentTypes || [],
      assessmentTypeOther: data.assessmentTypeOther || "",
      redactedIMEReport: data.redactedIMEReport || null,
    });
  }, [
    data.imesCompleted,
    data.currentlyConductingIMEs,
    data.insurersOrClinics,
    data.assessmentTypes,
    data.assessmentTypeOther,
    data.redactedIMEReport,
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
        <div className="grow pt-4 sm:px-4 sm:py-6 sm:pt-0 md:px-0">
          <div className="space-y-4 sm:space-y-6">
            <h3 className="mt-4 mb-2 text-center text-[22px] font-medium text-[#140047] md:mt-5 md:mb-0 md:text-[28px]">
              IME Background & Experience
            </h3>

            {/* Two-Column Layout */}
            <div className="mt-6 md:px-0 px-8 grid grid-cols-1 gap-x-12 gap-y-6 md:mt-8 md:grid-cols-2">
              {/* LEFT COLUMN */}
              <div className="space-y-6">
                {/* How many IMEs have you completed? */}
                <FormDropdown
                  name="imesCompleted"
                  label="How many IMEs have you completed?"
                  options={imeCompletionOptions}
                  required
                  placeholder="Select range"
                  icon={null}
                />

                {/* Are you currently conducting IMEs? */}
                <Controller
                  name="currentlyConductingIMEs"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div className="space-y-2">
                      <Label className="text-black">
                        Are you currently conducting IMEs for any insurer or
                        clinic? <span className="text-red-500">*</span>
                      </Label>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex flex-row flex-wrap gap-x-4 gap-y-2 pt-2 sm:gap-x-6">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="yes"
                            id="conducting-yes"
                            checkedColor="#00A8FF"
                            indicatorColor="#00A8FF"
                          />
                          <Label
                            htmlFor="conducting-yes"
                            className="cursor-pointer text-sm font-medium text-gray-700">
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
                          <Label
                            htmlFor="conducting-no"
                            className="cursor-pointer text-sm font-medium text-gray-700">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                      {fieldState.error &&
                        (() => {
                          const errorMsg = fieldState.error.message;
                          const isRequiredError =
                            errorMsg &&
                            (errorMsg.toLowerCase() === "required" ||
                              errorMsg.toLowerCase().endsWith(" is required") ||
                              errorMsg.toLowerCase() === "is required");
                          return !isRequiredError ? (
                            <p className="text-xs text-red-500">{errorMsg}</p>
                          ) : null;
                        })()}
                    </div>
                  )}
                />

                {/* Conditional: Which insurers or clinics? */}
                {currentlyConductingIMEs === "yes" && (
                  <Controller
                    name="insurersOrClinics"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div className="space-y-2">
                        <Label className="text-black">
                          Which insurers or clinics?{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          {...field}
                          placeholder="List insurers or clinics..."
                          className={`min-h-[100px] resize-none ${
                            fieldState.error ? "ring-2 ring-red-500/30" : ""
                          }`}
                        />
                        {fieldState.error &&
                          (() => {
                            const errorMsg = fieldState.error.message;
                            const isRequiredError =
                              errorMsg &&
                              (errorMsg.toLowerCase() === "required" ||
                                errorMsg
                                  .toLowerCase()
                                  .endsWith(" is required") ||
                                errorMsg.toLowerCase() === "is required");
                            return !isRequiredError ? (
                              <p className="text-xs text-red-500">{errorMsg}</p>
                            ) : null;
                          })()}
                      </div>
                    )}
                  />
                )}
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-6">
                {/* Assessment Types */}
                <FormDropdown
                  name="assessmentTypes"
                  label="Assessment Types"
                  options={assessmentTypeOptionsWithOther}
                  required
                  placeholder="Multi-select (Disability, WSIB, MVA, etc.)"
                  multiSelect={true}
                  icon={null}
                />

                {/* Conditional: Other assessment type */}
                {showOtherField && (
                  <FormField
                    name="assessmentTypeOther"
                    label="Please specify other assessment type">
                    {(field: UseFormRegisterReturn & { error?: boolean }) => (
                      <Input
                        {...field}
                        id="assessmentTypeOther"
                        placeholder="Specify other assessment type"
                      />
                    )}
                  </FormField>
                )}
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
