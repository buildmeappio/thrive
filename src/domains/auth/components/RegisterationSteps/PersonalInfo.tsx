"use client";
import React, { useEffect } from "react";
import { Input } from "@/components/ui";
import { Mail, User } from "lucide-react";
import { ContinueButton, ProgressIndicator } from "@/components";
import {
  useRegistrationStore,
  RegistrationData,
} from "@/domains/auth/state/useRegistrationStore";
import { RegStepProps } from "@/domains/auth/types/index";
import { step1InitialValues } from "@/domains/auth/constants/initialValues";
import {
  step1PersonalInfoSchema,
  Step1PersonalInfoInput,
} from "@/domains/auth/schemas/auth.schemas";
import authActions from "../../actions";
import ErrorMessages from "@/constants/ErrorMessages";
import {
  FormProvider,
  FormField,
  FormDropdown,
  FormPhoneInput,
  FormGoogleMapsInput,
} from "@/components/form";
import { UseFormRegisterReturn } from "@/lib/form";
import { useForm } from "@/hooks/use-form-hook";
import { provinceOptions } from "@/constants/options";

const PersonalInfo: React.FC<RegStepProps> = ({
  onNext,
  currentStep,
  totalSteps,
}) => {
  const { data, merge, isEditMode } = useRegistrationStore();

  const form = useForm<Step1PersonalInfoInput>({
    schema: step1PersonalInfoSchema,
    defaultValues: {
      ...step1InitialValues,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      emailAddress: data.emailAddress,
      provinceOfResidence: data.provinceOfResidence,
      mailingAddress: data.mailingAddress,
    },
    mode: "onSubmit",
  });

  // Reset form when store data changes
  useEffect(() => {
    form.reset({
      ...step1InitialValues,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      emailAddress: data.emailAddress,
      provinceOfResidence: data.provinceOfResidence,
      mailingAddress: data.mailingAddress,
    });
  }, [
    data.firstName,
    data.lastName,
    data.phoneNumber,
    data.emailAddress,
    data.provinceOfResidence,
    data.mailingAddress,
    form,
  ]);

  const onSubmit = async (values: Step1PersonalInfoInput) => {
    try {
      // Skip email validation in edit mode since the user already exists
      if (!isEditMode) {
        const { exists } = await authActions.checkUserExists(
          values.emailAddress
        );
        if (exists) {
          form.setError("emailAddress", {
            type: "manual",
            message: ErrorMessages.ACCOUNT_ALREADY_EXISTS,
          });
          return;
        }
      }

      merge(values as Partial<RegistrationData>);
      onNext();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      className="mt-4 w-full rounded-[20px] bg-white md:mt-6 md:w-[950px] md:rounded-[55px] md:px-[75px]"
      style={{ boxShadow: "0px 0px 36.35px 0px #00000008" }}>
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        gradientFrom="#89D7FF"
        gradientTo="#00A8FF"
      />
      <FormProvider form={form} onSubmit={onSubmit}>
        <div className="space-y-6 px-4 pb-8 md:px-0">
          <div className="pt-1 md:pt-0">
            <h3 className="mt-4 mb-2 text-center text-[22px] font-normal text-[#140047] md:mt-5 md:mb-0 md:text-[28px]">
              Enter Your Personal Details
            </h3>
            <div className="mt-6 grid grid-cols-1 gap-x-14 gap-y-5 md:mt-8 md:grid-cols-2">
              <FormField name="firstName" label="First Name" required>
                {(field: UseFormRegisterReturn & { error?: boolean }) => (
                  <Input
                    {...field}
                    id="firstName"
                    icon={User}
                    placeholder="Dr. Sarah"
                  />
                )}
              </FormField>

              <FormField name="lastName" label="Last Name" required>
                {(field: UseFormRegisterReturn & { error?: boolean }) => (
                  <Input
                    {...field}
                    id="lastName"
                    icon={User}
                    placeholder="Ahmed"
                  />
                )}
              </FormField>

              <FormPhoneInput
                name="phoneNumber"
                label="Phone Number"
                required
              />

              <FormField
                name="emailAddress"
                label="Email Address"
                required
                hint={
                  isEditMode ? "Email address cannot be changed" : undefined
                }>
                {(field: UseFormRegisterReturn & { error?: boolean }) => (
                  <Input
                    {...field}
                    id="emailAddress"
                    icon={Mail}
                    type="email"
                    placeholder="john.doe@example.com"
                    disabled={isEditMode}
                    className={
                      isEditMode ? "bg-gray-100 cursor-not-allowed" : ""
                    }
                  />
                )}
              </FormField>

              <FormDropdown
                name="provinceOfResidence"
                label="Province of Residence"
                options={provinceOptions}
                required
                placeholder="Select Province"
                icon={null}
              />

              <FormGoogleMapsInput
                name="mailingAddress"
                label="Mailing Address"
                placeholder="125 Bay Street, Suite 600, Toronto, ON"
                required
              />
            </div>
          </div>

          <div className="mt-8 flex flex-row justify-start gap-4 md:justify-between">
            <div />
            <ContinueButton
              onClick={form.handleSubmit(onSubmit)}
              isLastStep={currentStep === totalSteps}
              gradientFrom="#89D7FF"
              gradientTo="#00A8FF"
              disabled={form.formState.isSubmitting}
              loading={form.formState.isSubmitting}
            />
          </div>
        </div>
      </FormProvider>
    </div>
  );
};

export default PersonalInfo;
