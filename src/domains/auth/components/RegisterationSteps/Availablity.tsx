"use client";
import React, { useEffect } from "react";
import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ContinueButton, BackButton, ProgressIndicator } from "@/components";
import {
  step5AvailabilitySchema,
  Step5AvailabilityInput,
} from "@/domains/auth/schemas/auth.schemas";
import { RegStepProps } from "@/domains/auth/types/index";
import { step5InitialValues } from "@/domains/auth/constants/initialValues";
import { FormProvider, FormDropdown } from "@/components/form";
import { Controller } from "@/lib/form";
import { useForm } from "@/hooks/use-form-hook";
import {
  useRegistrationStore,
  RegistrationData,
} from "@/domains/auth/state/useRegistrationStore";
import { provinces } from "@/constants/options";

const Availablity: React.FC<RegStepProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const { data, merge, maxTravelDistances } = useRegistrationStore();

  const form = useForm<Step5AvailabilityInput>({
    schema: step5AvailabilitySchema,
    defaultValues: {
      ...step5InitialValues,
      preferredRegions: data.preferredRegions,
      maxTravelDistance: data.maxTravelDistance,
      // daysAvailable: data.daysAvailable,
      // timeWindows: data.timeWindows,
      acceptVirtualAssessments: data.acceptVirtualAssessments,
    },
    mode: "onSubmit",
  });

  // Reset form when store data changes
  useEffect(() => {
    form.reset({
      ...step5InitialValues,
      preferredRegions: data.preferredRegions,
      maxTravelDistance: data.maxTravelDistance,
      // daysAvailable: data.daysAvailable,
      // timeWindows: data.timeWindows,
      acceptVirtualAssessments: data.acceptVirtualAssessments,
    });
  }, [
    data.preferredRegions,
    data.maxTravelDistance,
    data.acceptVirtualAssessments,
    form,
  ]);

  const onSubmit = (values: Step5AvailabilityInput) => {
    console.log("Step 5 Form Data:", values);
    merge(values as Partial<RegistrationData>);
    onNext();
  };

  return (
    <div
      className="mt-4 flex w-full flex-col rounded-[20px] bg-white md:mt-6 md:w-[950px] md:rounded-[55px] md:px-[75px]"
      style={{
        boxShadow: "0px 0px 36.35px 0px #00000008",
      }}>
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        gradientFrom="#89D7FF"
        gradientTo="#00A8FF"
      />

      <FormProvider form={form} onSubmit={onSubmit}>
        <div className="flex-grow space-y-6 pb-8 md:pb-10">
          <div className="pt-1 md:pt-0">
            <h3 className="mt-4 mb-2 text-center text-[22px] font-medium text-[#140047] md:mt-5 md:mb-0 md:text-[28px]">
              Availability & Preferences
            </h3>

            <div className="mt-6 md:px-0 px-8 grid grid-cols-1 gap-x-14 gap-y-5 md:mt-8 md:grid-cols-2">
              <FormDropdown
                name="preferredRegions"
                label="Preferred Provinces"
                options={provinces}
                required
                placeholder="Select Province"
                icon={null}
                multiSelect
              />

              <FormDropdown
                name="maxTravelDistance"
                label="Max Travel Distance"
                options={maxTravelDistances.map((distance) => ({
                  value: distance.id,
                  label: distance.name,
                }))}
                required
                placeholder="Up to 25 km"
                icon={null}
              />

              {/* <FormDropdown
                name="daysAvailable"
                label="Days Available"
                options={daysOptions}
                required
                placeholder="Monday"
                icon={null}
              />

              <Controller
                name="timeWindows"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Label className="text-sm text-black">
                      Time Windows<span className="text-red-500">*</span>
                    </Label>
                    <div className="flex flex-row flex-wrap gap-x-4 gap-y-2 pt-2 sm:gap-x-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={field.value.morning}
                          onCheckedChange={(checked) =>
                            field.onChange({
                              ...field.value,
                              morning: Boolean(checked),
                            })
                          }
                          checkedColor="#00A8FF"
                          checkIconColor="white"
                        />
                        <Label className="text-sm font-medium text-gray-700">
                          Morning
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={field.value.afternoon}
                          onCheckedChange={(checked) =>
                            field.onChange({
                              ...field.value,
                              afternoon: Boolean(checked),
                            })
                          }
                          checkedColor="#00A8FF"
                          checkIconColor="white"
                        />
                        <Label className="text-sm font-medium text-gray-700">
                          Afternoon
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={field.value.evening}
                          onCheckedChange={(checked) =>
                            field.onChange({
                              ...field.value,
                              evening: Boolean(checked),
                            })
                          }
                          checkedColor="#00A8FF"
                          checkIconColor="white"
                        />
                        <Label className="text-sm font-medium text-gray-700">
                          Evening
                        </Label>
                      </div>
                    </div>
                    {fieldState.error && (
                      <p className="text-xs text-red-500">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              /> */}
            </div>

            <Controller
              name="acceptVirtualAssessments"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="sm:-mt- mt-4 space-y-3 md:px-0 px-8">
                  <Label className="text-sm text-black">
                    Accept Virtual Assessments
                    <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex flex-row flex-wrap gap-x-4 gap-y-2 sm:gap-x-6">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="yes"
                        id="yes"
                        checkedColor="#00A8FF"
                        indicatorColor="#00A8FF"
                      />
                      <Label
                        htmlFor="yes"
                        className="cursor-pointer text-sm font-medium text-gray-700">
                        Yes
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="no"
                        id="no"
                        checkedColor="#00A8FF"
                        indicatorColor="#00A8FF"
                      />
                      <Label
                        htmlFor="no"
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

export default Availablity;
