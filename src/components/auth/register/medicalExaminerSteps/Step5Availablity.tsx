import React from "react";
import { Formik, Form } from "formik";
import { Label } from "~/components/ui/label";
import { Dropdown } from "~/components/ui/Dropdown";
import { Checkbox } from "~/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { regionOptions } from "~/config/medicalExaminerRegister/RegionDropdownOptions";
import { travelDistanceOptions } from "~/config/medicalExaminerRegister/TravelDistanceDropdownOptions";
import { daysOptions } from "~/config/medicalExaminerRegister/DaysDropdownOptions";
import ContinueButton from "~/components/ui/ContinueButton";
import BackButton from "~/components/ui/BackButton";
import type { MedExaminerRegStepProps } from "~/types";
import {
  step5AvailabilitySchema,
  step5InitialValues,
} from "~/validation/medicalExaminer/examinerRegisterValidation";

export const Step5Availablity: React.FC<MedExaminerRegStepProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const handleSubmit = (values: typeof step5InitialValues) => {
    console.log("Step 5 Form Data:", values);
    onNext();
  };

  return (
    <Formik
      initialValues={step5InitialValues}
      validationSchema={step5AvailabilitySchema}
      onSubmit={handleSubmit}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ values, errors, setFieldValue, submitForm }) => (
        <Form>
          <div className="flex min-h-fit flex-col px-4 pt-4 pb-8 sm:px-6 sm:py-6 md:px-0">
            <div className="flex-1 space-y-4 sm:space-y-6">
              <h3 className="my-2 text-center text-xl font-medium whitespace-nowrap text-[#140047] md:my-10 md:text-2xl">
                Availability & Preferences
              </h3>

              <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-4 sm:mt-8 sm:gap-x-14 sm:gap-y-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Dropdown
                    id="preferredRegions"
                    label="Preferred Regions"
                    value={values.preferredRegions}
                    onChange={(value) =>
                      setFieldValue("preferredRegions", value)
                    }
                    options={regionOptions}
                    required
                    placeholder="Toronto"
                  />
                  {errors.preferredRegions && (
                    <p className="text-xs text-red-500">
                      {errors.preferredRegions}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Dropdown
                    id="maxTravelDistance"
                    label="Max Travel Distance"
                    value={values.maxTravelDistance}
                    onChange={(value) =>
                      setFieldValue("maxTravelDistance", value)
                    }
                    options={travelDistanceOptions}
                    required
                    placeholder="Up to 25 km"
                  />
                  {errors.maxTravelDistance && (
                    <p className="text-xs text-red-500">
                      {errors.maxTravelDistance}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Dropdown
                    id="daysAvailable"
                    label="Days Available"
                    value={values.daysAvailable}
                    onChange={(value) => setFieldValue("daysAvailable", value)}
                    options={daysOptions}
                    required
                    placeholder="Monday"
                  />
                  {errors.daysAvailable && (
                    <p className="text-xs text-red-500">
                      {errors.daysAvailable}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">
                    Time Windows<span className="text-red-500">*</span>
                  </Label>
                  <div className="flex flex-row flex-wrap gap-x-4 gap-y-2 pt-2 sm:gap-x-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={values.timeWindows.morning}
                        onCheckedChange={(checked) =>
                          setFieldValue(
                            "timeWindows.morning",
                            checked as boolean,
                          )
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
                        checked={values.timeWindows.afternoon}
                        onCheckedChange={(checked) =>
                          setFieldValue(
                            "timeWindows.afternoon",
                            checked as boolean,
                          )
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
                        checked={values.timeWindows.evening}
                        onCheckedChange={(checked) =>
                          setFieldValue(
                            "timeWindows.evening",
                            checked as boolean,
                          )
                        }
                        checkedColor="#00A8FF"
                        checkIconColor="white"
                      />
                      <Label className="text-sm font-medium text-gray-700">
                        Evening
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3 sm:mt-6">
                <Label className="text-sm">
                  Accept Virtual Assessments
                  <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={values.acceptVirtualAssessments}
                  onValueChange={(value) =>
                    setFieldValue("acceptVirtualAssessments", value)
                  }
                  className="flex flex-row flex-wrap gap-x-4 gap-y-2 sm:gap-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="yes"
                      id="yes"
                      checkedColor="#00A8FF"
                      indicatorColor="#00A8FF"
                    />
                    <Label
                      htmlFor="yes"
                      className="cursor-pointer text-sm font-medium text-gray-700"
                    >
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
                      className="cursor-pointer text-sm font-medium text-gray-700"
                    >
                      No
                    </Label>
                  </div>
                </RadioGroup>
                {errors.acceptVirtualAssessments && (
                  <p className="text-xs text-red-500">
                    {errors.acceptVirtualAssessments}
                  </p>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between gap-4 pt-6 sm:mt-auto sm:pt-8">
                <BackButton
                  onClick={onPrevious}
                  disabled={currentStep === 1}
                  borderColor="#00A8FF"
                  iconColor="#00A8FF"
                />
                <ContinueButton
                  onClick={submitForm}
                  isLastStep={currentStep === totalSteps}
                  gradientFrom="#89D7FF"
                  gradientTo="#00A8FF"
                />
              </div>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};
