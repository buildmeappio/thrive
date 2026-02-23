"use client";
import React from "react";
import { Input } from "@/components/ui";
import { Mail, MapPin, User, PhoneCall, Languages } from "lucide-react";
import {
  ContinueButton,
  ProgressIndicator,
  SaveAndContinueButton,
} from "@/components";
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
  FormPhoneInput,
  FormDropdown,
} from "@/components/form";
import { UseFormRegisterReturn } from "@/lib/form";
import { useForm } from "@/hooks/use-form-hook";
import { provinces } from "@/constants/options";
import {
  useLanguages,
  useCityProvinceLogic,
  useRegistrationFormReset,
  useFormCompletion,
  useAutofillDetection,
  useSaveApplicationProgress,
} from "@/domains/auth/hooks";

const PersonalInfo: React.FC<RegStepProps> = ({
  onNext,
  currentStep,
  totalSteps,
}) => {
  const { data, merge, isEditMode } = useRegistrationStore();
  const { saveProgress, isSaving } = useSaveApplicationProgress();
  const { languages, loading: loadingLanguages } = useLanguages();

  const defaultValues = {
    ...step1InitialValues,
    firstName: data.firstName,
    lastName: data.lastName,
    phoneNumber: data.phoneNumber,
    emailAddress: data.emailAddress,
    landlineNumber: data.landlineNumber,
    city: data.city || "",
    province: data.province || "",
    languagesSpoken: data.languagesSpoken || [],
  };

  const form = useForm<Step1PersonalInfoInput>({
    schema: step1PersonalInfoSchema,
    defaultValues,
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    shouldUnregister: false,
  });

  // Reset form when store data changes (but preserve errors if form has been submitted)
  useRegistrationFormReset({
    form,
    defaultValues,
    watchFields: [
      "firstName",
      "lastName",
      "phoneNumber",
      "emailAddress",
      "landlineNumber",
      "city",
      "province",
      "languagesSpoken",
    ],
    keepErrors: true,
  });

  const onSubmit = async (values: Step1PersonalInfoInput) => {
    try {
      // Skip email validation in edit mode since the user already exists
      if (!isEditMode) {
        const { exists } = await authActions.checkUserExists(
          values.emailAddress,
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

  // Watch province for city/province logic
  const province = form.watch("province");
  const city = form.watch("city");

  // Handle city/province dependency
  const { cityOptions } = useCityProvinceLogic({
    form,
    province,
    currentCity: city,
  });

  // Detect autofill for form fields
  useAutofillDetection({
    form,
    watchedFields: [
      "firstName",
      "lastName",
      "emailAddress",
      "phoneNumber",
      "landlineNumber",
      "city",
      "province",
    ],
  });

  // Check if form is complete
  const { isFormComplete } = useFormCompletion({
    form,
    requiredFields: [
      "firstName",
      "lastName",
      "emailAddress",
      "phoneNumber",
      "landlineNumber",
      "city",
      "province",
      "languagesSpoken",
    ],
  });

  return (
    <div
      className="mt-1 w-full rounded-[20px] bg-white md:mt-6 md:w-[950px] md:rounded-[55px] md:px-[75px]"
      style={{ boxShadow: "0px 0px 36.35px 0px #00000008" }}
    >
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        gradientFrom="#89D7FF"
        gradientTo="#00A8FF"
      />
      <FormProvider form={form} onSubmit={onSubmit}>
        <div className="space-y-4 pb-6 md:px-0">
          <div className="pt-0 md:pt-0">
            <h3 className="mt-2 mb-0 text-center text-[22px] font-medium text-[#140047] md:mt-5 md:mb-0 md:text-[28px]">
              Enter Your Personal Details
            </h3>
            <div className="mt-2 md:px-0 px-8 grid grid-cols-1 gap-x-12 gap-y-2 md:mt-6 md:grid-cols-2">
              {/* Row 1: First Name, Last Name */}
              <FormField name="firstName" label="First Name" required>
                {(field: UseFormRegisterReturn & { error?: boolean }) => (
                  <Input
                    {...field}
                    id="firstName"
                    icon={User}
                    placeholder="Enter your first name"
                    validationType="name"
                    onBlur={(e) => {
                      field.onBlur(e);
                      // Trigger validation after blur to ensure errors clear
                      setTimeout(() => {
                        form.trigger("firstName");
                      }, 0);
                    }}
                  />
                )}
              </FormField>

              <FormField name="lastName" label="Last Name" required>
                {(field: UseFormRegisterReturn & { error?: boolean }) => (
                  <Input
                    {...field}
                    id="lastName"
                    icon={User}
                    placeholder="Enter your last name"
                    validationType="name"
                    onBlur={(e) => {
                      field.onBlur(e);
                      // Trigger validation after blur to ensure errors clear
                      setTimeout(() => {
                        form.trigger("lastName");
                      }, 0);
                    }}
                  />
                )}
              </FormField>

              {/* Row 2: Email Address, Languages Spoken */}
              <FormField name="emailAddress" label="Email Address" required>
                {(field: UseFormRegisterReturn & { error?: boolean }) => (
                  <Input
                    {...field}
                    id="emailAddress"
                    icon={Mail}
                    type="email"
                    placeholder="Enter your email address"
                  />
                )}
              </FormField>

              <FormDropdown
                name="languagesSpoken"
                label="Languages Spoken"
                required
                options={languages}
                placeholder={
                  loadingLanguages ? "Loading languages..." : "Select languages"
                }
                multiSelect={true}
                icon={<Languages size={16} color="#A4A4A4" strokeWidth={2} />}
                disabled={loadingLanguages}
              />

              {/* Row 3: Province, City */}
              <FormDropdown
                name="province"
                label="Province"
                required
                options={provinces}
                placeholder="Select Province"
                icon={<MapPin size={16} color="#A4A4A4" strokeWidth={2} />}
              />

              <FormDropdown
                name="city"
                label="City"
                required
                options={cityOptions}
                placeholder={province ? "Select City" : "Select Province first"}
                icon={<MapPin size={16} color="#A4A4A4" strokeWidth={2} />}
                disabled={!province || cityOptions.length === 0}
              />

              {/* Row 4: Work Number, Cell Number */}
              <FormPhoneInput
                name="landlineNumber"
                label="Work Phone"
                required
                icon={PhoneCall}
                placeholder="Enter your work number"
              />

              <FormPhoneInput
                name="phoneNumber"
                label="Cell Phone"
                required
                placeholder="Enter your cell number"
              />
            </div>
          </div>

          <div className="mt-3 flex flex-row justify-center gap-3 px-2 md:mt-5 md:justify-end md:gap-4 md:px-0">
            <SaveAndContinueButton
              onClick={() => {
                // Get current form values and save them along with store data
                const currentValues = form.getValues();
                saveProgress(currentValues as Partial<RegistrationData>);
              }}
              loading={isSaving}
              disabled={isSaving || form.formState.isSubmitting}
            />
            <ContinueButton
              onClick={form.handleSubmit(onSubmit)}
              isLastStep={currentStep === totalSteps}
              gradientFrom="#89D7FF"
              gradientTo="#00A8FF"
              disabled={!isFormComplete || form.formState.isSubmitting}
              loading={form.formState.isSubmitting}
            />
          </div>
        </div>
      </FormProvider>
    </div>
  );
};

export default PersonalInfo;
