import React from "react";
import { Formik, Form } from "formik";
import { Input } from "~/components/ui/input";
import { User, Phone, Mail, MapPin } from "lucide-react";
import { Label } from "~/components/ui/label";
import { Dropdown } from "~/components/ui/Dropdown";
import { provinceOptions } from "~/config/medicalExaminerRegister/ProvinceDropdownOptions";
import ContinueButton from "~/components/ui/ContinueButton";
import BackButton from "~/components/ui/BackButton";
import type { MedExaminerRegStepProps } from "~/types";
import {
  step1PersonalInfoSchema,
  step1InitialValues,
} from "~/validation/medicalExaminer/examinerRegisterValidation";

export const Step1PersonalInfo: React.FC<MedExaminerRegStepProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const handleSubmit = (values: typeof step1InitialValues) => {
    console.log("Step 1 Form Data:", values);
    onNext();
  };

  return (
    <Formik
      initialValues={step1InitialValues}
      validationSchema={step1PersonalInfoSchema}
      onSubmit={handleSubmit}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ values, errors, handleChange, setFieldValue, submitForm }) => (
        <Form>
          <div className="space-y-6 px-4 pb-8 md:px-0">
            <div className="pt-1 md:pt-0">
              <h3 className="mt-4 mb-2 text-center text-2xl font-medium text-[#140047] md:mt-10 md:mb-0 md:text-2xl">
                Enter Your Personal Details
              </h3>
              <div className="mt-0 grid grid-cols-1 gap-x-14 gap-y-5 md:mt-8 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm text-black">
                    First Name<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="firstName"
                    icon={User}
                    placeholder="Dr. Sarah"
                    value={values.firstName}
                    onChange={handleChange}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-red-500">{errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm text-black">
                    Last Name<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="lastName"
                    icon={User}
                    placeholder="Ahmed"
                    value={values.lastName}
                    onChange={handleChange}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-red-500">{errors.lastName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-sm text-black">
                    Phone Number<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="phoneNumber"
                    icon={Phone}
                    type="tel"
                    placeholder="(647) 555-1923"
                    value={values.phoneNumber}
                    onChange={handleChange}
                  />
                  {errors.phoneNumber && (
                    <p className="text-xs text-red-500">{errors.phoneNumber}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailAddress" className="text-sm text-black">
                    Email Address<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="emailAddress"
                    icon={Mail}
                    type="email"
                    placeholder="s.ahmed@precisionmed.ca"
                    value={values.emailAddress}
                    onChange={handleChange}
                  />
                  {errors.emailAddress && (
                    <p className="text-xs text-red-500">
                      {errors.emailAddress}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Dropdown
                    id="provinceOfResidence"
                    label="Province of Residence"
                    value={values.provinceOfResidence}
                    onChange={(value) =>
                      setFieldValue("provinceOfResidence", value)
                    }
                    options={provinceOptions}
                    required={true}
                    placeholder="Select Province"
                  />
                  {errors.provinceOfResidence && errors.provinceOfResidence && (
                    <p className="text-xs text-red-500">
                      {errors.provinceOfResidence}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="mailingAddress"
                    className="text-sm text-black"
                  >
                    Mailing Address<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="mailingAddress"
                    icon={MapPin}
                    placeholder="125 Bay Street, Suite 600"
                    value={values.mailingAddress}
                    onChange={handleChange}
                  />
                  {errors.mailingAddress && (
                    <p className="text-xs text-red-500">
                      {errors.mailingAddress}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-row justify-start gap-4 md:justify-between">
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
  );
};
