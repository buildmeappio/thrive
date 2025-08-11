import React from "react";
import { Formik, Form } from "formik";
import BackButton from "~/components/ui/BackButton";
import ContinueButton from "~/components/ui/ContinueButton";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import type { MedExaminerRegStepProps } from "~/types";
import {
  step4ExperienceDetailsSchema,
  step4InitialValues,
} from "~/validation/medicalExaminer/examinerRegisterValidation";

export const Step4ExperienceDetails: React.FC<MedExaminerRegStepProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const handleSubmit = (values: typeof step4InitialValues) => {
    console.log("Step 4 Form Data:", values);
    onNext();
  };

  return (
    <Formik
      initialValues={step4InitialValues}
      validationSchema={step4ExperienceDetailsSchema}
      onSubmit={handleSubmit}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ values, errors, handleChange, submitForm }) => (
        <Form>
          <div className="sm:px- flex min-h-fit flex-col px-4 pt-4 pb-8 sm:py-6 sm:pt-0 md:px-0">
            <div className="flex-1 space-y-4 sm:space-y-6">
              <div className="mt-0 text-center sm:mt-0">
                <h3 className="my-2 text-xl font-medium text-[#140047] md:my-10 md:text-2xl md:whitespace-nowrap">
                  Share Some Details About Your Past Experience
                </h3>
              </div>

              <div className="flex flex-1 flex-col">
                <div className="flex-1 space-y-3">
                  <div className="relative">
                    <Textarea
                      name="experienceDetails"
                      id="experienceDetails"
                      placeholder="Type here"
                      value={values.experienceDetails}
                      onChange={handleChange}
                      className="min-h-[150px] w-full resize-none text-sm sm:min-h-[200px] sm:text-base"
                      maxLength={500}
                    />
                    <div className="absolute right-2 bottom-2 text-xs text-gray-400 sm:right-3 sm:bottom-3 sm:text-sm">
                      {values.experienceDetails.length}/500
                    </div>
                  </div>
                  <Label
                    htmlFor="experienceDetails"
                    className="-mt-2 text-xs font-normal text-[#8A8A8A] sm:text-sm"
                  >
                    Talk about yourself and your background
                  </Label>
                  {errors.experienceDetails && (
                    <p className="text-xs text-red-500">{errors.experienceDetails}</p>
                  )}
                </div>

                <div className="mt-8 flex items-center justify-between gap-4 pt-6 sm:mt-8 sm:pt-0 sm:pt-8 lg:mt-auto lg:pt-15">
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
          </div>
        </Form>
      )}
    </Formik>
  );
};
