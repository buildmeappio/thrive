"use client";
import React, { useRef } from "react";
import { Formik, Form } from "formik";
import { Input } from "~/components/ui/input";
import { FileText, Upload, Calendar, MapPin } from "lucide-react";
import { Label } from "~/components/ui/label";
import { Dropdown } from "~/components/ui/Dropdown";
import { medicalSpecialtyOptions } from "~/config/medicalExaminerRegister/MedicalSpecialtyDropdownOptions";
import ContinueButton from "~/components/ui/ContinueButton";
import BackButton from "~/components/ui/BackButton";
import type { MedExaminerRegStepProps } from "~/types";
import {
  step2MedicalCredentialsSchema,
  step2InitialValues,
} from "~/validation/medicalExaminer/examinerRegisterValidation";
import ProgressIndicator from "../progressIndicator/ProgressIndicator";

export const Step2MedicalCredentials: React.FC<MedExaminerRegStepProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const medicalLicenseRef = useRef<HTMLInputElement>(null);
  const cvResumeRef = useRef<HTMLInputElement>(null);
  const licenseExpiryRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (values: typeof step2InitialValues) => {
    console.log("Step 2 Form Data:", values);
    onNext();
  };
  const handleMedicalLicenseClick = (setFieldValue: any) => () => {
    medicalLicenseRef.current?.click();
  };

  const handleCvResumeClick = (setFieldValue: any) => () => {
    cvResumeRef.current?.click();
  };

  const handleLicenseExpiryClick = () => {
    licenseExpiryRef.current?.showPicker();
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
        initialValues={step2InitialValues}
        validationSchema={step2MedicalCredentialsSchema}
        onSubmit={handleSubmit}
        validateOnChange={false}
        validateOnBlur={false}
      >
        {({ values, errors, handleChange, setFieldValue, submitForm }) => (
          <Form>
            <div className="space-y-4 px-4 pb-8 md:space-y-6 md:px-0">
              <div className="text-center">
                <h3 className="mt-4 mb-2 text-center text-[22px] font-medium text-[#140047] md:mt-5 md:mb-0 md:text-[28px]">
                  Enter Your Medical Credentials
                </h3>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-x-14 gap-y-6 md:mt-8 md:grid-cols-2">
                <div className="space-y-2">
                  <Dropdown
                    id="medicalSpecialty"
                    label="Medical Specialties"
                    value={values.medicalSpecialty}
                    onChange={(value) =>
                      setFieldValue("medicalSpecialty", value)
                    }
                    options={medicalSpecialtyOptions}
                    required={true}
                    placeholder="Select Specialty"
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

                <div className="space-y-2">
                  <Label htmlFor="provinceOfLicensure" className="text-black">
                    Province of Licensure<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="provinceOfLicensure"
                    icon={MapPin}
                    placeholder="Enter Province"
                    value={values.provinceOfLicensure}
                    onChange={handleChange}
                  />
                  {errors.provinceOfLicensure && (
                    <p className="text-xs text-red-500">
                      {errors.provinceOfLicensure}
                    </p>
                  )}
                </div>

                <div className="space-y-2" onClick={handleLicenseExpiryClick}>
                  <Label htmlFor="licenseExpiryDate" className="text-black">
                    License Expiry Date<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    ref={licenseExpiryRef}
                    name="licenseExpiryDate"
                    icon={Calendar}
                    type="date"
                    placeholder="December 31, 2025"
                    value={values.licenseExpiryDate}
                    onChange={handleChange}
                  />
                  {errors.licenseExpiryDate && (
                    <p className="text-xs text-red-500">
                      {errors.licenseExpiryDate}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicalLicense" className="text-black">
                    Upload Medical License
                    <span className="text-red-500">*</span>
                  </Label>
                  <div>
                    <Input
                      onClick={handleMedicalLicenseClick(setFieldValue)}
                      icon={Upload}
                      type="text"
                      placeholder="Upload Medical License"
                      value={
                        values.medicalLicense ? values.medicalLicense.name : ""
                      }
                      readOnly
                    />
                    {/* Hidden real file input. */}
                    <input
                      type="file"
                      ref={medicalLicenseRef}
                      accept=".pdf,.doc,.docx"
                      style={{ display: "none" }}
                      onChange={(e) =>
                        setFieldValue(
                          "medicalLicense",
                          e.target.files?.[0] || null,
                        )
                      }
                    />
                  </div>
                  {errors.medicalLicense && (
                    <p className="text-xs text-red-500">
                      {errors.medicalLicense}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvResume" className="text-black">
                    Upload CV / Resume<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    onClick={handleCvResumeClick(setFieldValue)}
                    icon={Upload}
                    placeholder="Upload CV / Resume"
                    value={values.cvResume ? values.cvResume.name : ""}
                    readOnly
                  />

                  {/* Hidden real file input */}
                  <input
                    type="file"
                    ref={cvResumeRef}
                    accept=".pdf,.doc,.docx"
                    style={{ display: "none" }}
                    onChange={(e) =>
                      setFieldValue("cvResume", e.target.files?.[0] || null)
                    }
                  />
                  {errors.cvResume && (
                    <p className="text-xs text-red-500">{errors.cvResume}</p>
                  )}
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
        )}
      </Formik>
    </div>
  );
};
