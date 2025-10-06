"use client";
import React from "react";
import { Formik, Form } from "formik";
import { FileText } from "lucide-react";
import { Label, Input } from "@/components/ui";
import {
  Dropdown,
  BackButton,
  ContinueButton,
  ProgressIndicator,
  FileUploadInput,
} from "@/components";
import {
  step2MedicalCredentialsSchema,
  Step2MedicalCredentialsInput,
} from "@/domains/auth/schemas/auth.schemas";
import { step2InitialValues } from "@/domains/auth/constants/initialValues";
import { RegStepProps } from "@/domains/auth/types/index";
import {
  medicalSpecialtyOptions,
  provinceOptions,
} from "../../constants/options";
import {
  RegistrationData,
  useRegistrationStore,
} from "@/domains/auth/state/useRegistrationStore";
import { toFormikValidationSchema } from "zod-formik-adapter";
import DatePickerInput from "@/components/DatePickerInput";

const MedicalCredentials: React.FC<RegStepProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const { data, merge } = useRegistrationStore();
  const [isClient, setIsClient] = React.useState(false);

  // Ensure component only renders on client to avoid hydration mismatch
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = (values: Step2MedicalCredentialsInput) => {
    merge(values as Partial<RegistrationData>);
    onNext();
  };

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div
        className="mt-4 w-full rounded-[20px] bg-white md:mt-6 md:min-h-[500px] md:w-[950px] md:rounded-[55px] md:px-[75px]"
        style={{ boxShadow: "0px 0px 36.35px 0px #00000008" }}>
        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={totalSteps}
          gradientFrom="#89D7FF"
          gradientTo="#00A8FF"
        />
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="mt-4 w-full rounded-[20px] bg-white md:mt-6 md:min-h-[500px] md:w-[950px] md:rounded-[55px] md:px-[75px]"
      style={{ boxShadow: "0px 0px 36.35px 0px #00000008" }}>
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        gradientFrom="#89D7FF"
        gradientTo="#00A8FF"
      />

      <Formik
        initialValues={{
          ...step2InitialValues,
          medicalSpecialty: data.medicalSpecialty,
          licenseNumber: data.licenseNumber,
          provinceOfLicensure: data.provinceOfLicensure,
          licenseExpiryDate: data.licenseExpiryDate,
          medicalLicense: data.medicalLicense,
          cvResume: data.cvResume,
        }}
        validationSchema={toFormikValidationSchema(
          step2MedicalCredentialsSchema
        )}
        onSubmit={handleSubmit}
        validateOnChange={false}
        validateOnBlur={false}>
        {({ values, errors, handleChange, setFieldValue, submitForm }) => {
          return (
            <Form>
              <div className="space-y-4 px-4 pb-8 md:space-y-6 md:px-0">
                <div className="text-center">
                  <h3 className="mt-4 mb-2 text-center text-[22px] font-medium text-[#140047] md:mt-5 md:mb-0 md:text-[28px]">
                    Enter Your Medical Credentials
                  </h3>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-x-14 gap-y-6 md:mt-8 md:grid-cols-2">
                  {/* <div className="space-y-2">
                    <Dropdown
                      id="medicalSpecialty"
                      label="Medical Specialties"
                      value={values.medicalSpecialty}
                      onChange={(value) => {
                        if (Array.isArray(value)) {
                          setFieldValue("medicalSpecialty", value);
                        } else {
                          setFieldValue("medicalSpecialty", [value]);
                        }
                      }}
                      multiSelect={true}
                      options={medicalSpecialtyOptions}
                      required
                      placeholder="Select Specialty"
                    />
                    {errors.medicalSpecialty && (
                      <p className="text-xs text-red-500">
                        {errors.medicalSpecialty}
                      </p>
                    )}
                  </div> */}
                  <div className="space-y-2">
                    <Dropdown
                      id="medicalSpecialty"
                      label="Medical Specialties"
                      value={values.medicalSpecialty}
                      onChange={(v) => {
                        if (Array.isArray(v)) {
                          setFieldValue("medicalSpecialty", v);
                        } else {
                          setFieldValue("medicalSpecialty", [v]);
                        }
                      }}
                      options={medicalSpecialtyOptions}
                      required
                      placeholder="Select Specialty"
                      multiSelect={true}
                    />
                    {errors.medicalSpecialty && (
                      <p className="text-xs text-red-500">
                        {errors.medicalSpecialty}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber" className="text-black">
                      License Number<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      name="licenseNumber"
                      icon={FileText}
                      placeholder="Enter License Number"
                      value={values.licenseNumber}
                      onChange={handleChange}
                    />
                    {errors.licenseNumber && (
                      <p className="text-xs text-red-500">
                        {errors.licenseNumber}
                      </p>
                    )}
                  </div>

                  <Dropdown
                    id="provinceOfLicensure"
                    label="Province of Licensure"
                    value={values.provinceOfLicensure}
                    onChange={(v) => setFieldValue("provinceOfLicensure", v)}
                    options={provinceOptions}
                    required
                    placeholder="Select Province"
                    error={errors.provinceOfLicensure}
                  />

                  <div className="space-y-2">
                    <DatePickerInput
                      name="licenseExpiryDate"
                      label="License Expiry Date"
                      placeholder="December 31, 2025"
                      value={values.licenseExpiryDate}
                      onChange={(date) => {
                        const dateString = date ? date.toISOString() : "";
                        setFieldValue("licenseExpiryDate", dateString);
                      }}
                      error={errors.licenseExpiryDate}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <FileUploadInput
                      name="medicalLicense"
                      label="Upload Medical License"
                      value={values.medicalLicense}
                      onChange={(file) => {
                        setFieldValue("medicalLicense", file);
                      }}
                      accept=".pdf,.doc,.docx"
                      required
                      placeholder="Upload Medical License"
                      error={errors.medicalLicense}
                    />
                  </div>

                  <div className="space-y-2">
                    <FileUploadInput
                      name="cvResume"
                      label="Upload CV / Resume"
                      value={values.cvResume}
                      onChange={(file) => {
                        setFieldValue("cvResume", file);
                      }}
                      accept=".pdf,.doc,.docx"
                      required
                      placeholder="Upload CV / Resume"
                      error={errors.cvResume}
                    />
                  </div>
                </div>

                <div className="mt-10 flex justify-between md:mt-8">
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
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default MedicalCredentials;
