import React from 'react';
import { Formik, Form } from 'formik';
import { Label } from '@/components/ui/label';
import { Dropdown } from '@/components/ui/Dropdown';
import { Checkbox } from '@/components/ui/checkbox';
import ContinueButton from '@/components/ui/ContinueButton';
import BackButton from '@/components/ui/BackButton';
import {
  step3IMEExperienceSchema,
  step3InitialValues,
} from '@/domains/auth/validations/register.validation';
import ProgressIndicator from '@/components/ProgressBar/ProgressIndicator';
import { languageOptions, provinceOptions, yearsOfExperienceOptions } from '@/shared/config/register';
import { useRegistrationStore, RegistrationData } from '@/domains/auth/state/useRegistrationStore';
import { useAutoPersist } from '@/domains/auth/state/useAutoPersist';

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
  const { data, merge } = useRegistrationStore();

  const handleSubmit = (values: typeof step3InitialValues) => {
    merge(values as Partial<RegistrationData>);
    onNext();
  };

  return (
    <div
      className="mt-4 flex w-full flex-col justify-between rounded-[20px] bg-white md:mt-6 md:min-h-[500px] md:w-[950px] md:rounded-[55px] md:px-[75px]"
      style={{ boxShadow: '0px 0px 36.35px 0px #00000008' }}
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
          languagesSpoken: data.languagesSpoken,
          forensicAssessmentTrained: data.forensicAssessmentTrained,
        }}
        validationSchema={step3IMEExperienceSchema}
        onSubmit={handleSubmit}
        validateOnChange={false}
        validateOnBlur={false}
        enableReinitialize
      >
        {({ values, errors, setFieldValue, submitForm }) => {
          useAutoPersist(values, (p) => merge(p as Partial<RegistrationData>));
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
                    <Dropdown
                      id="yearsOfIMEExperience"
                      label="Years of IME Experience"
                      value={values.yearsOfIMEExperience}
                      onChange={(v) => setFieldValue('yearsOfIMEExperience', v)}
                      options={yearsOfExperienceOptions}
                      required
                      placeholder="12 Years"
                    />
                    {errors.yearsOfIMEExperience && (
                      <p className="text-xs text-red-500">{errors.yearsOfIMEExperience}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Dropdown
                      id="provinceOfLicensure"
                      label="Province of Licensure"
                      value={values.provinceOfLicensure}
                      onChange={(v) => setFieldValue('provinceOfLicensure', v)}
                      options={provinceOptions}
                      required
                      placeholder="Select Province"
                    />
                    {errors.provinceOfLicensure && (
                      <p className="text-xs text-red-500">{errors.provinceOfLicensure}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Dropdown
                      id="languagesSpoken"
                      label="Languages Spoken"
                      value={values.languagesSpoken}
                      onChange={(v) => setFieldValue('languagesSpoken', v)}
                      options={languageOptions}
                      required
                      placeholder="Select Language"
                    />
                    {errors.languagesSpoken && (
                      <p className="text-xs text-red-500">{errors.languagesSpoken}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-black">
                      Forensic Assessment Trained <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center space-x-6 pt-2">
                      <label className="flex cursor-pointer items-center space-x-2">
                        <Checkbox
                          checked={values.forensicAssessmentTrained === 'yes'}
                          onCheckedChange={(checked) =>
                            setFieldValue('forensicAssessmentTrained', checked ? 'yes' : '')
                          }
                          checkedColor="#00A8FF"
                          checkIconColor="white"
                        />
                        <span className="text-sm font-medium text-gray-700">Yes</span>
                      </label>
                      <label className="flex cursor-pointer items-center space-x-2">
                        <Checkbox
                          checked={values.forensicAssessmentTrained === 'no'}
                          onCheckedChange={(checked) =>
                            setFieldValue('forensicAssessmentTrained', checked ? 'no' : '')
                          }
                          checkedColor="#00A8FF"
                          checkIconColor="white"
                        />
                        <span className="text-sm font-medium text-gray-700">No</span>
                      </label>
                    </div>
                    {errors.forensicAssessmentTrained && (
                      <p className="text-xs text-red-500">{errors.forensicAssessmentTrained}</p>
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
