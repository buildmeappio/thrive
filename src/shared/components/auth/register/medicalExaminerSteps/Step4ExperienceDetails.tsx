import React from "react";
import { Formik, Form } from "formik";
import BackButton from "@/shared/components/ui/BackButton";
import ContinueButton from "@/shared/components/ui/ContinueButton";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import type { MedExaminerRegStepProps } from "@/shared/types";
import {
  step4ExperienceDetailsSchema,
  step4InitialValues,
} from "@/shared/validation/medicalExaminer/examinerRegisterValidation";
import ProgressIndicator from "../progressIndicator/ProgressIndicator";

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
    <div
      className="mt-4 flex min-h-[500px] w-full flex-col rounded-[20px] bg-white md:mt-6 md:min-h-[500px] md:w-[950px] md:rounded-[55px] md:px-[75px]"
      style={{
        boxShadow: "0px 0px 36.35px 0px #00000008",
      }}
    >
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        gradientFrom="#89D7FF"
        gradientTo="#00A8FF"
      />
      <Formik
        initialValues={step4InitialValues}
        validationSchema={step4ExperienceDetailsSchema}
        onSubmit={handleSubmit}
        validateOnChange={false}
        validateOnBlur={false}
      >
        {({ values, errors, handleChange, submitForm }) => (
          <Form className="flex flex-grow flex-col">
            <div className="flex-grow px-4 pt-4 sm:px-4 sm:py-6 sm:pt-0 md:px-0">
              <div className="space-y-4 sm:space-y-6">
                <div className="mt-0 text-center sm:mt-0">
                  <h3 className="mt-4 mb-2 text-center text-[22px] font-medium text-[#140047] md:mt-5 md:mb-0 md:text-[28px]">
                    Share Some Details About Your Past Experience
                  </h3>
                </div>

                <div className="flex flex-col">
                  <div className="relative space-y-3">
                    <Textarea
                      name="experienceDetails"
                      id="experienceDetails"
                      placeholder="Type here"
                      value={values.experienceDetails}
                      onChange={handleChange}
                      className="min-h-[150px] w-full resize-none text-sm sm:text-base md:min-h-[200px]"
                      maxLength={500}
                    />
                    <div className="absolute right-2 bottom-2 text-xs text-gray-400 sm:right-3 sm:bottom-7 sm:text-sm">
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
                    <p className="text-xs text-red-500">
                      {errors.experienceDetails}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-auto flex items-center justify-center gap-4 pb-8 md:justify-between">
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
          </Form>
        )}
      </Formik>
    </div>
  );
};
