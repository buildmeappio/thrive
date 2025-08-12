import React from "react";
import { Formik, Form } from "formik";
import { Label } from "~/components/ui/label";
import { Dropdown } from "~/components/ui/Dropdown";
import { provinceOptions } from "~/config/medicalExaminerRegister/ProvinceDropdownOptions";
import { yearsOfExperienceOptions } from "~/config/medicalExaminerRegister/YrsExperienceDropdownOptions";
import { languageOptions } from "~/config/medicalExaminerRegister/LanguageDropdownOptions";
import { Checkbox } from "~/components/ui/checkbox";
import ContinueButton from "~/components/ui/ContinueButton";
import BackButton from "~/components/ui/BackButton";
import {
  step3IMEExperienceSchema,
  step3InitialValues,
} from "~/validation/medicalExaminer/examinerRegisterValidation";
import ProgressIndicator from "../progressIndicator/ProgressIndicator";

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
  const handleSubmit = (values: typeof step3InitialValues) => {
    console.log("Step 3 Form Data:", values);
    onNext();
  };

  return (
    <div
      className="mt-4 w-full rounded-[20px] bg-white md:mt-6 md:min-h-[500px] md:w-[950px] md:rounded-[55px] md:px-[75px]"
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
        initialValues={step3InitialValues}
        validationSchema={step3IMEExperienceSchema}
        onSubmit={handleSubmit}
        validateOnChange={false}
        validateOnBlur={false}
      >
        {({ values, errors, setFieldValue, submitForm }) => (
          <Form className="flex flex-grow flex-col pb-8">
            <div className="flex-grow px-4 pb-8 md:px-0 md:pb-10">
              <div className="text-center">
                <h3 className="mt-4 mb-2 text-center text-[22px] font-medium text-[#140047] md:mt-5 md:mb-0 md:text-[28px]">
                  IME Experience & Qualifications
                </h3>
              </div>

              <div className="mt-4 grid flex-1 grid-cols-1 gap-x-14 gap-y-6 md:mt-8 md:grid-cols-2">
                <div className="space-y-2">
                  <Dropdown
                    id="yearsOfIMEExperience"
                    label="Years of IME Experience"
                    value={values.yearsOfIMEExperience}
                    onChange={(value) =>
                      setFieldValue("yearsOfIMEExperience", value)
                    }
                    options={yearsOfExperienceOptions}
                    required={true}
                    placeholder="12 Years"
                  />
                  {errors.yearsOfIMEExperience && (
                    <p className="text-xs text-red-500">
                      {errors.yearsOfIMEExperience}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Dropdown
                    id="provinceOfLicensure"
                    label="Province of Licensure"
                    value={values.provinceOfLicensure}
                    onChange={(value) =>
                      setFieldValue("provinceOfLicensure", value)
                    }
                    options={provinceOptions}
                    required={true}
                    placeholder="Select Province"
                  />
                  {errors.provinceOfLicensure && (
                    <p className="text-xs text-red-500">
                      {errors.provinceOfLicensure}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Dropdown
                    id="languagesSpoken"
                    label="Languages Spoken"
                    value={values.languagesSpoken}
                    onChange={(value) =>
                      setFieldValue("languagesSpoken", value)
                    }
                    options={languageOptions}
                    required={true}
                    placeholder="Select Language"
                  />
                  {errors.languagesSpoken && (
                    <p className="text-xs text-red-500">
                      {errors.languagesSpoken}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-black">
                    Forensic Assessment Trained
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center space-x-6 pt-2">
                    <label className="flex cursor-pointer items-center space-x-2">
                      <Checkbox
                        checked={values.forensicAssessmentTrained === "yes"}
                        onCheckedChange={(checked) =>
                          setFieldValue(
                            "forensicAssessmentTrained",
                            checked ? "yes" : "",
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
                            checked ? "no" : "",
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
        )}
      </Formik>
    </div>
  );
};
