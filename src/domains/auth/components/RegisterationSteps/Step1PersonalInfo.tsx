"use client";
import React, { useState } from "react";
import { Formik, Form, FormikHelpers } from "formik";
import { Input, Label } from "@/components/ui";
import { Mail, MapPin, Phone, User } from "lucide-react";
import {
  Dropdown,
  BackButton,
  ContinueButton,
  ProgressIndicator,
} from "@/components";
import {
  useRegistrationStore,
  RegistrationData,
} from "@/domains/auth/state/useRegistrationStore";
import { RegStepProps } from "@/domains/auth/types/index";
import { provinceOptions } from "@/shared/config/register/ProvinceDropdownOptions";
import { step1InitialValues } from "@/domains/auth/constants/initialValues";
import {
  step1PersonalInfoSchema,
  Step1PersonalInfoInput,
} from "@/domains/auth/schemas/auth.schemas";
import { toFormikValidationSchema } from "zod-formik-adapter";
import authActions from "../../actions";

export const Step1PersonalInfo: React.FC<RegStepProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const { data, merge } = useRegistrationStore();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    values: Step1PersonalInfoInput,
    helpers: FormikHelpers<Step1PersonalInfoInput>
  ) => {
    setLoading(true);
    try {
      const { exists } = await authActions.checkUserExists(values.emailAddress);
      if (exists) {
        helpers.setFieldError(
          "emailAddress",
          "An account with this email already exists"
        );
      } else {
        merge(values as Partial<RegistrationData>);
        onNext();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="mt-4 w-full rounded-[20px] bg-white md:mt-6 md:min-h-[500px] md:w-[950px] md:rounded-[55px] md:px-[75px]"
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
          ...step1InitialValues,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          emailAddress: data.emailAddress,
          provinceOfResidence: data.provinceOfResidence,
          mailingAddress: data.mailingAddress,
        }}
        validationSchema={toFormikValidationSchema(step1PersonalInfoSchema)}
        onSubmit={handleSubmit}
        validateOnChange={false}
        validateOnBlur={false}
        enableReinitialize
      >
        {({ values, errors, handleChange, setFieldValue, submitForm }) => {
          return (
            <Form>
              <div className="space-y-6 px-4 pb-8 md:px-0">
                <div className="pt-1 md:pt-0">
                  <h3 className="mt-4 mb-2 text-center text-[22px] font-medium text-[#140047] md:mt-5 md:mb-0 md:text-[28px]">
                    Enter Your Personal Details
                  </h3>
                  <div className="mt-6 grid grid-cols-1 gap-x-14 gap-y-5 md:mt-8 md:grid-cols-2">
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
                        <p className="text-xs text-red-500">
                          {errors.firstName}
                        </p>
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
                        <p className="text-xs text-red-500">
                          {errors.lastName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="phoneNumber"
                        className="text-sm text-black"
                      >
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
                        <p className="text-xs text-red-500">
                          {errors.phoneNumber}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="emailAddress"
                        className="text-sm text-black"
                      >
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

                    <Dropdown
                      id="provinceOfResidence"
                      label="Province of Residence"
                      value={values.provinceOfResidence}
                      onChange={(v) => {
                        if (Array.isArray(v)) {
                          setFieldValue("provinceOfResidence", v[0]);
                        } else {
                          setFieldValue("provinceOfResidence", v);
                        }
                      }}
                      options={provinceOptions}
                      required
                      placeholder="Select Province"
                      error={errors.provinceOfResidence}
                    />

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
                    loading={loading}
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
