"use client";
import React, { useEffect } from "react";
import { BackButton, ContinueButton, ProgressIndicator } from "@/components";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  step4ExperienceDetailsSchema,
  Step4ExperienceDetailsInput,
} from "@/domains/auth/schemas/auth.schemas";
import { RegStepProps } from "@/domains/auth/types/index";
import {
  useRegistrationStore,
  RegistrationData,
} from "@/domains/auth/state/useRegistrationStore";
import { step4InitialValues } from "@/domains/auth/constants/initialValues";
import { FormProvider } from "@/components/form";
import { Controller } from "@/lib/form";
import { useForm } from "@/hooks/use-form-hook";

const ExperienceDetails: React.FC<RegStepProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const { data, merge } = useRegistrationStore();

  const form = useForm<Step4ExperienceDetailsInput>({
    schema: step4ExperienceDetailsSchema,
    defaultValues: {
      ...step4InitialValues,
      experienceDetails: data.experienceDetails,
    },
    mode: "onSubmit",
  });

  // Reset form when store data changes
  useEffect(() => {
    form.reset({
      ...step4InitialValues,
      experienceDetails: data.experienceDetails,
    });
  }, [data.experienceDetails, form]);

  const onSubmit = (values: Step4ExperienceDetailsInput) => {
    merge(values as Partial<RegistrationData>);
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
        <div className="flex-grow pt-4 md:px-0 px-8 sm:py-6 sm:pt-0">
          <div className="space-y-4 sm:space-y-6">
            <div className="mt-0 text-center sm:mt-0">
              <h3 className="mt-4 mb-2 text-center text-[22px] font-medium text-[#140047] md:mt-5 md:mb-0 md:text-[28px]">
                Share Some Details About Your Past Experience
              </h3>
            </div>

            <Controller
              name="experienceDetails"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="flex flex-col">
                  <div className="relative space-y-3">
                    <Textarea
                      {...field}
                      id="experienceDetails"
                      placeholder="Type here"
                      className="min-h-[150px] w-full resize-none text-sm sm:text-base md:min-h-[200px]"
                      maxLength={500}
                    />
                    <div className="absolute right-4 bottom-6 text-xs text-gray-400 ">
                      {(field.value || "").length}/500
                    </div>
                  </div>
                  <Label
                    htmlFor="experienceDetails"
                    className="-mt-2 text-xs font-normal text-[#8A8A8A] sm:text-sm">
                    Talk about yourself and your background
                  </Label>
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

export default ExperienceDetails;
