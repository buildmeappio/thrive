import React from "react";
import { Formik, Form } from "formik";
import { Label } from "@/components/ui/label";
import { BackButton, ContinueButton, ProgressIndicator } from "@/components";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  step3IMEExperienceSchema,
  Step3IMEExperienceInput,
} from "@/domains/auth/schemas/auth.schemas";
import { step3InitialValues } from "@/domains/auth/constants/initialValues";
import {
  useRegistrationStore,
  RegistrationData,
} from "@/domains/auth/state/useRegistrationStore";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { Dropdown } from "@/components";

interface Step3IMEExperinceProps {
  onNext: () => void;
  onPrevious: () => void;
  currentStep: number;
  totalSteps: number;
}

export const Step3IMEExperince: React.FC<Step3IMEExperinceProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const { data, merge, languages } = useRegistrationStore();

  const handleSubmit = (values: Step3IMEExperienceInput) => {
    merge(values as unknown as Partial<RegistrationData>);
    onNext();
  };

  return (
    <div
      className="mt-4 flex w-full flex-col justify-between rounded-[20px] bg-white md:mt-6 md:min-h-[500px] md:w-[950px] md:rounded-[55px] md:px-[75px]"
      style={{ boxShadow: "0px 0px 36.35px 0px #00000008" }}
    >
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        gradientFrom="#89D7FF"
        gradientTo="#00A8FF"
      />
      <Formik
        initialValues={{
          ...step3InitialValues,
          yearsOfIMEExperience: data.yearsOfIMEExperience,
          provinceOfLicensure: data.provinceOfLicensure, // shared with Step 2
          languagesSpoken: data.languagesSpoken || [],
          forensicAssessmentTrained: data.forensicAssessmentTrained,
        }}
        validationSchema={toFormikValidationSchema(step3IMEExperienceSchema)}
        onSubmit={handleSubmit}
        validateOnChange={false}
        validateOnBlur={false}
        enableReinitialize
      >
        {({ values, errors, setFieldValue, submitForm }) => {
          return (
            <Form className="flex flex-grow flex-col pb-8">
              <div className="flex-grow px-4 pb-8 md:px-0 md:pb-10">
                <div className="text-center">
                  <h3 className="mt-4 mb-2 text-center text-[22px] font-medium text-[#140047] md:mt-5 md:mb-0 md:text-[28px]">
                    IME Experience & Qualifications
                  </h3>
                </div>

                <div className="mt-6 grid flex-1 grid-cols-1 gap-x-14 gap-y-6 md:mt-8 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="yearsOfIMEExperience"
                      className="text-black"
                    >
                      Years of IME Experience{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="yearsOfIMEExperience"
                      name="yearsOfIMEExperience"
                      type="text"
                      placeholder="Enter number of years"
                      value={values.yearsOfIMEExperience ?? 0}
                      onChange={(e) => {
                        const number = Number(e.target.value);
                        if (isNaN(number)) {
                          return;
                        }
                        setFieldValue("yearsOfIMEExperience", number);
                      }}
                    />
                    {errors.yearsOfIMEExperience && (
                      <p className="text-xs text-red-500">
                        {errors.yearsOfIMEExperience}
                      </p>
                    )}
                  </div>

                  <Dropdown
                    id="languagesSpoken"
                    label="Languages Spoken"
                    value={values.languagesSpoken}
                    onChange={(v) => {
                      if (Array.isArray(v)) {
                        setFieldValue("languagesSpoken", v);
                      } else {
                        setFieldValue("languagesSpoken", [v]);
                      }
                    }}
                    multiSelect
                    options={languages.map((language) => ({
                      value: language.id,
                      label: language.name,
                    }))}
                    required
                    placeholder="Select Language"
                    error={errors.languagesSpoken as string | undefined}
                  />

                  <div className="space-y-2">
                    <Label className="text-black">
                      Forensic Assessment Trained{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center space-x-6 pt-2">
                      <label className="flex cursor-pointer items-center space-x-2">
                        <Checkbox
                          checked={values.forensicAssessmentTrained === "yes"}
                          onCheckedChange={(checked) =>
                            setFieldValue(
                              "forensicAssessmentTrained",
                              checked ? "yes" : ""
                            )
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
                          checked={values.forensicAssessmentTrained === "no"}
                          onCheckedChange={(checked) =>
                            setFieldValue(
                              "forensicAssessmentTrained",
                              checked ? "no" : ""
                            )
                          }
                          checkedColor="#00A8FF"
                          checkIconColor="white"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          No
                        </span>
                      </label>
                    </div>
                    {errors.forensicAssessmentTrained && (
                      <p className="text-xs text-red-500">
                        {errors.forensicAssessmentTrained}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-4 md:mt-0">
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
          );
        }}
      </Formik>
    </div>
  );
};
